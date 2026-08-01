"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, clearAuthErrors } from "@/store/slices/authSlice";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import FormError from "@/components/FormError";

function ProfileContent() {
  const dispatch = useDispatch();
  const { user, status, errors } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saved, setSaved] = useState(false);

  const isLoading = status === "loading";

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  function handleChange(e) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthErrors());
    setSaved(false);
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      setSaved(true);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-brand-600">
          Account
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          Profile
        </h1>
        <p className="mt-2 font-body text-sm text-ink/55">
          Update your account details. Changes are saved to your Laravel API.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-xl border border-ink/8 bg-white p-6"
          noValidate
        >
          {errors?.general && (
            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {errors.general}
            </div>
          )}
          {saved && (
            <div className="rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">
              Profile updated.
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block font-body text-sm font-medium text-ink"
            >
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="input-field"
            />
            <FormError message={errors?.name} />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block font-body text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
            <FormError message={errors?.email} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary sm:w-auto sm:px-8"
          >
            {isLoading ? "Saving…" : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
