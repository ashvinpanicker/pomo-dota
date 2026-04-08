import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-tomato/20 border border-tomato/30 flex items-center justify-center text-4xl">
        🍅
      </div>
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Page not found</h1>
        <p className="text-text-secondary mt-2 text-sm">
          Looks like this page went AFK.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-2xl bg-tomato/20 border border-tomato/30 text-tomato font-semibold text-sm hover:bg-tomato/30 transition-colors"
      >
        Back to Timer
      </Link>
    </div>
  );
}
