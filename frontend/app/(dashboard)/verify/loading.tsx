export default function VerifyLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="h-7 w-48 rounded bg-muted animate-pulse mb-6" />

      {/* Status card skeleton */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm mb-6">
        <div className="h-5 w-32 rounded bg-muted animate-pulse mb-3" />
        <div className="h-4 w-full rounded bg-muted animate-pulse mb-2" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      </div>

      {/* Form skeleton */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="h-5 w-40 rounded bg-muted animate-pulse mb-4" />
        <div className="h-20 w-full rounded bg-muted animate-pulse mb-3" />
        <div className="h-20 w-full rounded bg-muted animate-pulse mb-4" />
        <div className="h-9 w-32 rounded bg-muted animate-pulse" />
      </div>
    </main>
  );
}
