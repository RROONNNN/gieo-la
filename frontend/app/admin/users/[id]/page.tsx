import { getAdminUser } from "@/lib/api/adminUsers";
import { requireToken, handleApiError } from "@/lib/auth/server";
import { AdminUserDetailClient } from "./AdminUserDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const token = await requireToken();
  const { id } = await params;

  let user;
  try {
    user = await getAdminUser(id, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    handleApiError(error);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <AdminUserDetailClient initialUser={user} />
    </div>
  );
}
