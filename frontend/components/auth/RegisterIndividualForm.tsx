"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";

type RegMode = "email" | "phone";

function buildSchema(mode: RegMode) {
  return z
    .object({
      name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(60),
      identifier:
        mode === "email"
          ? z.string().email("Email không hợp lệ")
          : z.string().regex(/^\+?[0-9]{9,15}$/, "Số điện thoại không hợp lệ"),
      password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(72),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    });
}

type Fields = {
  name: string;
  identifier: string;
  password: string;
  confirmPassword: string;
};
type FieldErrors = Partial<Record<keyof Fields, string>>;

export function RegisterIndividualForm() {
  const { registerIndividual } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<RegMode>("email");
  const [values, setValues] = useState<Fields>({
    name: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: RegMode) {
    if (next === mode) return;
    setMode(next);
    setValues((prev) => ({ ...prev, identifier: "" }));
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
      await registerIndividual({
        name: result.data.name,
        ...(mode === "email"
          ? { email: result.data.identifier }
          : { phone: result.data.identifier }),
        password: result.data.password,
      });
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
      {/* Admin approval notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">
          Lưu ý: Tài khoản cần được Admin phê duyệt
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Sau khi đăng ký, tài khoản của bạn sẽ ở trạng thái chờ xét duyệt. Bạn
          sẽ cần gửi giấy tờ xác nhận hoàn cảnh để Admin duyệt.
        </p>
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <Input
        id="name"
        name="name"
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        autoComplete="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />

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
        placeholder="Ít nhất 8 ký tự"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <Button type="submit" className="w-full" loading={loading}>
        Gửi đăng ký
      </Button>
    </form>
  );
}
