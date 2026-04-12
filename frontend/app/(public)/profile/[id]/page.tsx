import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/api/users";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileActionsWrapper } from "@/components/profile/ProfileActionsWrapper";
import { MemberProfileSection } from "@/components/profile/MemberProfileSection";
import { IndividualProfileSection } from "@/components/profile/IndividualProfileSection";
import { NgoProfileSection } from "@/components/profile/NgoProfileSection";
import type { ProfilePermissions } from "@/types/user";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  let profileUser;
  if (!id) {
    console.error("No user ID provided in URL");
    notFound();
  }
  try {
    profileUser = await getUserProfile(id);
  } catch {
    notFound();
  }

  const viewer = await getCurrentUserFromCookie();

  const permissions: ProfilePermissions = {
    canEdit: viewer !== null && viewer._id === profileUser._id,
    canChat: viewer !== null && viewer._id !== profileUser._id,
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <ProfileHeader user={profileUser} permissions={permissions} />
      <ProfileActionsWrapper user={profileUser} permissions={permissions} />

      {profileUser.role === "individual" && (
        <IndividualProfileSection />
      )}

      {profileUser.role === "ngo" && (
        <NgoProfileSection user={profileUser} />
      )}

      {(profileUser.role === "member" || profileUser.role === "ngo") && (
        <MemberProfileSection
          completedDonations={profileUser.completedDonations}
        />
      )}
    </main>
  );
}
