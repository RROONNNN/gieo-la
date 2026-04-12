"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFields = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginFields, string>>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLocked = searchParams.get("reason") === "locked";

  const [values, setValues] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginFields;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await login(result.data);
      router.replace("/");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Đã xảy ra lỗi, thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {isLocked && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.
        </p>
      )}
      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="email@example.com"
        autoComplete="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Mật khẩu"
        placeholder="••••••••"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit" className="w-full" loading={loading}>
        Đăng nhập
      </Button>
    </form>
  );
}
