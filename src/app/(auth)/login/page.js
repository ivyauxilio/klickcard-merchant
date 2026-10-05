"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthErrors } from "@/store/slices/authSlice";
import AuthShell from "@/components/AuthShell";
import GuestGuard from "@/components/GuestGuard";
import FormError from "@/components/FormError";

function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, errors } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const isLoading = status === "loading";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthErrors());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Enter your email and password to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </>
      }
    >
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
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="input-field"
            placeholder="you@example.com"
          />
          <FormError message={errors?.email} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block font-body text-sm font-medium text-ink">
              Password
            </label>
            <Link href="/forgot-password" className="font-body text-xs font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
            className="input-field"
            placeholder="••••••••"
          />
          <FormError message={errors?.password} />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
