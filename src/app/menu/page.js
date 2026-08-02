"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  getMenuItems,
  deleteMenuItem,
  setFilters,
  clearFilters,
  getMenuCategories,
  selectMenuItems,
  selectMenuPagination,
  selectMenuStats,
  selectMenuCategories,
  selectMenuLoading,
  selectMenuError,
  selectMenuFilters,
} from "@/store/slices/menuSlice";
import { addNotification } from "@/store/slices/uiSlice";
import DeleteButton from "@/components/ui/DeleteButton";

import { getImageUrl } from "@/lib/image";

export default function MenuItemsPage() {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const items = useSelector(selectMenuItems);
  const pagination = useSelector(selectMenuPagination);
  const stats = useSelector(selectMenuStats);
  const categories = useSelector(selectMenuCategories);
  const loading = useSelector(selectMenuLoading);
  const error = useSelector(selectMenuError);
  const filters = useSelector(selectMenuFilters);

  // Load data
  useEffect(() => {
    dispatch(getMenuItems(filters));
    dispatch(getMenuCategories());
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

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsDeleting(true);
    setDeleteId(id);

    try {
      await dispatch(deleteMenuItem(id)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Menu item deleted successfully",
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error || "Failed to delete menu item",
        }),
      );
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    dispatch(setFilters({ page }));
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      unavailable: "bg-gray-100 text-gray-800",
      out_of_stock: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get stock status badge
  const getStockStatusBadge = (status) => {
    const colors = {
      in_stock: "bg-green-100 text-green-800",
      low_stock: "bg-yellow-100 text-yellow-800",
      out_of_stock: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleDeleteSuccess = () => {
    // Refresh the list
    dispatch(getMenuItems(filters));
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your restaurant menu items
          </p>
        </div>
        <Link
          href="/menu/create"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Item
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">In Stock</p>
          <p className="text-xl font-bold text-blue-600">{stats.in_stock}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-xl font-bold text-yellow-600">{stats.low_stock}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-xl font-bold text-red-600">{stats.out_of_stock}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Featured</p>
          <p className="text-xl font-bold text-purple-600">{stats.featured}</p>
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
                placeholder="Search by name, category, or SKU..."
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
            {(filters.category || filters.status || filters.stock_status) && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                Active
              </span>
            )}
          </button>

          {(filters.category || filters.status || filters.stock_status) && (
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div> */}

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
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Status
              </label>
              <select
                value={filters.stock_status || ""}
                onChange={(e) =>
                  handleFilterChange("stock_status", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.menu_item_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              {item.image_url ? (
                <Image
                  // src={`http://localhost:8000/storage/${item.image_url}`}
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
              {/* Status badge */}
              <span
                className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.stock_status)}`}
              >
                {item.stock_status.replaceAll("_", " ")}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3
                className="font-medium text-gray-900 truncate"
                title={item.name}
              >
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description || "No description"}
              </p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-primary-600">
                  ₱{parseFloat(item.price).toFixed(2)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusBadge(item.stock_status)}`}
                >
                  {item.stock_quantity} {item.unit}s
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {item.category || "Uncategorized"}
                  </span>
                  {item.is_featured && (
                    <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* <Link
                    href={`/menu/${item.menu_item_id}`}
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link> */}
                  <Link
                    href={`/menu/${item.menu_item_id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  {/* <button
                    onClick={() => handleDelete(item.menu_item_id)}
                    disabled={isDeleting && deleteId === item.menu_item_id}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {isDeleting && deleteId === item.menu_item_id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button> */}
                  <DeleteButton
                    itemId={item.menu_item_id}
                    itemName={item.name}
                    onSuccess={handleDeleteSuccess}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
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
            No menu items yet
          </h3>
          <p className="text-gray-500 mt-2">
            Get started by adding your first menu item.
          </p>
          <Link
            href="/menu/create"
            className="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Menu Item
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
