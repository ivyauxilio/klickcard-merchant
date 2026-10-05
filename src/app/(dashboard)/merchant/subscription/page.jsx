// app/merchant/subscription/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircleIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  StarIcon,
  BoltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import api from "@/lib/axios";
import { addNotification } from "@/store/slices/uiSlice";

const iconMap = {
  rocket: RocketLaunchIcon,
  chart: ChartBarIcon,
  target: CursorArrowRaysIcon,
  crown: StarSolid,
};

export default function SubscriptionPage() {
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, walletRes] = await Promise.all([
        api.get("/merchant/plans"),
        api.get("/merchant/wallet"),
      ]);
      setPlans(plansRes.data.data);
      setWallet(walletRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan) => {
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async (paymentMethod) => {
    if (!selectedPlan) return;

    setPurchasing(selectedPlan.plan_id);
    try {
      const response = await api.post("/merchant/plans/purchase", {
        plan_id: selectedPlan.plan_id,
        payment_method: paymentMethod,
      });

      if (response.data.success) {
        dispatch(
          addNotification({
            type: "success",
            message: response.data.message,
          }),
        );
        setWallet(response.data.data.wallet);
        setShowPurchaseModal(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.response?.data?.message || "Purchase failed",
        }),
      );
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <SparklesIcon className="w-4 h-4" />
            PROMO CREDIT SYSTEM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Merchant <span className="text-purple-700">Promotion Boost</span>
          </h1>
          <p className="text-lg text-purple-700 font-medium mb-2">
            More Marketing Power. More Customers. More Results.
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Buy Promo Credits. Create powerful promos. Attract more customers.
            Drive more sales.
          </p>
        </div>

        {/* Wallet Card */}
        {wallet && (
          <div className="max-w-md mx-auto mb-12 bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Your Credit Balance</p>
                <p className="text-4xl font-bold">{wallet.credit_balance}</p>
                <p className="text-purple-200 text-xs mt-1">
                  Promo Credits available
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-200 text-xs">Total Spent</p>
                <p className="text-xl font-bold">
                  ₱{parseFloat(wallet.total_spent).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const IconComponent = iconMap[plan.icon] || RocketLaunchIcon;
            const isPopular = plan.is_popular;

            return (
              <div
                key={plan.plan_id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isPopular ? "ring-4 ring-purple-500" : ""
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 text-center">
                  <h3 className="text-lg font-bold mb-4">
                    {plan.name.toUpperCase()}
                  </h3>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/50 rounded-full flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-yellow-400" />
                  </div>

                  {/* Price */}
                  <p className="text-4xl font-bold mb-1">
                    ₱{parseFloat(plan.price).toFixed(0)}
                  </p>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Credits */}
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      {plan.base_credits}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      PROMO CREDITS
                    </p>

                    {plan.bonus_credits > 0 && (
                      <div className="mt-2 inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        +{plan.bonus_credits} FREE CREDITS
                      </div>
                    )}

                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <p className="text-2xl font-bold text-gray-900">
                        {plan.total_credits}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        TOTAL CREDITS
                      </p>
                    </div>
                  </div>

                  {/* Cost per credit */}
                  <div className="bg-purple-50 rounded-lg p-3 text-center mb-4">
                    <p className="text-xs text-purple-700 font-medium">
                      EFFECTIVE COST
                    </p>
                    <p className="text-lg font-bold text-purple-900">
                      ₱{parseFloat(plan.cost_per_credit).toFixed(2)} / CREDIT
                    </p>

                    {/* Stars */}
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolid
                          key={i}
                          className={`w-3 h-3 ${
                            i < plan.star_rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-purple-600 font-semibold mt-1">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Features */}
                  {plan.features && (
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={purchasing === plan.plan_id}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 shadow-lg"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    } disabled:opacity-50`}
                  >
                    {purchasing === plan.plan_id
                      ? "Processing..."
                      : "PURCHASE NOW"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credit Usage Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-center text-purple-900 mb-8">
            CREDIT USAGE FLEXIBILITY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-purple-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-purple-900 mb-1">BASIC VOUCHER</h3>
              <p className="text-2xl font-bold text-purple-700 mb-2">
                1 CREDIT
              </p>
              <p className="text-sm text-gray-600">
                Standard discount for everyday promotions
              </p>
            </div>

            <div className="border-2 border-purple-300 rounded-xl p-6 text-center bg-purple-50">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-purple-900 mb-1">
                FEATURED VOUCHER
              </h3>
              <p className="text-2xl font-bold text-purple-700 mb-2">
                2 CREDITS
              </p>
              <p className="text-sm text-gray-600">
                Highlighted placement for more visibility
              </p>
            </div>

            <div className="border-2 border-purple-400 rounded-xl p-6 text-center bg-gradient-to-br from-purple-100 to-yellow-50">
              <div className="w-12 h-12 bg-purple-800 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3-5
              </div>
              <h3 className="font-bold text-purple-900 mb-1">
                PRIORITY / BOOSTED
              </h3>
              <p className="text-2xl font-bold text-purple-700 mb-2">
                3-5 CREDITS
              </p>
              <p className="text-sm text-gray-600">
                Top exposure across platforms for maximum impact
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl p-4 text-center">
            <p className="text-white font-bold flex items-center justify-center gap-2">
              <BoltIcon className="w-5 h-5 text-yellow-400" />
              YOU DECIDE HOW TO USE YOUR CREDITS. MAXIMUM FLEXIBILITY. MAXIMUM
              RESULTS.
            </p>
          </div>
        </div>

        {/* Growth Engine Callout */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <BoltIcon className="w-10 h-10 text-purple-900" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">
                MORE THAN DISCOUNTS. IT'S A GROWTH ENGINE.
              </h3>
              <ul className="space-y-2 text-purple-100">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-400" />
                  Build stronger customer loyalty
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-400" />
                  Increase foot traffic & sales
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-400" />
                  Promote anytime, your way
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-400" />
                  Real-time results & analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-400" />
                  Scale your business with confidence
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Purchase
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedPlan.name} - {selectedPlan.total_credits} credits for ₱
              {selectedPlan.price}
            </p>

            <p className="font-medium text-gray-700 mb-3">
              Select payment method:
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {["gcash", "card", "bank_transfer"].map((method) => (
                <button
                  key={method}
                  onClick={() => confirmPurchase(method)}
                  disabled={purchasing !== null}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors text-center disabled:opacity-50"
                >
                  <p className="text-sm font-medium capitalize">
                    {method.replace("_", " ")}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPurchaseModal(false);
                setSelectedPlan(null);
              }}
              disabled={purchasing !== null}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
