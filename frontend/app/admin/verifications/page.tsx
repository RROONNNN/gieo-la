import { adminListRequests } from "@/lib/api/verification";
import AdminVerificationList from "@/components/verification/AdminVerificationList";
import { requireToken, handleApiError } from "@/lib/auth/server";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string }>;
}

export default async function AdminVerificationsPage({
  searchParams,
}: PageProps) {
  const token = await requireToken();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const type = params.type === "ngo" ? "ngo" : "individual";
  const limit = 20;

  let requests;
  let total;

  try {
    ({ requests, total } = await adminListRequests(
      {
        requestType: type,
        status: "pending",
        page,
        limit,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ));
  } catch (error) {
    handleApiError(error);
  }

  const tabs = [
    { label: "Cá nhân", value: "individual" },
    { label: "NGO", value: "ngo" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Duyệt đơn xác minh
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sách đơn xác minh đang chờ duyệt
        </p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`?type=${tab.value}&page=1`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              type === tab.value
                ? "bg-primary-600 text-white"
                : "bg-muted text-foreground hover:bg-muted/80",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <AdminVerificationList
        requests={requests}
        total={total}
        page={page}
        limit={limit}
        currentType={type}
      />
    </div>
  );
}
