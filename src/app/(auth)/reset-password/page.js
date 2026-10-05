"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearAuthErrors, clearAuthMessage } from "@/store/slices/authSlice";
import AuthShell from "@/components/AuthShell";
import GuestGuard from "@/components/GuestGuard";
import FormError from "@/components/FormError";

function ResetPasswordForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, errors, message } = useSelector((state) => state.auth);

  // Laravel's default password.reset notification links to
  // {frontend_url}/reset-password?token=...&email=...
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    email: searchParams.get("email") || "",
    password: "",
    password_confirmation: "",
  });

  const isLoading = status === "loading";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthErrors());
    dispatch(clearAuthMessage());
    const result = await dispatch(resetPassword(form));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => router.replace("/login"), 1500);
    }
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footer={
        <>
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Back to login
          </Link>
        </>
      }
    >
      {message ? (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message} Redirecting you to login…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors?.general && (
            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block font-body text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
            />
            <FormError message={errors?.email} />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block font-body text-sm font-medium text-ink">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
            <FormError message={errors?.password} />
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-1.5 block font-body text-sm font-medium text-ink"
            >
              Confirm new password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={form.password_confirmation}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
            <FormError message={errors?.password_confirmation} />
          </div>

          <input type="hidden" name="token" value={form.token} />

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </GuestGuard>
  );
}
