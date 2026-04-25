"use client";

import { useState } from "react";
import {
  HandHeart,
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { applyForPost, selectApplicant, confirmReceipt } from "@/lib/api/applications";
import { useRouter } from "next/navigation";
import { formatRelativeTimeVN } from "@/lib/utils";
import type { Application } from "@/types/application";

interface ApplicationPanelProps {
  postId: string;
  postStatus: string;
  postAuthorId: string;
  applications: Application[];
  isSelectedApplicant?: boolean;
  receiverConfirmed?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  ngo: "Tổ chức",
  individual: "Cá nhân",
  member: "Thành viên",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  selected: {
    label: "Được chọn",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Không được chọn",
    className: "bg-gray-50 text-gray-500 border-gray-200",
  },
};

export function ApplicationPanel({
  postId,
  postStatus,
  postAuthorId,
  applications: initialApplications,
  isSelectedApplicant = false,
  receiverConfirmed = false,
}: ApplicationPanelProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );

  const toggleMessage = (id: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAuthor = user?._id === postAuthorId;
  const canApply =
    postStatus === "available" &&
    isAuthenticated &&
    !isAuthor &&
    (user?.role === "ngo" || user?.role === "individual") &&
    user?.verificationStatus === "verified";
  const alreadyApplied = applications.some((app) => {
    const applicantId =
      typeof app.applicant === "string" ? app.applicant : app.applicant._id;
    return applicantId === user?._id;
  });

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
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không thể đăng ký nhận đồ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = async (applicantId: string) => {
    if (!confirm("Xác nhận chọn người này nhận đồ?")) return;
    setSelectingId(applicantId);
    try {
      await selectApplicant(postId, applicantId);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể chọn người nhận");
    } finally {
      setSelectingId(null);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!confirm("Bạn xác nhận đã nhận được đồ từ người tặng?")) return;
    setConfirming(true);
    try {
      await confirmReceipt(postId);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể xác nhận nhận đồ");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="rounded-[15px] border border-[var(--border-green)] bg-white overflow-hidden">
      {/* CTA section */}
      {postStatus === "available" && (
        <div className="border-b border-[var(--border-green)] p-5">
          <h3 className="flex items-center gap-2 font-heading text-base font-semibold text-brand-darker">
            <HandHeart className="size-4 shrink-0" />
            Trở thành người nhận
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Mô tả hoàn cảnh và lý do bạn muốn nhận món đồ này
          </p>

          {canApply && !alreadyApplied && !success && (
            <div className="mt-3 space-y-2.5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mô tả hoàn cảnh / lý do của bạn..."
                rows={3}
                className="w-full rounded-lg border border-[var(--border-green)] bg-bg-cream p-3 text-sm outline-none focus:ring-1 focus:ring-brand-dark resize-none placeholder:text-muted-foreground/60"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
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
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-light/30 px-3 py-2.5 text-sm text-brand-dark">
              <CheckCircle2 className="size-4 shrink-0" />
              Bạn đã đăng ký nhận đồ thành công!
            </div>
          )}
        </div>
      )}

      {/* Recipient confirmation card */}
      {isSelectedApplicant && postStatus === "traded" && (
        <div className="border-b border-[var(--border-green)] p-5">
          {receiverConfirmed ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <CheckCircle2 className="size-4 shrink-0 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Bạn đã xác nhận nhận đồ thành công
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <p className="text-sm font-semibold text-brand-darker">
                  Bạn đã nhận được đồ chưa?
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Xác nhận để người tặng và Admin biết rằng bạn đã nhận được đồ thành công.
                </p>
              </div>
              <Button
                size="sm"
                disabled={confirming}
                onClick={handleConfirmReceipt}
                className="w-full"
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                {confirming ? "Đang xác nhận..." : "Xác nhận đã nhận đồ"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Applications list */}
      <div className="p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-darker">
          <Users className="size-4 shrink-0" />
          Danh sách đăng ký
          <span className="ml-auto rounded-full bg-brand-light/50 px-2 py-0.5 text-xs font-medium text-brand-dark">
            {applications.length}
          </span>
        </h4>

        <div className="mt-3 space-y-3">
          {applications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border-green)] py-6 text-center">
              <Users className="mx-auto mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Chưa có ai đăng ký
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const applicant =
                typeof app.applicant === "string" ? null : app.applicant;
              const applicantId =
                typeof app.applicant === "string"
                  ? app.applicant
                  : app.applicant._id;
              const canSelect =
                isAuthor &&
                postStatus === "available" &&
                app.status === "pending";
              const statusCfg =
                STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
              const isSelected = app.status === "selected";
              const isRejected = app.status === "rejected";

              return (
                <div
                  key={app._id}
                  className={[
                    "rounded-xl border p-3.5 transition-colors",
                    isSelected
                      ? "border-green-200 bg-green-50/60"
                      : isRejected
                        ? "border-gray-100 bg-gray-50/60 opacity-60"
                        : "border-[var(--border-green)] bg-white",
                  ].join(" ")}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={applicant?.avatar}
                      alt={applicant?.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-brand-darker leading-tight">
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
                          className="text-[10px] px-1.5 py-0"
                        >
                          {ROLE_LABELS[applicant?.role ?? "member"]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3 shrink-0" />
                        {formatRelativeTimeVN(app.createdAt)}
                      </p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        statusCfg.className,
                      ].join(" ")}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Message */}
                  {app.message && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => toggleMessage(app._id)}
                        className="flex w-full items-center gap-1.5 rounded-lg px-1 py-0.5 text-left text-xs text-muted-foreground hover:text-brand-dark transition-colors"
                      >
                        <MessageSquare className="size-3.5 shrink-0" />
                        <span className="flex-1 font-medium">
                          {expandedMessages.has(app._id) ? "Ẩn lý do" : "Xem lý do"}
                        </span>
                        <ChevronDown
                          className={[
                            "size-3.5 shrink-0 transition-transform duration-200",
                            expandedMessages.has(app._id) ? "rotate-180" : "",
                          ].join(" ")}
                        />
                      </button>
                      {expandedMessages.has(app._id) && (
                        <div className="mt-1.5 rounded-lg bg-bg-cream/70 px-3 py-2.5">
                          <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                            {app.message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Select action */}
                  {canSelect && (
                    <div className="mt-2.5">
                      <Button
                        size="sm"
                        disabled={selectingId !== null}
                        onClick={() => handleSelect(applicantId)}
                        className="w-full"
                      >
                        <CheckCircle2 className="mr-1.5 size-3.5" />
                        {selectingId === applicantId
                          ? "Đang xử lý..."
                          : "Chọn người này"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
