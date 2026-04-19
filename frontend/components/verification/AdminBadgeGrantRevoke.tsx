"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserRole, VerificationStatus } from "@/types/enums";
import { grantNgoBadge, revokeNgoBadge, revokeIndividualBadge } from "@/lib/api/admin";

interface AdminBadgeUser {
  _id: string;
  name: string;
  role: string;
  verificationStatus: string;
}

interface Props {
  user: AdminBadgeUser;
  onSuccess: (updated: AdminBadgeUser) => void;
}

type DialogMode = "grant-ngo" | "revoke-ngo" | "revoke-individual" | null;

const DIALOG_CONFIG: Record<
  NonNullable<DialogMode>,
  { title: string; description: string; confirmLabel: string; confirmVariant: "primary" | "danger" }
> = {
  "grant-ngo": {
    title: "Cấp tích xanh NGO",
    description: "Xác nhận cấp tích xanh NGO cho tài khoản này?",
    confirmLabel: "Cấp tích xanh",
    confirmVariant: "primary",
  },
  "revoke-ngo": {
    title: "Thu hồi tích xanh NGO",
    description: "Nhập lý do thu hồi (tùy chọn):",
    confirmLabel: "Thu hồi",
    confirmVariant: "danger",
  },
  "revoke-individual": {
    title: "Thu hồi xác minh Individual",
    description: "Nhập lý do thu hồi (tùy chọn):",
    confirmLabel: "Thu hồi",
    confirmVariant: "danger",
  },
};

export function AdminBadgeGrantRevoke({ user: initialUser, onSuccess }: Props) {
  const [user, setUser] = useState(initialUser);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog(mode: DialogMode) {
    setReason("");
    setError(null);
    setDialog(mode);
  }

  function closeDialog() {
    setDialog(null);
    setReason("");
    setError(null);
  }

  async function handleConfirm() {
    if (!dialog) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (dialog === "grant-ngo") res = await grantNgoBadge(user._id, reason || undefined);
      else if (dialog === "revoke-ngo") res = await revokeNgoBadge(user._id, reason || undefined);
      else res = await revokeIndividualBadge(user._id, reason || undefined);

      const updated = { ...user, ...res.data!.user };
      setUser(updated);
      onSuccess(updated);
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  const config = dialog ? DIALOG_CONFIG[dialog] : null;

  return (
    <div className="space-y-3">
      {/* Action buttons — shown based on role + verificationStatus */}
      <div className="flex flex-wrap gap-2">
        {user.role === UserRole.NGO && user.verificationStatus !== VerificationStatus.VERIFIED && (
          <Button size="sm" onClick={() => openDialog("grant-ngo")}>
            Cấp tích xanh NGO
          </Button>
        )}
        {user.role === UserRole.NGO && user.verificationStatus === VerificationStatus.VERIFIED && (
          <Button size="sm" variant="danger" onClick={() => openDialog("revoke-ngo")}>
            Thu hồi tích xanh NGO
          </Button>
        )}
        {user.role === UserRole.INDIVIDUAL && user.verificationStatus === VerificationStatus.VERIFIED && (
          <Button size="sm" variant="danger" onClick={() => openDialog("revoke-individual")}>
            Thu hồi xác minh Individual
          </Button>
        )}
        {user.role === UserRole.INDIVIDUAL && user.verificationStatus !== VerificationStatus.VERIFIED && (
          <p className="text-sm text-muted-foreground">
            Cấp quyền Individual thông qua duyệt yêu cầu xác minh.
          </p>
        )}
      </div>

      {/* Dialog overlay */}
      {dialog && config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{config.title}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {config.description}
            </p>

            {(dialog === "revoke-ngo" || dialog === "revoke-individual") && (
              <Input
                placeholder="Lý do (tùy chọn, tối đa 500 ký tự)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                className="mb-4"
              />
            )}

            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeDialog} disabled={loading}>
                Hủy
              </Button>
              <Button
                variant={config.confirmVariant}
                size="sm"
                loading={loading}
                onClick={handleConfirm}
              >
                {config.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
