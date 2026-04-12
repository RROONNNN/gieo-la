"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import type { UserRole } from "@/types/enums";

/**
 * Redirects to /login if the user is not authenticated.
 * Optionally accepts a list of allowed roles; unauthorized roles are sent to /.
 */
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, isLoading, router, allowedRoles]);

  return { user, isLoading };
}
