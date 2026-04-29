"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getUserProfile } from "@/lib/api/users";
import type { PublicProfile } from "@/types/user";

interface UserProfilePanelProps {
  userId: string;
  onClose: () => void;
}

export function UserProfilePanel({ userId, onClose }: UserProfilePanelProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setProfile(null);
    getUserProfile(userId)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <div className="flex flex-col h-full border-l border-brand-light bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-brand-light">
        <h3 className="font-heading font-semibold text-brand-dark">Hồ sơ</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center py-8 text-sm text-gray-400">Đang tải...</div>
        )}

        {!isLoading && !profile && (
          <div className="text-sm text-gray-400 text-center py-8">
            Không tải được hồ sơ
          </div>
        )}

        {profile && (
          <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-light"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-dark/20 flex items-center justify-center text-brand-dark text-2xl font-semibold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h4 className="font-heading font-bold text-gray-900 text-center">
              {profile.name}
            </h4>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 justify-center">
              {profile.role === "ngo" && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Tổ chức NGO
                </span>
              )}
              {profile.role === "individual" && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  Cá nhân khó khăn
                </span>
              )}
              {profile.verificationStatus === "verified" && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ✓ Đã xác thực
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="w-full bg-brand-light/30 rounded-[15px] px-4 py-3 text-center">
              <p className="text-2xl font-bold text-brand-dark">{profile.completedDonations}</p>
              <p className="text-xs text-gray-500">Lá đã gieo</p>
            </div>

            {/* Link to full profile */}
            <Link
              href={`/profile/${userId}`}
              target="_blank"
              className="flex items-center gap-1 text-xs text-brand-dark hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Xem hồ sơ đầy đủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
