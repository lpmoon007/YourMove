// ADAPTIVE WORLDS — the simulation core, as used by Your Move.
//
// Pure TypeScript: state in, deltas out, no I/O (convergence brief 9.5). Everything with
// a network or a database in it lives outside this directory — model/ for the two model
// calls, store/ for persistence — so the whole engine is testable and replayable, and
// the integrity suite runs with no key and no database.
//
// The twelve-measurement LFS overlay is deliberately NOT re-exported here. It is not part
// of the simulation; import it explicitly from './lens/lfs12' at the one console surface
// that is allowed to ask for it.

export * from './types';
export { Rng, seededId, type RngSnapshot } from './rng';
export { evalPred, predRefs, type Pred, type PredContext } from './predicate';
export {
  SCHEMA_VERSION,
  ENGINE_RULESET_VERSION,
  assertLoadable,
  comparable,
  validateScenarioPackage,
  versionsFor,
  type ScenarioPackage,
  type ValidationIssue,
  type VerbDef,
  type FactDef,
  type DiscoveryPath,
  type InjectDef,
  type WorldProcessDef,
  type ResolutionOverride,
  type OutcomeDimension,
  type ContentDescriptors,
} from './package';
export { TruthLayer } from './truth';
export { EventSpine, type AppendInput } from './spine';
export { KnowledgeTracker } from './knowledge';
export { WorldStateStore, applyToClone, type ApplyResult } from './state';
export { checkInvariants, type InvariantClass, type Violation, type RejectionLogEntry } from './invariants';
export { World, type WorldCounters, type EndState } from './world';
export { loadWorld, checkSolvable, UnsolvableWorldError, type LoadOptions } from './loader';
export {
  deterministicParse,
  localParser,
  needsClarification,
  CLARIFY_THRESHOLD,
  type IntentParser,
  type ParseInput,
  type ParseSurface,
} from './intent';
export { checkCapability } from './capability';
export { resolve, overrideLoad } from './resolver';
export { applyResolution, applyBlocked, type ConsequenceResult } from './consequence';
export { advance, dueTimers, outOfTime } from './clock';
export { tickProcesses, type ProcessTickResult } from './processes';
export { tickDirector, rescueRate, type DirectorDecision } from './director';
export {
  narrate,
  localNarrate,
  validateNarration,
  fallbackLine,
  type Narrator,
  type NarrationRequest,
  type NarrationOutput,
} from './narrator';
export { takeTurn, checkEnd, type EngineDeps, type TurnResult, type AdjudicationRecord } from './engine';
export {
  serializeWorld,
  restoreWorld,
  SnapshotVersionError,
  type WorldSnapshot,
} from './persistence';
export {
  scoreOutcome,
  buildReveal,
  causalDebrief,
  RunNotOverError,
  type RunOutcome,
  type Reveal,
  type CausalChain,
} from './outcome';
