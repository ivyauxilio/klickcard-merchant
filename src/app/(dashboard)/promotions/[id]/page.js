"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  QrCodeIcon,
  UserGroupIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import {
  getPromotion,
  selectCurrentPromotion,
  selectPromotionLoading,
  selectPromotionError,
  clearCurrentPromotion,
  clearError,
} from "@/store/slices/promotionSlice";
import DeleteButton from "@/components/ui/DeleteButton";
import QRCodeDisplay from "@/components/promotion/QRCodeDisplay";
import { getImageUrl } from "@/lib/image";

export default function PromotionDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const promotion = useSelector(selectCurrentPromotion);
  const isLoading = useSelector(selectPromotionLoading);
  const error = useSelector(selectPromotionError);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getPromotion(id));
    }
    return () => {
      dispatch(clearCurrentPromotion());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type) => {
    const labels = {
      percentage: "Percentage Discount",
      fixed: "Fixed Amount Off",
      bogo: "Buy One Get One",
    };
    return labels[type] || type;
  };

  if (isLoading && !promotion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promotion...</p>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Promotion not found
        </h3>
        <Link
          href="/promotions"
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Back to promotions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/promotions"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {promotion.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {getTypeLabel(promotion.promo_type)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/promotions/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Link>
          <DeleteButton
            itemId={id}
            itemName={promotion.title}
            page="Promotion Item"
            onSuccess={() => router.push("/promotions")}
            variant="button"
            deleteApi={() => deletePromotion(id)}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column - Promotion Details */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(promotion.status)}`}
                >
                  {promotion.status.charAt(0).toUpperCase() +
                    promotion.status.slice(1)}
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  {promotion.promo_type === "percentage"
                    ? `${promotion.value}% OFF`
                    : promotion.promo_type === "fixed"
                      ? `₱${parseFloat(promotion.value).toFixed(2)} OFF`
                      : "BOGO"}
                </span>
              </div>

              {/* Description */}
              {promotion.description && (
                <div>
                  <p className="text-gray-600">{promotion.description}</p>
                </div>
              )}

              <hr />

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">
                      {getTypeLabel(promotion.promo_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Min Order:</span>
                    <span className="font-medium">
                      {promotion.min_order_amount
                        ? `₱${parseFloat(promotion.min_order_amount).toFixed(2)}`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">
                      Usage Limit per person:
                    </span>
                    <span className="font-medium">
                      {promotion.total_usage_limit || "Unlimited"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Total Usage Limit:</span>
                    <span className="font-medium">
                      {promotion.usage_limit || "Unlimited"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Start Date:</span>
                    <span className="font-medium">
                      {promotion.start_date
                        ? new Date(promotion.start_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">End Date:</span>
                    <span className="font-medium">
                      {promotion.end_date
                        ? new Date(promotion.end_date).toLocaleDateString()
                        : "No expiry"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Times Used:</span>
                    <span className="font-medium">
                      {promotion.used_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-gray-500" />
                Promotion Poster
              </h3>

              {promotion.poster_image_url || promotion.poster_image ? (
                <div className="relative w-full aspect-[15/9] bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    // src={promotion.poster_image_url || promotion.poster_image}
                    src={getImageUrl(
                      promotion.poster_image_url || promotion.poster_image,
                    )}
                    alt={promotion.title || "Promotion poster"}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">
                          Image failed to load
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">
                      No poster image uploaded
                    </p>
                    <Link
                      href={`/promotions/${id}/edit`}
                      className="text-sm text-primary-600 hover:underline mt-2 inline-block"
                    >
                      Upload a poster
                    </Link>
                  </div>
                </div>
              )}

              {/* Image Info */}
              {promotion.poster_image && (
                <div className="mt-3 text-xs text-gray-500">
                  <p>File: {promotion.poster_image.split("/").pop()}</p>
                  {promotion.poster_thumbnail && <p>Thumbnail available</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - QR Code */}
        <div>
          <QRCodeDisplay promotion={promotion} />
        </div>
      </div>
    </div>
  );
}
