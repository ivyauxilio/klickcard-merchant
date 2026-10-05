// app/merchant/products/[id]/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import {
  ArrowLeftIcon,
  PencilIcon,
  TagIcon,
  CurrencyDollarIcon,
  StarIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import {
  fetchProductById,
  selectCurrentProduct,
  selectCurrentProductLoading,
  clearCurrentProduct,
} from "@/store/slices/productSlice";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const productId = params.id;

  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectCurrentProductLoading);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
        <Link
          href="/products"
          className="text-purple-600 hover:underline mt-2 inline-block"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const getStockStatus = () => {
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

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  // ✅ Get active discount
  const activeDiscount = product.discounts?.find((d) => {
    if (!d.is_active) return false;
    const now = new Date();
    if (d.start_date && new Date(d.start_date) > now) return false;
    if (d.end_date && new Date(d.end_date) < now) return false;
    return true;
  });

  // ✅ Get active points
  const activePoints = product.points?.is_active ? product.points : null;

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
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
        </div>
        <Link
          href={`/products/${product.product_id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative aspect-video bg-gray-100">
              {product.image_url ? (
                <Image
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PhotoIcon className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Product Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sub Category</p>
                <p className="font-medium">{product.sub_category || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">{product.brand || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">
                  {product.unit}{" "}
                  {product.unit_value ? `(${product.unit_value})` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{product.weight || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country of Origin</p>
                <p className="font-medium">
                  {product.country_of_origin || "N/A"}
                </p>
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{product.description}</p>
              </div>
            )}

            {product.nutritional_info && (
              <div>
                <p className="text-sm text-gray-500">Nutritional Info</p>
                <p className="mt-1">{product.nutritional_info}</p>
              </div>
            )}
          </div>

          {/* ✅ Discounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-purple-600" />
              Discounts
            </h3>

            {product.discounts && product.discounts.length > 0 ? (
              <div className="space-y-3">
                {product.discounts.map((discount) => {
                  const isActive = discount.is_active;
                  return (
                    <div
                      key={discount.discount_id}
                      className={`rounded-lg p-4 border ${
                        isActive
                          ? "bg-purple-50 border-purple-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-bold text-lg ${
                            isActive ? "text-purple-700" : "text-gray-500"
                          }`}
                        >
                          {discount.type === "percentage"
                            ? `${discount.value}% OFF`
                            : discount.type === "fixed"
                              ? `₱${parseFloat(discount.value).toFixed(2)} OFF`
                              : "BUY 1 GET 1"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Start:{" "}
                          {discount.start_date
                            ? new Date(discount.start_date).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          End:{" "}
                          {discount.end_date
                            ? new Date(discount.end_date).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <CubeIcon className="w-4 h-4" />
                          Min Qty: {discount.min_quantity || 1}
                        </div>
                        <div className="flex items-center gap-1">
                          <TagIcon className="w-4 h-4" />
                          Used: {discount.used_count || 0}
                          {discount.usage_limit
                            ? ` / ${discount.usage_limit}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <TagIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No discounts set for this product</p>
                <Link
                  href={`/products/${product.product_id}/edit`}
                  className="text-purple-600 hover:underline text-sm mt-2 inline-block"
                >
                  Add discount
                </Link>
              </div>
            )}
          </div>

          {/* ✅ Points */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              Points Settings
            </h3>

            {product.points ? (
              <div
                className={`rounded-lg p-4 border ${
                  product.points.is_active
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-yellow-700">
                    {product.points.points_per_item} pts/item
                    {product.points.points_per_php > 0 &&
                      ` + ${product.points.points_per_php} pts/₱`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.points.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {product.points.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Min Spend: ₱{product.points.min_spend || 0}</div>
                  {product.points.max_points && (
                    <div>Max Points: {product.points.max_points}</div>
                  )}
                  {product.points.start_date && (
                    <div>
                      Start:{" "}
                      {new Date(product.points.start_date).toLocaleDateString()}
                    </div>
                  )}
                  {product.points.end_date && (
                    <div>
                      End:{" "}
                      {new Date(product.points.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <StarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No points set for this product</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Price</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₱{parseFloat(product.price).toFixed(2)}
                </span>
              </div>
              {product.original_price && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Original</span>
                  <span className="text-gray-400 line-through">
                    ₱{parseFloat(product.original_price).toFixed(2)}
                  </span>
                </div>
              )}
              {activeDiscount && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-gray-700 font-medium">
                    After Discount
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    ₱
                    {activeDiscount.type === "percentage"
                      ? (
                          parseFloat(product.price) -
                          (parseFloat(product.price) * activeDiscount.value) /
                            100
                        ).toFixed(2)
                      : Math.max(
                          0,
                          parseFloat(product.price) -
                            parseFloat(activeDiscount.value),
                        ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Stock</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                >
                  <StockIcon className="w-3 h-3" />
                  {product.stock_quantity} {product.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Min Alert</span>
                <span className="font-medium">{product.min_stock_alert}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {product.is_featured && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Featured</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Yes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Sold</span>
                <span className="font-medium">{product.total_sold || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Revenue</span>
                <span className="font-medium">
                  ₱{parseFloat(product.total_revenue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
