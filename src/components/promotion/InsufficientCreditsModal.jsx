"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  requiredCredits = 0,
  availableCredits = 0,
  voucherType = "basic",
}) {
  const shortfall = Math.max(0, requiredCredits - availableCredits);

  const voucherLabels = {
    basic: "Basic Voucher",
    featured: "Featured Voucher",
    priority: "Priority Voucher",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-red-500 to-orange-500 px-6 py-6 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                      <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Not Enough Credits</h3>
                      <p className="text-white/80 text-sm mt-0.5">
                        You need more credits to create this promotion
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        Voucher Type
                      </span>
                      <span className="font-semibold text-gray-900">
                        {voucherLabels[voucherType] || voucherType}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Required</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {requiredCredits}
                        </p>
                        <p className="text-xs text-gray-400">credits</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Available</p>
                        <p
                          className={`text-2xl font-bold ${
                            availableCredits > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {availableCredits}
                        </p>
                        <p className="text-xs text-gray-400">credits</p>
                      </div>

                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-red-600 mb-1">Shortfall</p>
                        <p className="text-2xl font-bold text-red-600">
                          {shortfall}
                        </p>
                        <p className="text-xs text-red-400">credits</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                    <BoltIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-900">
                        Purchase more credits to continue
                      </p>
                      <p className="text-purple-700 mt-1">
                        Buy a Promo Boost package to get credits and unlock more
                        promotion types.
                      </p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <Link
                      href="/merchant/subscription"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 font-medium transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Buy Credits
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
