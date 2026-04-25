import { Users, FileCheck, Shield, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAdminUsers } from "@/lib/api/adminUsers";
import { adminListRequestsServer } from "@/lib/api/verification.server";
import { VerificationRequestStatus, VerificationRequestType } from "@/types/enums";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboardPage() {
  // Fetch data in parallel
  const [usersRes, individualRes, ngoRes] = await Promise.all([
    listAdminUsers({ limit: 1 }).catch(() => ({
      users: [],
      total: 0,
      page: 1,
      limit: 1,
    })),
    adminListRequestsServer(
      {
        requestType: VerificationRequestType.INDIVIDUAL,
        status: VerificationRequestStatus.PENDING,
        limit: 1,
      },
    ).catch(() => ({ requests: [], total: 0, page: 1, limit: 1 })),
    adminListRequestsServer(
      {
        requestType: VerificationRequestType.NGO,
        status: VerificationRequestStatus.PENDING,
        limit: 1,
      },
    ).catch(() => ({ requests: [], total: 0, page: 1, limit: 1 })),
  ]);

  const totalUsers = usersRes.total;
  const pendingIndividual = individualRes.total;
  const pendingNgo = ngoRes.total;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-brand-darker">
        Tổng quan
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chào mừng trở lại! Đây là tình hình hệ thống hôm nay.
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={<Users className="size-5" />}
          label="Tổng người dùng"
          value={totalUsers}
        />
        <StatsCard
          icon={<FileCheck className="size-5" />}
          label="Xét duyệt cá nhân"
          value={pendingIndividual}
        />
        <StatsCard
          icon={<Shield className="size-5" />}
          label="Xét duyệt NGO"
          value={pendingNgo}
        />
        <StatsCard
          icon={<TrendingUp className="size-5" />}
          label="Bài đăng mới hôm nay"
          value={0}
        />
      </div>

      {/* Quick links */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Verification requests */}
        <div>
          <SectionHeading
            action={
              <Link href="/admin/verifications">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            }
          >
            Yêu cầu xác thực đang chờ
          </SectionHeading>
          <div className="mt-4 rounded-[15px] border border-[var(--border-green)] bg-white p-6">
            {pendingIndividual + pendingNgo > 0 ? (
              <div className="space-y-3">
                {pendingIndividual > 0 && (
                  <Link
                    href="/admin/verifications?type=individual"
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-bg-cream transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <FileCheck className="size-4" />
                      </div>
                      <span className="text-sm font-medium text-brand-darker">
                        Cá nhân hoàn cảnh khó khăn
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      {pendingIndividual}
                    </span>
                  </Link>
                )}
                {pendingNgo > 0 && (
                  <Link
                    href="/admin/verifications?type=ngo"
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-bg-cream transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Shield className="size-4" />
                      </div>
                      <span className="text-sm font-medium text-brand-darker">
                        Tổ chức thiện nguyện (NGO)
                      </span>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {pendingNgo}
                    </span>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Không có yêu cầu nào đang chờ xử lý
              </p>
            )}
          </div>
        </div>

        {/* User management */}
        <div>
          <SectionHeading
            action={
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            }
          >
            Quản lý người dùng
          </SectionHeading>
          <div className="mt-4 rounded-[15px] border border-[var(--border-green)] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                  <Users className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-darker">
                    Tổng số tài khoản
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quản lý vai trò và trạng thái
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-brand-darker">
                {totalUsers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
