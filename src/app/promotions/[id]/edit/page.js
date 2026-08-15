"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  QrCodeIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getPromotion,
  updatePromotion,
  selectCurrentPromotion,
  selectPromotionLoading,
  selectPromotionError,
  clearCurrentPromotion,
  clearError,
  fetchMenuItemsForPromotion,
  selectMenuItemsForPromotion,
  selectMenuItemsLoading,
} from "@/store/slices/promotionSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  PROMOTION_TYPES,
  PROMOTION_TYPE_OPTIONS,
} from "@/config/promotionTypes";

export default function EditPromotionPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const promotion = useSelector(selectCurrentPromotion);
  const isLoading = useSelector(selectPromotionLoading);
  const error = useSelector(selectPromotionError);
  const menuItems = useSelector(selectMenuItemsForPromotion);
  const menuItemsLoading = useSelector(selectMenuItemsLoading);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    promo_type: "percentage",
    value: "",
    min_order_amount: "",
    max_discount_amount: "",
    min_quantity: "",
    start_date: "",
    end_date: "",
    status: "active",
    usage_limit_per_user: "",
    total_usage_limit: "",
    is_stackable: false,
    buy_quantity: "",
    get_quantity: "",
    get_discount_percentage: "",
    tiers: [],
    points_multiplier: "",
    free_menu_item_id: "",
    required_menu_item_id: "",
    free_gift_product_id: "",
    bundle_items: [],
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tierMin, setTierMin] = useState("");
  const [tierDiscount, setTierDiscount] = useState("");

  const statusOptions = [
    { value: "active", label: "Active", color: "green" },
    { value: "inactive", label: "Inactive", color: "gray" },
    { value: "expired", label: "Expired", color: "red" },
  ];

  const currentType = PROMOTION_TYPES[formData.promo_type];

  // Load promotion data and menu items
  useEffect(() => {
    if (id) {
      dispatch(getPromotion(id));
    }
    dispatch(fetchMenuItemsForPromotion());
    return () => {
      dispatch(clearCurrentPromotion());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  // Populate form when data loads
  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || "",
        description: promotion.description || "",
        promo_type: promotion.promo_type || "percentage",
        value: promotion.value || "",
        min_order_amount: promotion.min_order_amount || "",
        max_discount_amount: promotion.max_discount_amount || "",
        min_quantity: promotion.min_quantity || "",
        start_date: promotion.start_date?.split("T")[0] || "",
        end_date: promotion.end_date?.split("T")[0] || "",
        status: promotion.status || "active",
        usage_limit_per_user: promotion.usage_limit_per_user || "",
        total_usage_limit: promotion.total_usage_limit || "",
        is_stackable: promotion.is_stackable || false,
        buy_quantity: promotion.buy_quantity || "",
        get_quantity: promotion.get_quantity || "",
        get_discount_percentage: promotion.get_discount_percentage || "",
        tiers: promotion.tiers || [],
        points_multiplier: promotion.points_multiplier || "",
        free_menu_item_id: promotion.free_menu_item_id || "",
        required_menu_item_id: promotion.required_menu_item_id || "",
        free_gift_product_id: promotion.free_gift_product_id || "",
        bundle_items: promotion.bundle_items || [],
      });
      if (promotion.poster_image_url) {
        setPreviewImage(promotion.poster_image_url);
      }
    }
  }, [promotion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPosterFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTier = () => {
    if (tierMin && tierDiscount) {
      setFormData((prev) => ({
        ...prev,
        tiers: [
          ...prev.tiers,
          { min: parseFloat(tierMin), discount: parseFloat(tierDiscount) },
        ],
      }));
      setTierMin("");
      setTierDiscount("");
    }
  };

  const removeTier = (index) => {
    setFormData((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title.trim()) {
      dispatch(
        addNotification({
          type: "error",
          message: "Title is required",
        }),
      );
      setIsSubmitting(false);
      return;
    }

    if (!formData.promo_type) {
      dispatch(
        addNotification({
          type: "error",
          message: "Promotion type is required",
        }),
      );
      setIsSubmitting(false);
      return;
    }

    if (
      ["percentage", "fixed", "first_purchase", "flash_sale"].includes(
        formData.promo_type,
      )
    ) {
      if (!formData.value || parseFloat(formData.value) < 0) {
        dispatch(
          addNotification({
            type: "error",
            message: "Valid value is required",
          }),
        );
        setIsSubmitting(false);
        return;
      }
    }

    // BOGO validation
    if (formData.promo_type === "bogo") {
      if (!formData.required_menu_item_id) {
        dispatch(
          addNotification({
            type: "error",
            message: "Please select the required item (Buy)",
          }),
        );
        setIsSubmitting(false);
        return;
      }
      if (!formData.free_menu_item_id) {
        dispatch(
          addNotification({
            type: "error",
            message: "Please select the free item (Get)",
          }),
        );
        setIsSubmitting(false);
        return;
      }
    }

    // Free Gift validation
    if (formData.promo_type === "free_gift") {
      if (!formData.free_gift_product_id) {
        dispatch(
          addNotification({
            type: "error",
            message: "Please select the free gift item",
          }),
        );
        setIsSubmitting(false);
        return;
      }
    }

    // Bundle validation
    if (formData.promo_type === "bundle") {
      if (!formData.buy_quantity || !formData.get_quantity) {
        dispatch(
          addNotification({
            type: "error",
            message: "Please set buy and get quantities",
          }),
        );
        setIsSubmitting(false);
        return;
      }
    }

    // Buy X Get Y validation
    if (formData.promo_type === "buy_x_get_y") {
      if (
        !formData.buy_quantity ||
        !formData.get_quantity ||
        !formData.get_discount_percentage
      ) {
        dispatch(
          addNotification({
            type: "error",
            message: "Please set all Buy X Get Y fields",
          }),
        );
        setIsSubmitting(false);
        return;
      }
    }

    // Tiered validation
    if (formData.promo_type === "tiered" && formData.tiers.length === 0) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please add at least one tier",
        }),
      );
      setIsSubmitting(false);
      return;
    }

    if (!formData.start_date) {
      dispatch(
        addNotification({
          type: "error",
          message: "Start date is required",
        }),
      );
      setIsSubmitting(false);
      return;
    }

    if (formData.end_date && formData.end_date < formData.start_date) {
      dispatch(
        addNotification({
          type: "error",
          message: "End date must be after start date",
        }),
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("_method", "PUT");

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "tiers") {
            submitData.append(key, JSON.stringify(value));
          } else if (key === "is_stackable") {
            submitData.append(key, value ? "1" : "0");
          } else {
            submitData.append(key, String(value));
          }
        }
      });

      // Append poster image
      if (posterFile) {
        submitData.append("poster_image", posterFile);
      }

      await dispatch(updatePromotion({ id, data: submitData })).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Promotion updated successfully!",
        }),
      );

      router.push(`/promotions/${id}`);
      router.refresh();
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error || "Failed to update promotion",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render menu item dropdown
  const renderMenuItemSelect = (
    name,
    label,
    required = false,
    placeholder = "Select menu item",
  ) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required={required}
        >
          <option value="">{placeholder}</option>
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <option key={item.menu_item_id} value={item.menu_item_id}>
                {item.name} - ₱{parseFloat(item.price).toFixed(2)}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {menuItemsLoading ? "Loading..." : "No menu items available"}
            </option>
          )}
        </select>
        {menuItemsLoading && (
          <div className="text-xs text-gray-400 mt-1">
            Loading menu items...
          </div>
        )}
      </div>
    );
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/promotions/${id}`}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Promotion</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your promotion details
            </p>
          </div>
        </div>
        <div className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
          <QrCodeIcon className="w-3 h-3" />
          QR Code Auto-generated
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your promotion..."
                />
              </div>

              {/* Promotion Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promotion Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="promo_type"
                  value={formData.promo_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {PROMOTION_TYPE_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.promo_type === "percentage" ? "%" : "₱"}
                  </span>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter value"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Dynamic Fields Based on Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              {currentType?.label || "Promotion"} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Discount Amount */}
              {["percentage", "flash_sale"].includes(formData.promo_type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Discount Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ₱
                    </span>
                    <input
                      type="number"
                      name="max_discount_amount"
                      value={formData.max_discount_amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Max discount cap"
                    />
                  </div>
                </div>
              )}

              {/* Buy X Get Y fields */}
              {["buy_x_get_y", "bundle"].includes(formData.promo_type) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buy Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="buy_quantity"
                      value={formData.buy_quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Get Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="get_quantity"
                      value={formData.get_quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                  {formData.promo_type === "buy_x_get_y" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount on Get Items{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="get_discount_percentage"
                        value={formData.get_discount_percentage}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 50"
                        required
                      />
                    </div>
                  )}
                </>
              )}

              {/* Loyalty Points */}
              {formData.promo_type === "loyalty_points" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Multiplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="points_multiplier"
                    value={formData.points_multiplier}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2"
                    required
                  />
                </div>
              )}

              {/* Tiered Discount */}
              {formData.promo_type === "tiered" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiered Discounts <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Min Amount (₱)"
                      value={tierMin}
                      onChange={(e) => setTierMin(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Discount (₱)"
                      value={tierDiscount}
                      onChange={(e) => setTierDiscount(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={addTier}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.tiers.map((tier, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span>
                          ₱{tier.min} → ₱{tier.discount} off
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Shipping */}
              {formData.promo_type === "free_shipping" && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                    🚚 Free shipping will be applied when minimum order amount
                    is met. No additional configuration needed.
                  </p>
                </div>
              )}

              {/* BOGO - Menu Item Dropdowns */}
              {formData.promo_type === "bogo" && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg mb-3">
                    🎁 Select the items for Buy One Get One promotion
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderMenuItemSelect(
                      "required_menu_item_id",
                      "Required Item (Buy)",
                      true,
                    )}
                    {renderMenuItemSelect(
                      "free_menu_item_id",
                      "Free Item (Get)",
                      true,
                    )}
                  </div>
                </div>
              )}

              {/* Free Gift - Menu Item Dropdown */}
              {formData.promo_type === "free_gift" && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg mb-3">
                    🎁 Select the free gift item
                  </p>
                  {renderMenuItemSelect(
                    "free_gift_product_id",
                    "Free Gift Item",
                    true,
                  )}
                </div>
              )}

              {/* Bundle - Menu Item Selection */}
              {formData.promo_type === "bundle" && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 bg-indigo-50 p-3 rounded-lg mb-3">
                    📦 Bundle deal: Buy {formData.buy_quantity || "X"} get{" "}
                    {formData.get_quantity || "Y"} items
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Bundle Items (Optional)
                    </label>
                    <select
                      name="bundle_items"
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          bundle_items: selected,
                        }));
                      }}
                      size={4}
                    >
                      {menuItems.map((item) => (
                        <option
                          key={item.menu_item_id}
                          value={item.menu_item_id}
                        >
                          {item.name} - ₱{parseFloat(item.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple items
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr />

          {/* Conditions */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Conditions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2"
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Dates */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Date Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for no expiry
                </p>
              </div>
            </div>
          </div>

          <hr />

          {/* Status & Limits */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Status & Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="is_stackable"
                  checked={formData.is_stackable}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Stackable
                  <span className="block text-xs text-gray-400 font-normal">
                    Can be combined with other promotions
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit Per User
                </label>
                <input
                  type="number"
                  name="usage_limit_per_user"
                  value={formData.usage_limit_per_user}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for unlimited
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  name="total_usage_limit"
                  value={formData.total_usage_limit}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for unlimited
                </p>
              </div>
            </div>
          </div>

          {/* Poster Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Promotion Poster
            </h3>

            <div className="mt-2">
              {previewImage ? (
                <div className="relative">
                  <div className="relative w-full max-w-2xl h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Promotion poster preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="poster-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Upload a poster image</span>
                        <input
                          id="poster-upload"
                          name="poster-upload"
                          type="file"
                          ref={fileInputRef}
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Stats (Read-only) */}
          {promotion && (
            <>
              <hr />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Current Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Times Used</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {promotion.used_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">
                      {promotion.created_at
                        ? new Date(promotion.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {promotion.updated_at
                        ? new Date(promotion.updated_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Promotion"
            )}
          </button>
          <Link
            href={`/promotions/${id}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
