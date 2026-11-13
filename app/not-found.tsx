import Link from 'next/link';
import { ArrowLeft, Dna } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-stone-200 dark:border-purple-500/25 bg-white dark:bg-[#120922]/90 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-gradient-to-br dark:from-fuchsia-500/25 dark:to-purple-600/25 border border-orange-200 dark:border-fuchsia-400/30 text-[#ea580c] dark:text-fuchsia-300">
          <Dna className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-stone-600 dark:text-purple-200/75 mb-6">
          Return to da7ee7-biology to continue checking Cambridge IGCSE Biology (0610) papers or chatting with Biology DA7EE7.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] dark:from-fuchsia-500 dark:to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 dark:shadow-fuchsia-500/20 hover:opacity-95 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to da7ee7-biology
        </Link>
      </div>
    </main>
  );
}
