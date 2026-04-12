import { Card } from "@/components/ui/Card";

export function IndividualProfileSection() {
  return (
    <>
      <Card className="mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">Lịch sử đồ đã nhận</h2>
        <p className="text-sm text-muted-foreground">Chưa có đồ vật nào được ghi nhận.</p>
      </Card>

      <Card className="mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">Ảnh cảm ơn</h2>
        <p className="text-sm text-muted-foreground">
          Chưa có ảnh cảm ơn nào được đăng. Sau khi nhận đồ, hãy đăng ảnh xác nhận vào thread bài đăng để bày tỏ lòng biết ơn.
        </p>
      </Card>
    </>
  );
}
