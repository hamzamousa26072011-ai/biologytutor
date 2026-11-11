import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Biology Tutor — Cambridge IGCSE 0610',
  description:
    'Automatic Cambridge IGCSE Biology (0610) Exam Question Checker, Multi-Page Mark Scheme Grader, and AI Biology Subject Tutor.',
  openGraph: {
    title: 'Biology Tutor — Cambridge IGCSE 0610',
    description:
      'Automatic Cambridge IGCSE Biology (0610) Exam Question Checker, Multi-Page Mark Scheme Grader, and AI Biology Subject Tutor.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biology Tutor — Cambridge IGCSE 0610',
    description:
      'Automatic Cambridge IGCSE Biology (0610) Exam Question Checker, Multi-Page Mark Scheme Grader, and AI Biology Subject Tutor.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased selection:bg-purple-500/30 dark:bg-[#06050b] dark:text-slate-100 bg-[#F8F6F1] text-[#1C1917] min-h-dvh transition-colors duration-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
