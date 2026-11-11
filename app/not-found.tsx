import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#06050b] px-4 text-center text-white">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-400">
        Return to Biology Tutor (Cambridge IGCSE 0610).
      </p>
      <Link
        href="/"
        className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
      >
        Back to Biology Tutor
      </Link>
    </div>
  );
}
