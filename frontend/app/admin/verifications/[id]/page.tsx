import { adminGetRequest } from "@/lib/api/verification";
import AdminVerificationDetail from "@/components/verification/AdminVerificationDetail";
import Link from "next/link";
import { requireToken, handleApiError } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function AdminVerificationDetailPage({ params, searchParams }: PageProps) {
  const token = await requireToken();

  const { id } = await params;
  const { from } = await searchParams;
  const requestType = from === "ngo" ? "ngo" : "individual";

  let request;

  try {
    request = await adminGetRequest(id, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    handleApiError(error);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/admin/verifications?type=${requestType}`}
          className="text-sm text-primary-600 hover:underline"
        >
          ← Quay lại danh sách
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Chi tiết đơn xác minh
        </h1>
      </div>

      <AdminVerificationDetail request={request} />
    </div>
  );
}
