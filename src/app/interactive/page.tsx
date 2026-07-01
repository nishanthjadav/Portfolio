import Link from "next/link";

export default function Interactive() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm text-muted mb-3">interactive mode</p>
        <h1 className="text-2xl font-medium mb-2">Coming soon.</h1>
        <p className="text-muted mb-6">Booting up an OS in your browser. Check back later.</p>
        <Link href="/" className="text-sm underline underline-offset-4 hover:text-muted">
          ← Back
        </Link>
      </div>
    </main>
  );
}
