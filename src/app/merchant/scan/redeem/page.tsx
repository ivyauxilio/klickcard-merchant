"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import api from "@/lib/axios";
import type { RootState } from "@/store/store";
import { addNotification } from "@/store/slices/uiSlice";
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function RedemptionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // const { token, user } = useSelector((state: RootState) => state.auth);
  const { token, user, isAuthenticated, isHydrated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [loading, setLoading] = useState(true);
  const [redemptionData, setRedemptionData] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const tokenParam = searchParams.get("token");

  // Auth check - separate from data loading
  useEffect(() => {
    if (!isHydrated) {
      // Still hydrating, show loading
      return;
    }
    // Check if user is authenticated as merchant
    if (!isAuthenticated || !token || user?.role !== "merchant") {
      // Store the current URL to redirect back after login
      const redirectUrl = `/merchant/scan/redeem?token=${tokenParam || ""}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setAuthChecked(true);
    // }, [token, user, router, tokenParam]);
  }, [isHydrated, isAuthenticated, token, user, router, tokenParam]);

  // Load redemption data - only after auth check
  useEffect(() => {
    if (!authChecked) return;

    if (!tokenParam) {
      setError("Invalid QR code. Please scan again.");
      setLoading(false);
      return;
    }

    // Decode and validate the token
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(tokenParam)));
      setRedemptionData(decoded);
      setLoading(false);
    } catch (err) {
      setError("Invalid QR code format. Please scan again.");
      setLoading(false);
    }
  }, [tokenParam, authChecked]);

  const handleConfirmRedemption = async () => {
    if (!redemptionData) return;

    setProcessing(true);
    try {
      const response = await api.post(
        "/merchant/promotions/redeem",
        {
          promotion_id: redemptionData.promotion_id,
          user_id: redemptionData.user_id,
          redemption_token: tokenParam,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      dispatch(
        addNotification({
          type: "success",
          message: "Promotion redeemed successfully!",
        }),
      );

      setRedemptionData({
        ...redemptionData,
        redeemed: true,
        redemption_result: response.data.data,
      });

      // Stay on the page after successful redemption
      // User can manually navigate away
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message:
            error.response?.data?.message || "Failed to redeem promotion",
        }),
      );
      setRedemptionData({
        ...redemptionData,
        redemption_error: error.response?.data?.message || "Redemption failed",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Loading state for redemption data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading redemption details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-700 mt-4">
            Invalid QR Code
          </h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => router.push("/merchant/scan")}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Scan Again
          </button>
        </div>
      </div>
    );
  }

  if (!redemptionData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-yellow-700">No Data Found</h2>
          <p className="text-yellow-600 mt-2">Please scan a valid QR code.</p>
          <button
            onClick={() => router.push("/merchant/scan")}
            className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Scan QR Code
          </button>
        </div>
      </div>
    );
  }

  const isRedeemed = redemptionData.redeemed;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6" />
            Promotion Redemption
          </h1>
          <p className="text-purple-100 text-sm mt-1">
            Confirm and redeem the promotion for the customer
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Customer</p>
                <p className="text-sm text-gray-500">
                  ID: {redemptionData.user_id}
                </p>
                <p className="text-sm text-gray-500">
                  {redemptionData.user_email}
                </p>
              </div>
            </div>
          </div>

          {/* Promotion Details */}
          <div className="border rounded-lg divide-y">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Promotion</span>
              </div>
              <span className="font-medium">{redemptionData.promotion_id}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Value</span>
              </div>
              <span className="font-medium text-green-600">
                ₱{redemptionData.value || 0}
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Requested</span>
              </div>
              <span className="text-sm text-gray-500">
                {redemptionData.timestamp
                  ? new Date(redemptionData.timestamp).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Redemption Status */}
          {isRedeemed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="font-bold text-green-700 mt-2">
                Redeemed Successfully!
              </h3>
              <p className="text-sm text-green-600 mt-1">
                The promotion has been redeemed.
              </p>
              {redemptionData.redemption_result && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    Used: {redemptionData.redemption_result.used_count || 0}
                  </p>
                  <p>
                    Remaining: {redemptionData.redemption_result.remaining || 0}
                  </p>
                </div>
              )}
              <button
                onClick={() => router.push("/merchant/dashboard")}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : redemptionData.redemption_error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="font-bold text-red-700 mt-2">Redemption Failed</h3>
              <p className="text-sm text-red-600 mt-1">
                {redemptionData.redemption_error}
              </p>
              <button
                onClick={() => router.push("/merchant/dashboard")}
                className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">
                      Confirm Redemption
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify the customer is present and confirm the
                      redemption.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/merchant/dashboard")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRedemption}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Confirm Redemption
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
