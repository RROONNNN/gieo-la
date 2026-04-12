"use client";

import { Button } from "@/components/ui/Button";
import type { ProfilePermissions } from "@/types/user";

interface ProfileActionsProps {
  permissions: ProfilePermissions;
  profileUserId: string;
  onEditClick?: () => void;
}

export function ProfileActions({ permissions, onEditClick }: ProfileActionsProps) {
  if (!permissions.canEdit && !permissions.canChat) return null;

  return (
    <div className="flex gap-2 mt-3">
      {permissions.canEdit && (
        <Button variant="outline" size="sm" onClick={onEditClick}>
          Chỉnh sửa hồ sơ
        </Button>
      )}
      {permissions.canChat && (
        <Button variant="secondary" size="sm">
          Nhắn tin
        </Button>
      )}
    </div>
  );
}
