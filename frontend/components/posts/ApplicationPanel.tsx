"use client";

import { useState } from "react";
import { HandHeart, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { applyForPost } from "@/lib/api/applications";
import type { Application } from "@/types/application";

interface ApplicationPanelProps {
  postId: string;
  postStatus: string;
  postAuthorId: string;
  applications: Application[];
}

const ROLE_LABELS: Record<string, string> = {
  ngo: "Tổ chức",
  individual: "Cá nhân",
  member: "Thành viên",
};

export function ApplicationPanel({
  postId,
  postStatus,
  postAuthorId,
  applications: initialApplications,
}: ApplicationPanelProps) {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState(initialApplications);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAuthor = user?._id === postAuthorId;
  const canApply =
    postStatus === "available" &&
    isAuthenticated &&
    !isAuthor &&
    (user?.role === "ngo" || user?.role === "individual") &&
    user?.verificationStatus === "verified";
  const alreadyApplied = applications.some(
    (app) => {
      const applicantId = typeof app.applicant === "string" ? app.applicant : app.applicant._id;
      return applicantId === user?._id;
    },
  );

  const handleApply = async () => {
    if (!message.trim()) {
      setError("Vui lòng mô tả hoàn cảnh / lý do muốn nhận");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await applyForPost(postId, message);
      setApplications((prev) => [...prev, result.data.application]);
      setSuccess(true);
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Không thể đăng ký nhận đồ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-6">
      {/* CTA section */}
      {postStatus === "available" && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-darker">
            <HandHeart className="size-5" />
            Trở thành người nhận
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Mô tả hoàn cảnh và lý do bạn muốn nhận món đồ này
          </p>

          {canApply && !alreadyApplied && !success && (
            <div className="mt-4 space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mô tả hoàn cảnh / lý do..."
                rows={3}
                className="w-full rounded-lg border border-[var(--border-green)] bg-bg-cream p-3 text-sm outline-none focus:ring-1 focus:ring-brand-dark resize-none"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                onClick={handleApply}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Đang gửi..." : "Đăng ký nhận đồ"}
              </Button>
            </div>
          )}

          {(alreadyApplied || success) && (
            <div className="mt-4 rounded-lg bg-brand-light/30 p-3 text-sm text-brand-dark">
              Bạn đã đăng ký nhận đồ thành công!
            </div>
          )}
        </div>
      )}

      {/* Applications list */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-darker">
          <Users className="size-4" />
          Danh sách đăng ký ({applications.length})
        </h4>

        <div className="mt-3 space-y-3">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có ai đăng ký</p>
          ) : (
            applications.map((app) => {
              const applicant =
                typeof app.applicant === "string" ? null : app.applicant;
              return (
                <div
                  key={app._id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border-green)] p-3"
                >
                  <Avatar
                    src={applicant?.avatar}
                    alt={applicant?.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-darker">
                      {applicant?.name || "Ẩn danh"}
                    </p>
                    <Badge
                      variant={
                        applicant?.role === "ngo"
                          ? "role-ngo"
                          : applicant?.role === "individual"
                            ? "role-individual"
                            : "role-member"
                      }
                      className="text-[10px] px-2 py-0.5"
                    >
                      {ROLE_LABELS[applicant?.role || "member"]}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
