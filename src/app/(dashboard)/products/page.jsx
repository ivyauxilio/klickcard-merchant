// app/merchant/products/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  StarIcon,
  ShoppingBagIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { addNotification } from "@/store/slices/uiSlice";
import {
  fetchProducts,
  fetchProductStats,
  fetchProductCategories,
  deleteProduct,
  toggleProductStatus,
  toggleProductFeatured,
  duplicateProduct,
  bulkUpdateStock,
  selectProducts,
  selectPagination,
  selectProductStats,
  selectProductCategories,
  selectProductLoading,
  selectProductDeleting,
  setFilters,
  removeProductFromList,
} from "@/store/slices/productSlice";
import DeleteModal from "@/components/modals/DeleteModal";
import BulkStockModal from "@/components/modals/BulkStockModal";
import ProductFilters from "@/components/products/ProductFilters";

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // ✅ Redux state
  const products = useSelector(selectProducts);
  const pagination = useSelector(selectPagination);
  const stats = useSelector(selectProductStats);
  const categories = useSelector(selectProductCategories);
  const loading = useSelector(selectProductLoading);
  const deleting = useSelector(selectProductDeleting);

  // Local state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Fetch data with Redux
  const loadProducts = useCallback(() => {
    dispatch(
      fetchProducts({
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        per_page: pagination.per_page,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    category,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    pagination.per_page,
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    dispatch(fetchProductStats());
    dispatch(fetchProductCategories());
  }, [dispatch]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await dispatch(deleteProduct(productToDelete.product_id)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Product deleted successfully",
        }),
      );
      setShowDeleteModal(false);
      setProductToDelete(null);
      dispatch(fetchProductStats());
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.message || "Failed to delete product",
        }),
      );
    }
  };

  const handleBulkStockUpdate = async (stockData) => {
    try {
      await dispatch(bulkUpdateStock(stockData)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Stock updated successfully",
        }),
      );
      setShowBulkStockModal(false);
      setSelectedProducts([]);
      loadProducts();
      dispatch(fetchProductStats());
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.message || "Failed to update stock",
        }),
      );
    }
  };

  const handleDuplicate = async (productId) => {
    try {
      await dispatch(duplicateProduct(productId)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Product duplicated successfully",
        }),
      );
      dispatch(fetchProductStats());
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.message || "Failed to duplicate product",
        }),
      );
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await dispatch(toggleProductStatus(productId)).unwrap();
      dispatch(fetchProductStats());
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.message || "Failed to toggle status",
        }),
      );
    }
  };

  const handleToggleFeatured = async (productId) => {
    try {
      await dispatch(toggleProductFeatured(productId)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Featured status updated",
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.message || "Failed to toggle featured",
        }),
      );
    }
  };

  // Select helpers
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.product_id));
    }
  };

  const toggleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  // ============================================
  // HELPERS
  // ============================================

  const getStockStatus = (product) => {
    if (product.stock_quantity === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
      };
    }
    if (product.stock_quantity <= product.min_stock_alert) {
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-800",
        icon: ExclamationTriangleIcon,
      };
    }
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-800",
      icon: CheckCircleIcon,
    };
  };

  // ✅ FIXED: Properly detect active discount
  const getDiscountInfo = (product) => {
    if (!product.discounts || !Array.isArray(product.discounts)) return null;

    const now = new Date();
    const activeDiscount = product.discounts.find((d) => {
      if (!d.is_active) return false;
      const start = d.start_date ? new Date(d.start_date) : null;
      const end = d.end_date ? new Date(d.end_date) : null;
      if (start && start > now) return false;
      if (end && end < now) return false;
      return true;
    });

    if (!activeDiscount) return null;

    if (activeDiscount.type === "percentage") {
      return {
        label: `${activeDiscount.value}% OFF`,
        color: "bg-red-500 text-white",
      };
    } else if (activeDiscount.type === "fixed") {
      return {
        label: `-₱${parseFloat(activeDiscount.value).toFixed(2)}`,
        color: "bg-red-500 text-white",
      };
    } else if (activeDiscount.type === "bogo") {
      return { label: "BOGO", color: "bg-purple-500 text-white" };
    }
    return null;
  };

  // ✅ Check if product has active points
  const hasActivePoints = (product) => {
    if (!product.points) return false;
    if (!product.points.is_active) return false;
    const now = new Date();
    const start = product.points.start_date
      ? new Date(product.points.start_date)
      : null;
    const end = product.points.end_date
      ? new Date(product.points.end_date)
      : null;
    if (start && start > now) return false;
    if (end && end < now) return false;
    return true;
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            Manage your grocery products, discounts, and points
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setShowBulkStockModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Bulk Update ({selectedProducts.length})
            </button>
          )}
          <Link
            href="/products/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total</p>
            <ShoppingBagIcon className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">In Stock</p>
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.in_stock}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Low Stock</p>
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.low_stock}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <XCircleIcon className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats.out_of_stock}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Active Discounts</p>
            <CurrencyDollarIcon className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.active_discounts}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <ProductFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onFilter={() => setCurrentPage(1)}
          onClear={() => {
            setSearch("");
            setCategory("");
            setStatusFilter("all");
            setSortBy("created_at");
            setSortOrder("desc");
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Products */}
      {products.length === 0 && !loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No products found
          </h3>
          <p className="text-gray-500">
            Get started by adding your first product
          </p>
          <Link
            href="/products/create"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const discountInfo = getDiscountInfo(product);
            const StatusIcon = stockStatus.icon;

            return (
              <div
                key={product.product_id}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
              >
                {/* Selection checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.product_id)}
                    onChange={() => toggleSelectProduct(product.product_id)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>

                {/* Image */}
                <Link href={`/products/${product.product_id}`}>
                  <div className="relative aspect-square bg-gray-100">
                    {product.image_url ? (
                      <Image
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBagIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    {/* ✅ Discount badge */}
                    {discountInfo && (
                      <div
                        className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${discountInfo.color}`}
                      >
                        {discountInfo.label}
                      </div>
                    )}
                    {product.is_featured && (
                      <div className="absolute top-2 left-8 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <StarIcon className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₱{parseFloat(product.price).toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₱{parseFloat(product.original_price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* ✅ Discount + Points indicators */}
                  <div className="flex items-center gap-3 text-xs">
                    {discountInfo && (
                      <span className="flex items-center gap-1 text-red-600 font-medium">
                        <TagIcon className="w-3 h-3" />
                        {discountInfo.label}
                      </span>
                    )}
                    {hasActivePoints(product) && (
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        <StarIcon className="w-3 h-3" />
                        {product.points.points_per_item} pts
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShoppingBagIcon className="w-4 h-4" />
                      {product.stock_quantity} {product.unit}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/products/${product.product_id}`}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </Link>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFeatured(product.product_id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.is_featured
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product.product_id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.is_active
                            ? "text-green-500 hover:text-green-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {product.is_active ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <XCircleIcon className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/products/${product.product_id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(product.product_id)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total,
            )}{" "}
            of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.current_page === 1}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
              }
              disabled={pagination.current_page === pagination.last_page}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />

      <BulkStockModal
        isOpen={showBulkStockModal}
        onClose={() => setShowBulkStockModal(false)}
        onConfirm={handleBulkStockUpdate}
        products={products.filter((p) =>
          selectedProducts.includes(p.product_id),
        )}
        loading={false}
      />
    </div>
  );
}
