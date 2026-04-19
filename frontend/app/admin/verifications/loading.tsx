export default function AdminVerificationsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 space-y-2 animate-pulse">
        <div className="h-7 w-48 rounded-md bg-muted" />
        <div className="h-4 w-64 rounded-md bg-muted" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border animate-pulse">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["Tên người nộp", "Email", "Ngày nộp", "Số loại giấy tờ", "Thao tác"].map(
                (col) => (
                  <th key={col} className="px-4 py-3 text-left">
                    <div className="h-4 w-20 rounded bg-muted-foreground/20" />
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[1, 2, 3].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5].map((col) => (
                  <td key={col} className="px-4 py-3">
                    <div className="h-4 w-24 rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
