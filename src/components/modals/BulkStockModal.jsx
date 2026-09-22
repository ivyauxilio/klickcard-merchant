// components/modals/BulkStockModal.jsx
"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CubeIcon } from "@heroicons/react/24/outline";

export default function BulkStockModal({
  isOpen,
  onClose,
  onConfirm,
  products,
  loading = false,
}) {
  const [stockData, setStockData] = useState(
    products.reduce(
      (acc, product) => ({
        ...acc,
        [product.product_id]: product.stock_quantity,
      }),
      {},
    ),
  );

  const handleStockChange = (productId, value) => {
    setStockData((prev) => ({
      ...prev,
      [productId]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = () => {
    const data = Object.entries(stockData).map(([productId, stock]) => ({
      product_id: productId,
      stock_quantity: stock,
    }));
    onConfirm(data);
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CubeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Bulk Update Stock
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-gray-500">
                      Update stock for {products.length} selected products
                    </p>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.product_id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {product.sku} | Current:{" "}
                            {product.stock_quantity} {product.unit}
                          </p>
                        </div>
                        <input
                          type="number"
                          value={stockData[product.product_id] || 0}
                          onChange={(e) =>
                            handleStockChange(
                              product.product_id,
                              e.target.value,
                            )
                          }
                          min="0"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Stock"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
