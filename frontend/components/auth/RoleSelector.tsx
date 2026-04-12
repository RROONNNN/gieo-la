import Link from "next/link";
import { Users, Building2, UserCheck } from "lucide-react";

const roles = [
  {
    href: "/register/member",
    icon: Users,
    title: "Thành viên",
    description: "Đăng bài tặng đồ, tham gia cộng đồng.",
    color: "text-primary-600",
    border: "hover:border-primary-400",
  },
  {
    href: "/register/ngo",
    icon: Building2,
    title: "Tổ chức Thiện nguyện",
    description: "Đăng ký NGO, nhận tích xanh và Wishlist riêng.",
    color: "text-blue-600",
    border: "hover:border-blue-400",
  },
  {
    href: "/register/individual",
    icon: UserCheck,
    title: "Cá nhân Khó khăn",
    description:
      "Đăng ký nhận đồ ưu tiên. Cần Admin phê duyệt giấy tờ xác nhận.",
    color: "text-amber-600",
    border: "hover:border-amber-400",
  },
];

export function RoleSelector() {
  return (
    <div className="flex flex-col gap-3">
      {roles.map(({ href, icon: Icon, title, description, color, border }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-start gap-4 rounded-xl border border-border p-4 transition-colors ${border} hover:bg-muted`}
        >
          <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${color}`} />
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
