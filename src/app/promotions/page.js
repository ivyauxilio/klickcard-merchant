"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import {
  getPromotions,
  deletePromotion,
  setFilters,
  clearFilters,
  selectPromotions,
  selectPromotionPagination,
  selectPromotionStats,
  selectPromotionLoading,
  selectPromotionError,
  selectPromotionFilters,
} from "@/store/slices/promotionSlice";
import { addNotification } from "@/store/slices/uiSlice";
import DeleteButton from "@/components/ui/DeleteButton";

export default function PromotionsPage() {
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);

  const items = useSelector(selectPromotions);
  const pagination = useSelector(selectPromotionPagination);
  const stats = useSelector(selectPromotionStats);
  const loading = useSelector(selectPromotionLoading);
  const error = useSelector(selectPromotionError);
  const filters = useSelector(selectPromotionFilters);

  const promoTypes = ["percentage", "fixed", "bogo"];
  const statuses = ["active", "inactive", "expired"];

  // Load promotions
  useEffect(() => {
    dispatch(getPromotions(filters));
  }, [dispatch, filters]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    dispatch(setFilters({ search }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  // Clear filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    dispatch(setFilters({ page }));
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      percentage: "bg-blue-100 text-blue-800",
      fixed: "bg-purple-100 text-purple-800",
      bogo: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your promotions and discounts
          </p>
        </div>
        <Link
          href="/promotions/create"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Promotion
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-xl font-bold text-gray-600">{stats.inactive}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-xl font-bold text-red-600">{stats.expired}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Search promotions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
            <span>Filters</span>
            {(filters.status || filters.promo_type) && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                Active
              </span>
            )}
          </button>

          {(filters.status || filters.promo_type) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promo Type
              </label>
              <select
                value={filters.promo_type || ""}
                onChange={(e) =>
                  handleFilterChange("promo_type", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                {promoTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.promotion_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={`/promotions/${item.promotion_id}`}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(item.promo_type)}`}
                      >
                        {item.promo_type.charAt(0).toUpperCase() +
                          item.promo_type.slice(1)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                      {/* QR Code Indicator */}
                      {item.qr_code && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                          <QrCodeIcon className="w-3 h-3" />
                          QR
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {item.promo_type === "percentage"
                      ? `${item.value}%`
                      : item.promo_type === "fixed"
                        ? `₱${parseFloat(item.value).toFixed(2)}`
                        : "BOGO"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {item.description || "No description"}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      <span className="font-medium">Min Order:</span>{" "}
                      {item.min_order_amount
                        ? `₱${parseFloat(item.min_order_amount).toFixed(2)}`
                        : "None"}
                    </span>
                    <span className="text-gray-500">
                      <span className="font-medium">Uses:</span>{" "}
                      {item.used_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-500">
                      <span className="font-medium">Valid:</span>{" "}
                      {item.start_date
                        ? new Date(item.start_date).toLocaleDateString()
                        : "N/A"}
                      {item.end_date &&
                        ` - ${new Date(item.end_date).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/promotions/${item.promotion_id}`}
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/promotions/${item.promotion_id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <DeleteButton
                    itemId={item.promotion_id}
                    page="Promotion Item"
                    itemName={item.title}
                    onSuccess={() => dispatch(getPromotions(filters))}
                    variant="icon"
                    deleteApi={() => deletePromotion(item.promotion_id)}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No promotions yet
          </h3>
          <p className="text-gray-500 mt-2">
            Create your first promotion to attract more customers.
          </p>
          <Link
            href="/promotions/create"
            className="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Promotion
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.perPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.total,
            )}{" "}
            of {pagination.total} items
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from(
              { length: Math.min(pagination.lastPage, 5) },
              (_, i) => {
                let page = pagination.currentPage;
                if (pagination.lastPage <= 5) {
                  page = i + 1;
                } else if (pagination.currentPage <= 3) {
                  page = i + 1;
                } else if (pagination.currentPage >= pagination.lastPage - 2) {
                  page = pagination.lastPage - 4 + i;
                } else {
                  page = pagination.currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded-lg ${
                      page === pagination.currentPage
                        ? "bg-primary-600 text-white border-primary-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              },
            )}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
