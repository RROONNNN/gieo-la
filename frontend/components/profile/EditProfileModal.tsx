"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface EditProfileModalProps {
  currentName: string;
  currentAvatar: string | null;
  onClose: () => void;
}

export function EditProfileModal({
  currentName,
  currentAvatar,
  onClose,
}: EditProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên hiển thị không được để trống.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.patch(ENDPOINTS.AUTH.ME, {
        name: name.trim(),
        avatar: avatar.trim() || null,
      });
      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cập nhật thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Chỉnh sửa hồ sơ"
    >
      <Card className="w-full max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-4">Chỉnh sửa hồ sơ</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="edit-name"
            label="Tên hiển thị"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="edit-avatar"
            label="URL ảnh đại diện"
            placeholder="https://example.com/my-photo.jpg"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
