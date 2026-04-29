import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Leaf, Package, ShieldCheck, Clock } from "lucide-react";
import { getUserProfile } from "@/lib/api/users";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BadgeChip } from "@/components/ui/BadgeChip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDateVN } from "@/lib/utils";
import { ChatButton } from "@/components/chat/ChatButton";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

const ROLE_BADGE_MAP: Record<
  string,
  { label: string; variant: "role-ngo" | "role-individual" | "role-member" }
> = {
  ngo: { label: "Tổ chức thiện nguyện — Đã xác thực", variant: "role-ngo" },
  individual: {
    label: "Hoàn cảnh khó khăn — Đã xác thực",
    variant: "role-individual",
  },
  member: { label: "Thành viên", variant: "role-member" },
  admin: { label: "Quản trị viên", variant: "role-member" },
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  let profileUser;
  if (!id) notFound();
  try {
    profileUser = await getUserProfile(id);
  } catch {
    notFound();
  }

  const viewer = await getCurrentUserFromCookie();
  const isOwn = viewer !== null && viewer._id === profileUser._id;
  const roleBadge = ROLE_BADGE_MAP[profileUser.role] || ROLE_BADGE_MAP.member;

  return (
    <div className="py-10">
      {/* ─── Header ─── */}
      <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <Avatar src={profileUser.avatar} alt={profileUser.name} size="xl" />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-heading text-3xl font-bold text-brand-darker">
            {profileUser.name}
            {profileUser.role === "ngo" && (
              <span className="ml-2 text-blue-500" title="NGO Xác thực">
                ✓
              </span>
            )}
          </h1>

          {profileUser.verificationStatus === "verified" && (
            <Badge variant={roleBadge.variant} className="mt-2">
              {roleBadge.label}
            </Badge>
          )}

          {profileUser.badge && profileUser.badge !== "none" && (
            <div className="mt-2">
              <BadgeChip badge={profileUser.badge} />
            </div>
          )}
          {profileUser.verificationStatus === "unverified" && (
            <Badge variant="error" className="mt-2">
              Chưa xác thực
            </Badge>
          )}

          {profileUser.verificationStatus === "pending" && (
            <Badge variant="warning" className="mt-2">
              Đang chờ xác thực
            </Badge>
          )}

          {profileUser.location?.city && (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground sm:justify-start justify-center">
              <MapPin className="size-4" />
              {profileUser.location.city}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Tham gia từ {formatDateVN(profileUser.createdAt)}
          </p>

          {/* Chat button — visible to authenticated non-owners */}
          {viewer && !isOwn && (
            <div className="mt-3">
              <ChatButton profileUserId={profileUser._id} />
            </div>
          )}
        </div>
      </div>

      {/* ─── Verification CTA (own profile, NGO/Individual, not yet verified) ─── */}
      {isOwn &&
        (profileUser.role === "ngo" || profileUser.role === "individual") &&
        (profileUser.verificationStatus === "unverified" ||
          profileUser.verificationStatus === "pending") && (
          <div className="mb-10 flex items-start gap-4 rounded-[15px] border border-[var(--border-green)] bg-white p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
              {profileUser.verificationStatus === "pending" ? (
                <Clock className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>
            <div className="flex-1">
              {profileUser.verificationStatus === "pending" ? (
                <>
                  <p className="font-medium text-brand-darker">
                    Hồ sơ đang chờ xét duyệt
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Admin đang xem xét hồ sơ xác thực của bạn. Bạn sẽ được thông
                    báo khi có kết quả.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-brand-darker">
                    Xác thực tài khoản của bạn
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {profileUser.role === "ngo"
                      ? "Nộp hồ sơ để được gắn nhãn NGO xác thực, tăng độ tin cậy với cộng đồng."
                      : "Nộp giấy tờ xác nhận hoàn cảnh để nhận hỗ trợ từ cộng đồng."}
                  </p>
                </>
              )}
            </div>
            {profileUser.verificationStatus === "unverified" && (
              <Link
                href="/verify"
                className="shrink-0 rounded-lg bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-darker transition-colors"
              >
                Nộp hồ sơ
              </Link>
            )}
          </div>
        )}

      {/* ─── Bio / Quote ─── */}
      {profileUser.ngoProfile?.description && (
        <div className="mb-10 rounded-[15px] border border-[var(--border-green)] bg-white p-6">
          <p className="text-sm italic text-foreground leading-relaxed">
            &ldquo;{profileUser.ngoProfile.description}&rdquo;
          </p>
        </div>
      )}

      {/* ─── Stats ─── */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="flex items-center gap-3 rounded-[15px] border border-[var(--border-green)] bg-white p-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
            <Leaf className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-darker">
              {profileUser.completedDonations}
            </p>
            <p className="text-xs text-muted-foreground">Lá đã gieo</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[15px] border border-[var(--border-green)] bg-white p-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
            <Package className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-darker">
              {profileUser.completedDonations}
            </p>
            <p className="text-xs text-muted-foreground">Món đồ đã cho</p>
          </div>
        </div>
      </div>

      {/* ─── NGO Info ─── */}
      {profileUser.ngoProfile && (
        <div className="mb-10">
          <SectionHeading>Thông tin tổ chức</SectionHeading>
          <div className="mt-6 rounded-[15px] border border-[var(--border-green)] bg-white p-6 space-y-3">
            <p className="text-sm">
              <span className="font-medium text-brand-darker">
                Tên tổ chức:
              </span>{" "}
              {profileUser.ngoProfile.organizationName || "—"}
            </p>
            {profileUser.ngoProfile.website && (
              <p className="text-sm">
                <span className="font-medium text-brand-darker">Website:</span>{" "}
                <a
                  href={profileUser.ngoProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {profileUser.ngoProfile.website}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Placeholder sections for history / feedback ─── */}
      <div className="mb-10">
        <SectionHeading>
          {profileUser.role === "individual"
            ? "Lịch sử nhận đồ"
            : "Lịch sử tặng đồ"}
        </SectionHeading>
        <div className="mt-6 rounded-[15px] border border-[var(--border-green)] bg-white p-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu
        </div>
      </div>

      {profileUser.role === "individual" && (
        <div>
          <SectionHeading>Ảnh cảm ơn (Feedback)</SectionHeading>
          <p className="mt-2 text-sm text-muted-foreground">
            Những hình ảnh đầy cảm xúc từ người nhận
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {/* Placeholder for feedback photos */}
            <div className="aspect-square rounded-[15px] border border-[var(--border-green)] bg-white flex items-center justify-center text-muted-foreground text-sm">
              Chưa có ảnh
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
