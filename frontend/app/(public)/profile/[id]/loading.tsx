export default function ProfileLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="h-4 w-32 rounded bg-muted animate-pulse mb-4" />
        <div className="h-4 w-full rounded bg-muted animate-pulse mb-2" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      </div>
    </main>
  );
}
