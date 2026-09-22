"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { BoltIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  fetchWallet,
  selectWallet,
  selectWalletLoading,
} from "@/store/slices/walletSlice";

export default function CreditBadge() {
  const dispatch = useDispatch();
  const wallet = useSelector(selectWallet);
  const loading = useSelector(selectWalletLoading);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  if (loading && !wallet) {
    return (
      <div className="animate-pulse bg-purple-100 rounded-full h-9 w-32" />
    );
  }

  const balance = wallet?.credit_balance ?? 0;
  const isLow = balance <= 2;

  return (
    <Link
      href="/merchant/subscription"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isLow
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
      }`}
    >
      <BoltIcon className="w-4 h-4" />
      <span>{balance} credits</span>
      <PlusIcon className="w-3 h-3" />
    </Link>
  );
}
