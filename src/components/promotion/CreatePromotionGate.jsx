"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import { ExclamationTriangleIcon, BoltIcon } from "@heroicons/react/24/outline";

export default function CreatePromotionGate({ children, creditsNeeded = 1 }) {
  const wallet = useSelector((state) => state.wallet?.data);

  if (!wallet) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  const hasEnough = wallet.credit_balance >= creditsNeeded;

  if (!hasEnough) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">
            Not Enough Credits
          </h2>
          <p className="text-red-700 mb-6">
            You need <strong>{creditsNeeded} credits</strong> to create this
            promotion, but you only have{" "}
            <strong>{wallet.credit_balance}</strong>.
          </p>

          <div className="bg-white rounded-xl p-4 mb-6 inline-block">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-gray-500">Required</p>
                <p className="text-xl font-bold text-gray-900">
                  {creditsNeeded}
                </p>
              </div>
              <div className="text-gray-300">|</div>
              <div>
                <p className="text-gray-500">Available</p>
                <p className="text-xl font-bold text-red-600">
                  {wallet.credit_balance}
                </p>
              </div>
              <div className="text-gray-300">|</div>
              <div>
                <p className="text-gray-500">Shortfall</p>
                <p className="text-xl font-bold text-red-600">
                  {creditsNeeded - wallet.credit_balance}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/merchant/subscription"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg"
          >
            <BoltIcon className="w-5 h-5" />
            Buy More Credits
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
