/*
 * Your Move — the taster, rendered from the world files.
 *
 * The front of the house kept its own copy of the three moves each world opens with, and
 * a copy drifts: rename a verb and the site starts offering a move the engine cannot
 * take, and "enter the full world" becomes a door into nothing. Worse, it was drifting by
 * hand — three separate rounds of "here is the new block, paste it in".
 *
 * So the site holds one script tag and nothing else. This asks the app for every world
 * that has an opening and renders it. A sixth world puts its own taster on the page with
 * no change here and no change there.
 *
 *   <div data-yourmove-openings>
 *     ... whatever is on the page today ...
 *   </div>
 *   <script src="https://YOUR-APP-HOST/embed/openings.js" defer></script>
 *
 * Whatever is already inside the container stays there until the fetch succeeds, so a
 * blip leaves the page reading exactly as it does now rather than blanking it. That is
 * the one thing worse than stale copy.
 *
 * Options, all optional, as attributes on the container:
 *   data-yourmove-openings="the-last-hour"   one world, or several comma-separated
 *   data-yourmove-limit="3"                  at most this many worlds
 *   data-yourmove-heading="h2"               heading level to use for world titles
 *   data-yourmove-styles="off"               render bare markup and style it yourself
 *
 * The API host is taken from this script's own src, so there is nothing to configure and
 * nothing that can point at the wrong deployment.
 */
