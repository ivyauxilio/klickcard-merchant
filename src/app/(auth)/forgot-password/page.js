"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearAuthErrors, clearAuthMessage } from "@/store/slices/authSlice";
import AuthShell from "@/components/AuthShell";
import GuestGuard from "@/components/GuestGuard";
import FormError from "@/components/FormError";

function ForgotPasswordForm() {
  const dispatch = useDispatch();
  const { status, errors, message } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthErrors());
    dispatch(clearAuthMessage());
    dispatch(forgotPassword({ email }));
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="We'll email you a link to reset it."
      footer={
        <>
          Remembered it after all?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Back to login
          </Link>
        </>
      }
    >
      {message ? (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
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
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
            <FormError message={errors?.email} />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Sending link…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <ForgotPasswordForm />
    </GuestGuard>
  );
}
