// import CreatePromotionGate from "@/components/promotions/CreatePromotionGate";

// export default function CreatePromotionPage() {
//   return (
//     <CreatePromotionGate creditsNeeded={1}>
//       {/* Your existing create promotion form */}
//     </CreatePromotionGate>
//   );
// }
// app/merchant/promotions/create/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TagIcon,
  CurrencyDollarIcon,
  BoltIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/axios";
import { addNotification } from "@/store/slices/uiSlice";
import {
  fetchWallet,
  selectWallet,
  updateBalance,
} from "@/store/slices/walletSlice";
import InsufficientCreditsModal from "@/components/promotion/InsufficientCreditsModal";

const voucherTypes = [
  {
    id: "basic",
    label: "Basic Voucher",
    credits: 1,
    description: "Standard discount for everyday promotions",
    color: "purple",
  },
  {
    id: "featured",
    label: "Featured Voucher",
    credits: 2,
    description: "Highlighted placement for more visibility",
    color: "indigo",
  },
  {
    id: "priority",
    label: "Priority Voucher",
    credits: 5,
    description: "Top exposure across platforms",
    color: "yellow",
  },
];

export default function CreatePromotionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wallet = useSelector(selectWallet);

  const [loading, setLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    promo_type: "percentage",
    value: "",
    voucher_type: "basic",
    start_date: "",
    end_date: "",
    min_order_amount: "",
    usage_limit: "",
    total_usage_limit: "",
  });

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  // ✅ Auto-check credits when voucher type changes
  const selectedVoucher =
    voucherTypes.find((v) => v.id === formData.voucher_type) || voucherTypes[0];

  const hasEnoughCredits =
    (wallet?.credit_balance ?? 0) >= selectedVoucher.credits;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prevent submission if insufficient credits — show modal instead
    if (!hasEnoughCredits) {
      setCreditInfo({
        requiredCredits: selectedVoucher.credits,
        availableCredits: wallet?.credit_balance ?? 0,
        voucherType: formData.voucher_type,
      });
      setShowCreditsModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/merchant/promotions", formData);

      if (response.data.success) {
        // ✅ Update wallet balance in Redux
        dispatch(updateBalance(response.data.data.credits.remaining));

        dispatch(
          addNotification({
            type: "success",
            message: response.data.message,
          }),
        );

        router.push("/merchant/promotions");
      }
    } catch (error) {
      // ✅ Handle 402 Payment Required
      if (error.response?.status === 402) {
        const data = error.response.data;

        if (data.error_code === "INSUFFICIENT_CREDITS") {
          setCreditInfo({
            requiredCredits: data.data.required_credits,
            availableCredits: data.data.available_credits,
            voucherType: data.data.voucher_type,
          });
          setShowCreditsModal(true);
          // Refresh wallet
          dispatch(fetchWallet());
          return;
        }
      }

      dispatch(
        addNotification({
          type: "error",
          message:
            error.response?.data?.message || "Failed to create promotion",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Promotion
            </h1>
            <p className="text-sm text-gray-500">
              Create a new promotion using promo credits
            </p>
          </div>
        </div>

        {/* ✅ Credit Balance Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            hasEnoughCredits
              ? "bg-purple-100 text-purple-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <BoltIcon className="w-5 h-5" />
          {wallet?.credit_balance ?? 0} credits
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 20% Off All Products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe the promotion..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo Type *
                  </label>
                  <select
                    name="promo_type"
                    value={formData.promo_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="bogo">Buy One Get One</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={
                      formData.promo_type === "percentage" ? "20" : "100"
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Voucher Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose Voucher Type
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {voucherTypes.map((type) => {
                  const isSelected = formData.voucher_type === type.id;
                  const canAfford =
                    (wallet?.credit_balance ?? 0) >= type.credits;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          voucher_type: type.id,
                        }))
                      }
                      className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!canAfford ? "opacity-60" : ""}`}
                    >
                      {isSelected && (
                        <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-purple-600" />
                      )}

                      <TagIcon className="w-8 h-8 text-purple-600 mb-2" />

                      <p className="font-bold text-gray-900">{type.label}</p>

                      <div className="flex items-center gap-1 mt-1 mb-2">
                        <BoltIcon className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-purple-700">
                          {type.credits} credits
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        {type.description}
                      </p>

                      {!canAfford && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          Not enough credits
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Limits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Usage Limits
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Order (₱)
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Limit
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    name="total_usage_limit"
                    value={formData.total_usage_limit}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg p-6 text-white">
              <p className="text-purple-200 text-sm mb-1">Cost to create</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">
                  {selectedVoucher.credits}
                </span>
                <span className="text-purple-200">credits</span>
              </div>

              <div className="pt-4 border-t border-purple-500/30 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Current Balance</span>
                  <span className="font-bold">
                    {wallet?.credit_balance ?? 0} credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">After Creation</span>
                  <span
                    className={`font-bold ${
                      hasEnoughCredits ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {hasEnoughCredits
                      ? (wallet?.credit_balance ?? 0) - selectedVoucher.credits
                      : "N/A"}{" "}
                    credits
                  </span>
                </div>
              </div>
            </div>

            {/* Warning if insufficient */}
            {!hasEnoughCredits && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <BoltIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900">
                      Not enough credits
                    </p>
                    <p className="text-red-700 mt-1">
                      You need{" "}
                      {selectedVoucher.credits - (wallet?.credit_balance ?? 0)}{" "}
                      more credits to create this promotion.
                    </p>
                    <Link
                      href="/merchant/subscription"
                      className="mt-3 inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-semibold text-sm"
                    >
                      Buy credits →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg ${
                hasEnoughCredits
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 shadow-purple-600/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating...
                </>
              ) : hasEnoughCredits ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Create Promotion
                </>
              ) : (
                <>
                  <BoltIcon className="w-5 h-5" />
                  Not Enough Credits
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ✅ Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        requiredCredits={creditInfo?.requiredCredits ?? 0}
        availableCredits={creditInfo?.availableCredits ?? 0}
        voucherType={creditInfo?.voucherType ?? "basic"}
      />
    </div>
  );
}
