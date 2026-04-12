import { Card } from "@/components/ui/Card";
import type { PublicProfile } from "@/types/user";

interface NgoProfileSectionProps {
  user: PublicProfile;
}

export function NgoProfileSection({ user }: NgoProfileSectionProps) {
  const ngo = user.ngoProfile;

  return (
    <>
      {ngo && (ngo.description || ngo.website) && (
        <Card className="mb-4">
          <h2 className="text-base font-semibold text-foreground mb-3">Thông tin tổ chức</h2>
          {ngo.description && (
            <p className="text-sm text-foreground mb-2">{ngo.description}</p>
          )}
          {ngo.website && (
            <a
              href={ngo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {ngo.website}
            </a>
          )}
        </Card>
      )}

      <Card className="mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">Wishlist đã đăng</h2>
        <p className="text-sm text-muted-foreground">Tổ chức chưa đăng yêu cầu nào.</p>
      </Card>
    </>
  );
}
