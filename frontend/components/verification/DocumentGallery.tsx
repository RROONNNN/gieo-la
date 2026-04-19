import type { VerificationDocument } from "@/types/verification";

interface DocumentGalleryProps {
  documents: VerificationDocument[];
}

interface DocumentGroup {
  label: string;
  urls: string[];
}

function groupDocuments(documents: VerificationDocument[]): DocumentGroup[] {
  const grouped = new Map<string, string[]>();

  for (const doc of documents) {
    const key = doc.label ?? "Không có tên";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(doc.url);
  }

  return Array.from(grouped.entries()).map(([label, urls]) => ({ label, urls }));
}

function resolveUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "";
  return `${base}${url}`;
}

export default function DocumentGallery({ documents }: DocumentGalleryProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Không có ảnh minh chứng.</p>
    );
  }

  const groups = groupDocuments(documents);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            {group.label}
          </h4>
          {group.urls.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có ảnh</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {group.urls.map((url, idx) => {
                const resolved = resolveUrl(url);
                return (
                  <a
                    key={idx}
                    href={resolved}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-md border border-border hover:opacity-90"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolved}
                      alt={`${group.label} - ảnh ${idx + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
