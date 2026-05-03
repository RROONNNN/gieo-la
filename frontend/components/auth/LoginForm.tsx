"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";

type LoginMode = "email" | "phone";

function buildSchema(mode: LoginMode) {
  return z.object({
    identifier:
      mode === "email"
        ? z.string().email("Email không hợp lệ")
        : z
            .string()
            .regex(
              /^\+?[0-9]{9,15}$/,
              "Số điện thoại không hợp lệ",
            ),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  });
}

type Fields = { identifier: string; password: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const isLocked = reason === "locked";

  const [mode, setMode] = useState<LoginMode>("email");
  const [values, setValues] = useState<Fields>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: LoginMode) {
    if (next === mode) return;
    setMode(next);
    setValues({ identifier: "", password: values.password });
    setErrors({});
    setServerError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = buildSchema(mode).safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Fields;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await login({ identifier: result.data.identifier, password: result.data.password });
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
      {isLocked ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.
        </p>
      ) : reason && reason.length > 0 ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {reason}
        </p>
      ) : null}

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      {/* Toggle email / phone */}
      <div className="flex overflow-hidden rounded-lg border border-border text-sm">
        <button
          type="button"
          onClick={() => switchMode("email")}
          className={`flex-1 py-2 font-medium transition-colors ${
            mode === "email"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => switchMode("phone")}
          className={`flex-1 py-2 font-medium transition-colors ${
            mode === "phone"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          Số điện thoại
        </button>
      </div>

      {mode === "email" ? (
        <Input
          key="email"
          id="identifier"
          name="identifier"
          type="email"
          label="Email"
          placeholder="email@example.com"
          autoComplete="email"
          value={values.identifier}
          onChange={handleChange}
          error={errors.identifier}
        />
      ) : (
        <Input
          key="phone"
          id="identifier"
          name="identifier"
          type="tel"
          label="Số điện thoại"
          placeholder="0912345678"
          autoComplete="tel"
          value={values.identifier}
          onChange={handleChange}
          error={errors.identifier}
        />
      )}

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
