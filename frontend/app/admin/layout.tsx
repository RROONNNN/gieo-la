import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getCurrentUserFromCookie();

  if (!viewer) redirect("/login");
  if (viewer.role !== "admin") redirect("/");

  return (
    <div className="flex h-screen bg-bg-cream">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
