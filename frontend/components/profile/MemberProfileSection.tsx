import { Card } from "@/components/ui/Card";

interface MemberProfileSectionProps {
  completedDonations: number;
}

export function MemberProfileSection({ completedDonations }: MemberProfileSectionProps) {
  return (
    <Card className="mb-4">
      <h2 className="text-base font-semibold text-foreground mb-3">Lịch sử trao tặng</h2>

      {completedDonations === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bài đăng nào hoàn thành.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Đã trao thành công{" "}
          <span className="font-semibold text-foreground">{completedDonations}</span> món đồ.
          {" "}Lịch sử chi tiết đang được cập nhật.
        </p>
      )}
    </Card>
  );
}