(function () {
  'use strict';

  // Captured synchronously: document.currentScript is only meaningful while this file is
  // executing, and everything below runs later.
  var self = document.currentScript;
  if (!self || !self.src) return;
  var origin = new URL(self.src).origin;
  var endpoint = origin + '/api/openings';

  // The API builds its "enter" links from how the server perceives its own host, which is
  // a Host header and therefore somebody else's business — a proxy, a preview deployment,
  // a rewrite. This script was pointed at the app by hand, so its own src is the one host
  // known to be right. Keep the path and query the API chose; take the origin from here.
  function enterLink(enter) {
    try {
      var parsed = new URL(enter, origin);
      return origin + parsed.pathname + parsed.search;
    } catch (problem) {
      return null;
    }
  }

  var SELECTOR = '[data-yourmove-openings]';
  var STYLE_ID = 'yourmove-openings-style';

  var CSS =
    SELECTOR + '{--ym-gap:1rem;--ym-radius:10px;--ym-border:rgba(0,0,0,.14);' +
    '--ym-muted:currentColor;--ym-accent:currentColor;font:inherit;color:inherit}' +
    SELECTOR + ' .ym-world{margin:0 0 2.5rem}' +
    SELECTOR + ' .ym-title{margin:0 0 .25rem;font-size:1.25em;line-height:1.2}' +
    SELECTOR + ' .ym-tagline{margin:0 0 .9rem;opacity:.72;font-size:.95em}' +
    SELECTOR + ' .ym-prompt{margin:0 0 1.1rem;line-height:1.55}' +
    SELECTOR + ' .ym-choices{list-style:none;margin:0;padding:0;display:grid;gap:var(--ym-gap);' +
    'grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))}' +
    SELECTOR + ' .ym-choice{margin:0}' +
    SELECTOR + ' .ym-choice a{display:flex;flex-direction:column;gap:.5rem;height:100%;' +
    'padding:1rem 1.1rem;border:1px solid var(--ym-border);border-radius:var(--ym-radius);' +
    'text-decoration:none;color:inherit;background:transparent;transition:border-color .15s,transform .15s}' +
    SELECTOR + ' .ym-choice a:hover,' + SELECTOR + ' .ym-choice a:focus-visible{' +
    'border-color:var(--ym-accent);transform:translateY(-1px)}' +
    SELECTOR + ' .ym-label{font-weight:600;line-height:1.3}' +
    SELECTOR + ' .ym-preview{margin:0;font-size:.92em;line-height:1.5;opacity:.78}' +
    SELECTOR + ' .ym-minutes{margin:.8rem 0 0;font-size:.85em;opacity:.6}' +
    '@media (prefers-reduced-motion:reduce){' + SELECTOR + ' .ym-choice a{transition:none}' +
    SELECTOR + ' .ym-choice a:hover{transform:none}}';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    // textContent throughout: everything here is authored copy, but it arrives over the
    // wire and nothing about a marketing page needs it to be able to inject markup.
    if (text != null) node.textContent = text;
    return node;
  }

  function headingTag(container) {
    var wanted = (container.getAttribute('data-yourmove-heading') || 'h3').toLowerCase();
    return /^h[1-6]$/.test(wanted) ? wanted : 'h3';
  }

  function wantedWorlds(container) {
    var raw = (container.getAttribute('data-yourmove-openings') || '').trim();
    if (!raw) return null;
    return raw
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function renderWorld(world, container) {
    var section = el('section', 'ym-world');
    section.setAttribute('data-world', world.world);

    var heading = el(headingTag(container), 'ym-title', world.title);
    section.appendChild(heading);

    if (world.tagline) section.appendChild(el('p', 'ym-tagline', world.tagline));
    if (world.prompt) section.appendChild(el('p', 'ym-prompt', world.prompt));

    var list = el('ul', 'ym-choices');
    (world.choices || []).forEach(function (choice) {
      var href = enterLink(choice.enter);
      if (!href) return; // a door into nothing is worse than one fewer option
      var item = el('li', 'ym-choice');
      var link = el('a');
      link.href = href;
      link.appendChild(el('span', 'ym-label', choice.label));
      link.appendChild(el('p', 'ym-preview', choice.preview));
      item.appendChild(link);
      list.appendChild(item);
    });
    // Every option's link was unusable. A world card with no way in is just a wall of
    // prose promising a decision the reader cannot make.
    if (!list.childNodes.length) return null;
    section.appendChild(list);

    if (world.estimated_minutes)
      section.appendChild(el('p', 'ym-minutes', 'About ' + world.estimated_minutes + ' minutes.'));

    return section;
  }

  function render(container, openings) {
    var only = wantedWorlds(container);
    var limit = parseInt(container.getAttribute('data-yourmove-limit') || '', 10);

    var chosen = openings.filter(function (w) {
      return !only || only.indexOf(w.world) !== -1;
    });
    if (only)
      chosen.sort(function (a, b) { return only.indexOf(a.world) - only.indexOf(b.world); });
    if (limit > 0) chosen = chosen.slice(0, limit);

    // Nothing matched — a slug was renamed, or this deployment has no tasters. Leave the
    // page as it is rather than replacing real copy with an empty space.
    if (!chosen.length) {
      container.setAttribute('data-yourmove-state', 'empty');
      return;
    }

    if (container.getAttribute('data-yourmove-styles') !== 'off') injectStyles();

    var next = document.createDocumentFragment();
    var rendered = 0;
    chosen.forEach(function (world) {
      var section = renderWorld(world, container);
      if (!section) return;
      next.appendChild(section);
      rendered += 1;
    });

    if (!rendered) {
      container.setAttribute('data-yourmove-state', 'empty');
      return;
    }

    container.textContent = '';
    container.appendChild(next);
    container.setAttribute('data-yourmove-state', 'ready');
  }

  function start() {
    var containers = document.querySelectorAll(SELECTOR);
    if (!containers.length) return;

    for (var i = 0; i < containers.length; i++)
      containers[i].setAttribute('data-yourmove-state', 'loading');

    fetch(endpoint, { credentials: 'omit' })
      .then(function (response) {
        if (!response.ok) throw new Error('openings responded ' + response.status);
        return response.json();
      })
      .then(function (data) {
        var openings = data && data.openings;
        if (!Array.isArray(openings)) throw new Error('openings payload was not a list');
        for (var i = 0; i < containers.length; i++) render(containers[i], openings);
      })
      .catch(function (problem) {
        // Whatever the page already said stays said.
        for (var i = 0; i < containers.length; i++)
          containers[i].setAttribute('data-yourmove-state', 'failed');
        if (window.console && console.warn)
          console.warn('[your move] keeping the copy already on the page:', problem.message);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
