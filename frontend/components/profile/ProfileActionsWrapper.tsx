"use client";

import { useState } from "react";
import { ProfileActions } from "./ProfileActions";
import { EditProfileModal } from "./EditProfileModal";
import type { ProfilePermissions, PublicProfile } from "@/types/user";

interface ProfileActionsWrapperProps {
  permissions: ProfilePermissions;
  user: PublicProfile;
}

export function ProfileActionsWrapper({ permissions, user }: ProfileActionsWrapperProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <ProfileActions
        permissions={permissions}
        profileUserId={user._id}
        onEditClick={() => setEditOpen(true)}
      />
      {editOpen && (
        <EditProfileModal
          currentName={user.name}
          currentAvatar={user.avatar}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
