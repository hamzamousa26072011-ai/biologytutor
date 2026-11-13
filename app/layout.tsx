import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'da7ee7-biology | Cambridge IGCSE Biology (0610) Grader & Tutor',
  description:
    'Automatic Cambridge IGCSE Biology (0610) Exam Question Checker, Multi-Page Mark Scheme Grader, and AI Biology Subject Tutor.',
  openGraph: {
    title: 'da7ee7-biology | Cambridge IGCSE Biology (0610) Grader & Tutor',
    description:
      'Automatic Cambridge IGCSE Biology (0610) Exam Question Checker, Multi-Page Mark Scheme Grader, and AI Biology Subject Tutor.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080312',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bio-grid-bg font-sans text-slate-900 dark:text-slate-100 selection:bg-fuchsia-500/30 selection:text-fuchsia-950 dark:selection:text-fuchsia-100">
        {children}
      </body>
    </html>
  );
}
