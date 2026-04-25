import { redirect } from "next/navigation";
import { getCurrentUserFromCookie, getFreshUserFromApi } from "@/lib/auth/server";
import { getMyRequestsServer } from "@/lib/api/verification.server";

import { UserRole } from "@/types/enums";
import { VerificationStatusCard } from "@/components/verification/VerificationStatusCard";
import { SubmitVerificationForm } from "@/components/verification/SubmitVerificationForm";
import { VerificationHistory } from "@/components/verification/VerificationHistory";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  // Fast check via cookie — just to gate unauthenticated users
  const viewer = await getCurrentUserFromCookie();
  if (!viewer) {
    redirect("/login");
  }

  // Fetch fresh user from DB and all requests in parallel
  const [freshUser, allRequests] = await Promise.all([
    getFreshUserFromApi(),
    getMyRequestsServer().catch(() => []),
  ]);
  const latestRequest = allRequests[0] ?? null;
  const hasPendingRequest = latestRequest?.status === "pending";

  // Use fresh role from DB; fall back to JWT role if API call failed.
  // Also treat an approved request as verified (covers the case where the DB
  // role was updated but the cookie hasn't been refreshed yet).
  const verificationStatus = freshUser?.verificationStatus ;
  const currentRole = freshUser?.role || viewer.role;
  const hasApprovedRequest = allRequests.some((r) => r.status === "approved");
  const isAlreadyVerified = verificationStatus === "verified" ||
    hasApprovedRequest;

  const rejectedReason =
    latestRequest?.status === "rejected" ? latestRequest.rejectionReason : null;
  const requestType = currentRole === UserRole.NGO ? "ngo" : "individual";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-6">Xác minh tài khoản</h1>

      {
 isAlreadyVerified && (<VerificationStatusCard latestRequest={latestRequest} isAlreadyVerified={isAlreadyVerified} />)

      }

      {!hasPendingRequest && !isAlreadyVerified && (
        <SubmitVerificationForm
          hasPendingRequest={hasPendingRequest}
          isAlreadyVerified={isAlreadyVerified}
          rejectedReason={rejectedReason}
          requestType={requestType}
        />
      )}

      {allRequests.length > 1 && (
        <VerificationHistory requests={allRequests.slice(1)} />
      )}
    </main>
  );
}
