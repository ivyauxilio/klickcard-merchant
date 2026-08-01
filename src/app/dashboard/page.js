"use client";

import { useSelector } from "react-redux";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Header from "@/components/Navbar";

function DashboardContent() {
  const { user } = useSelector((state) => state.auth);

  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(" ");

  return (
    // <div className="min-h-screen bg-paper">
    <div>
      {/* <Navbar /> */}
      {/* <Header /> */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-brand-600">
          Dashboard
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          Welcome back{fullName ? `, ${fullName}` : ""}
        </h1>
        <p className="mt-2 font-body text-sm text-ink/55">
          You&apos;re logged in and this page is protected — reachable only with
          a valid session, both via middleware and the client-side guard.
        </p>

        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome to your merchant dashboard</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₱12,345</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Orders</p>
            <p className="text-2xl font-bold text-gray-900">48</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Menu Items</p>
            <p className="text-2xl font-bold text-gray-900">32</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Promotions</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-ink/8 bg-white p-5">
            <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/40">
              Account email
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold text-ink">
              {user?.email || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-ink/8 bg-white p-5">
            <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/40">
              Account name
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold text-ink">
              {fullName || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-ink/8 bg-white p-5">
            <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/40">
              Status
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold text-green-600">
              Active
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
