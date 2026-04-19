import { listAdminUsers } from "@/lib/api/adminUsers";
import { AdminUserList } from "@/components/verification/AdminUserList";
import { requireToken, handleApiError } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const token = await requireToken();

  const params = await searchParams;
  const role = params.role || "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = 20;

  let users;
  let total;

  try {
    ({ users, total } = await listAdminUsers(
      { role: role || undefined, page, limit },
      { headers: { Authorization: `Bearer ${token}` } },
    ));
  } catch (error) {
    handleApiError(error);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem và quản lý tất cả tài khoản trong hệ thống
        </p>
      </div>

      <AdminUserList
        users={users}
        total={total}
        page={page}
        limit={limit}
        currentRole={role}
      />
    </div>
  );
}
