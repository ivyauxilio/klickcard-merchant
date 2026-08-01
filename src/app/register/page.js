"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthErrors } from "@/store/slices/authSlice";
import AuthShell from "@/components/AuthShell";
import GuestGuard from "@/components/GuestGuard";
import FormError from "@/components/FormError";

function RegisterForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status, errors } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
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
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      router.replace("/dashboard");
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="It only takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
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
          <label htmlFor="name" className="mb-1.5 block font-body text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Juan Dela Cruz"
          />
          <FormError message={errors?.name} />
        </div>

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
          <label htmlFor="password" className="mb-1.5 block font-body text-sm font-medium text-ink">
            Password
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
          <label htmlFor="password_confirmation" className="mb-1.5 block font-body text-sm font-medium text-ink">
            Confirm password
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

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}
