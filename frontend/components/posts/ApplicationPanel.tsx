"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { applyForPost, selectApplicant } from "@/lib/api/applications";
import type { Application } from "@/types/application";
import type { UserRole } from "@/types/enums";
import { User } from "lucide-react";

interface Props {
  postId: string;
  postStatus: string;
  applications: Application[];
  isAuthor: boolean;
  viewerRole: UserRole | null;
  viewerId: string | null;
}

export function ApplicationPanel({
  postId,
  postStatus,
  applications,
  isAuthor,
  viewerRole,
  viewerId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const hasApplied = applications.some(
    (a) => (typeof a.applicant === "string" ? a.applicant : a.applicant._id) === viewerId
  );

  const canApply =
    viewerId !== null &&
    !isAuthor &&
    postStatus === "available" &&
    !hasApplied &&
    (viewerRole === "individual" || viewerRole === "ngo");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await applyForPost(postId, message.trim());
      setShowForm(false);
      setMessage("");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(applicantId: string) {
    if (!confirm("Bạn có chắc chọn người nhận này?")) return;
    setLoading(true);
    try {
      await selectApplicant(postId, applicantId);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="font-medium text-foreground">
        Người muốn nhận ({applications.length})
      </h3>

      {/* Apply button / form */}
      {canApply && !showForm && (
        <Button className="w-full" onClick={() => setShowForm(true)}>
          Xin nhận đồ
        </Button>
      )}
      {hasApplied && (
        <p className="text-sm text-green-600">Bạn đã gửi yêu cầu nhận đồ</p>
      )}

      {showForm && (
        <form onSubmit={handleApply} className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Lời nhắn (tuỳ chọn)..."
            className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              Gửi
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} disabled={loading}>
              Huỷ
            </Button>
          </div>
        </form>
      )}

      {/* Application list */}
      {applications.length > 0 && (
        <ul className="divide-y divide-border">
          {applications.map((app) => {
            const applicant = typeof app.applicant === "string" ? null : app.applicant;
            return (
              <li key={app._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {applicant?.name ?? "Ẩn danh"}
                      {applicant?.role === "ngo" && (
                        <span className="ml-1 text-blue-500" title="NGO">✓</span>
                      )}
                    </p>
                    {app.message && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{app.message}</p>
                    )}
                    {app.status === "selected" && (
                      <span className="text-xs font-medium text-green-600">Đã chọn</span>
                    )}
                    {app.status === "rejected" && (
                      <span className="text-xs text-red-500">Bị từ chối</span>
                    )}
                  </div>
                </div>
                {isAuthor && postStatus === "available" && app.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleSelect(typeof app.applicant === "string" ? app.applicant : app.applicant._id)}
                    disabled={loading}
                  >
                    Chọn
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!viewerId && postStatus === "available" && (
        <p className="text-sm text-muted-foreground text-center">
          <a href="/login" className="text-primary-600 hover:underline">Đăng nhập</a> để nhận đồ
        </p>
      )}
    </div>
  );
}
