import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getCurrentUserFromCookie();

  if (!viewer) redirect("/login");
  if (viewer.role !== "admin") redirect("/");

  return <>{children}</>;
}
