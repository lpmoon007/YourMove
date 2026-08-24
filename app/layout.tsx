import type { Metadata, Viewport } from 'next';
import './yourmove.css';

export const metadata: Metadata = {
  title: 'Your Move',
  description: 'Type anything. The world answers with what actually follows.',
};

export const viewport: Viewport = {
  themeColor: '#0c0d10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <div className="ymui">{children}</div>
      </body>
    </html>
  );
}
