import type { BadgeVariant } from "@/components/ui/Badge";

export const CATEGORY_LABEL: Record<string, string> = {
  do_nam: "Đồ Nam",
  do_nu: "Đồ Nữ",
  do_tre_em: "Đồ Trẻ em",
  phu_kien: "Phụ kiện",
};

export const CONDITION_LABEL: Record<string, string> = {
  new_100: "Mới 100%",
  new_90: "Mới 90%",
  new_80: "Mới 80%",
  custom: "Tùy chỉnh",
};

export const STATUS_LABEL: Record<string, string> = {
  available: "Sẵn sàng",
  in_transaction: "Đang giao dịch",
  traded: "Đã giao dịch",
  completed: "Hoàn thành",
};

export const STATUS_VARIANT: Record<string, BadgeVariant> = {
  available: "success",
  in_transaction: "warning",
  traded: "info",
  completed: "default",
};
