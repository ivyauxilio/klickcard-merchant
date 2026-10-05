"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  QrCodeIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  BoltIcon,
  CheckCircleIcon,
  TagIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  createPromotion,
  selectPromotionLoading,
  fetchMenuItemsForPromotion,
  selectMenuItemsForPromotion,
  selectMenuItemsLoading,
} from "@/store/slices/promotionSlice";
import {
  fetchWallet,
  selectWallet,
  updateBalance,
} from "@/store/slices/walletSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  PROMOTION_TYPES,
  PROMOTION_TYPE_OPTIONS,
} from "@/config/promotionTypes";
import InsufficientCreditsModal from "@/components/promotion/InsufficientCreditsModal";
import CreditBadge from "@/components/promotion/CreditBadge";

// ============================================
// VOUCHER TYPES (Credit System)
// ============================================
const voucherTypes = [
  {
    id: "basic",
    label: "Basic Voucher",
    credits: 1,
    description: "Standard discount for everyday promotions",
    icon: "fa-ticket",
    color: "purple",
  },
  {
    id: "featured",
    label: "Featured Voucher",
    credits: 2,
    description: "Highlighted placement for more visibility",
    icon: "fa-star",
    color: "indigo",
  },
  {
    id: "priority",
    label: "Priority Voucher",
    credits: 5,
    description: "Top exposure across platforms",
    icon: "fa-rocket",
    color: "yellow",
  },
];

export default function CreatePromotionPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isLoading = useSelector(selectPromotionLoading);
  const fileInputRef = useRef(null);
  const menuItems = useSelector(selectMenuItemsForPromotion);
  const menuItemsLoading = useSelector(selectMenuItemsLoading);
  const wallet = useSelector(selectWallet);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    promo_type: "percentage",
    value: 0,
    voucher_type: "basic", // ✅ NEW: Credit system
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

  // Image state
  const [previewImage, setPreviewImage] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tierMin, setTierMin] = useState("");
  const [tierDiscount, setTierDiscount] = useState("");

  // ✅ Credit system state
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState(null);

  const statusOptions = [
    { value: "active", label: "Active", color: "green" },
    { value: "inactive", label: "Inactive", color: "gray" },
    { value: "expired", label: "Expired", color: "red" },
  ];

  const currentType = PROMOTION_TYPES[formData.promo_type];

  // ✅ Selected voucher & credit check
  const selectedVoucher =
    voucherTypes.find((v) => v.id === formData.voucher_type) || voucherTypes[0];

  const hasEnoughCredits =
    (wallet?.credit_balance ?? 0) >= selectedVoucher.credits;

  useEffect(() => {
    dispatch(fetchMenuItemsForPromotion());
    dispatch(fetchWallet()); // ✅ Load wallet on mount
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;
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

    // ✅ CHECK CREDITS FIRST - show modal if insufficient
    if (!hasEnoughCredits) {
      setCreditInfo({
        requiredCredits: selectedVoucher.credits,
        availableCredits: wallet?.credit_balance ?? 0,
        voucherType: formData.voucher_type,
      });
      setShowCreditsModal(true);
      return;
    }

    setIsSubmitting(true);

    // ============================================
    // VALIDATION
    // ============================================
    if (!formData.title.trim()) {
      dispatch(
        addNotification({
          type: "error",
          message: "Promotion title is required",
        }),
      );
      setIsSubmitting(false);
      return;
    }

    if (!formData.promo_type) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please select a promotion type",
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
            message: "Valid promotion value is required",
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
        addNotification({ type: "error", message: "Start date is required" }),
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

    // ============================================
    // SUBMIT
    // ============================================
    try {
      const submitData = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "tiers") {
            submitData.append(key, JSON.stringify(value));
          } else if (key === "bundle_items") {
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

      const result = await dispatch(createPromotion(submitData)).unwrap();

      // ✅ Update wallet balance in Redux
      if (result?.data?.credits?.remaining !== undefined) {
        dispatch(updateBalance(result.data.credits.remaining));
      }

      dispatch(
        addNotification({
          type: "success",
          message:
            result?.message ||
            "Promotion created successfully! QR code generated.",
        }),
      );

      if (result?.data?.promotion?.promotion_id) {
        router.push(`/promotions/${result.data.promotion.promotion_id}`);
      } else {
        router.push("/promotions");
      }
      router.refresh();
    } catch (error) {
      // ✅ Handle 402 Payment Required (Insufficient credits)
      if (error?.response?.status === 402) {
        const data = error.response.data;

        if (data.error_code === "INSUFFICIENT_CREDITS") {
          setCreditInfo({
            requiredCredits: data.data.required_credits,
            availableCredits: data.data.available_credits,
            voucherType: data.data.voucher_type || formData.voucher_type,
          });
          setShowCreditsModal(true);
          dispatch(fetchWallet()); // Refresh wallet
          setIsSubmitting(false);
          return;
        }
      }

      dispatch(
        addNotification({
          type: "error",
          message:
            error?.response?.data?.message ||
            error ||
            "Failed to create promotion",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

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
          value={formData[name]}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required={required}
        >
          <option value="">{placeholder}</option>
          {menuItems.map((item) => (
            <option key={item.menu_item_id} value={item.menu_item_id}>
              {item.name} - ₱{parseFloat(item.price).toFixed(2)}
            </option>
          ))}
        </select>
        {menuItemsLoading && (
          <div className="text-xs text-gray-400 mt-1">
            Loading menu items...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/promotions"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Promotion
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Launch a new promotion to attract more customers
            </p>
          </div>
        </div>

        {/* ✅ Credit Balance Badge */}
        <CreditBadge />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================ */}
          {/* LEFT COLUMN - MAIN FORM */}
          {/* ============================================ */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Describe your promotion..."
                      />
                    </div>
                  </div>
                </div>

                <hr />

                {/* ✅ VOUCHER TYPE SELECTION - Credit System */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Choose Voucher Type{" "}
                      <span className="text-red-500">*</span>
                    </h3>
                    <span className="text-xs text-gray-500">
                      Credits will be deducted
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          } ${!canAfford ? "opacity-75" : ""}`}
                        >
                          {isSelected && (
                            <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-purple-600" />
                          )}

                          <i
                            className={`fas ${type.icon} text-purple-600 text-xl mb-2`}
                          ></i>

                          <p className="font-bold text-gray-900 text-sm">
                            {type.label}
                          </p>

                          <div className="flex items-center gap-1 mt-1 mb-2">
                            <BoltIcon className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-purple-700 text-sm">
                              {type.credits} credits
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 leading-tight">
                            {type.description}
                          </p>

                          {!canAfford && (
                            <p className="text-xs text-red-600 mt-2 font-medium">
                              ⚠️ Not enough credits
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr />

                {/* Promotion Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Promotion Type <span className="text-red-500">*</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {PROMOTION_TYPE_OPTIONS.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            promo_type: type.value,
                          }))
                        }
                        className={`p-3 border rounded-lg text-center transition-all ${
                          formData.promo_type === type.value
                            ? `border-${type.color}-600 bg-${type.color}-50 text-${type.color}-700`
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`text-2xl ${
                            formData.promo_type === type.value
                              ? `text-${type.color}-600`
                              : "text-gray-400"
                          }`}
                        >
                          <i className={`fas ${type.icon}`}></i>
                        </div>
                        <p className="text-xs font-medium mt-1">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Fields Based on Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    {currentType?.label || "Promotion"} Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Value Field */}
                    {[
                      "percentage",
                      "fixed",
                      "first_purchase",
                      "flash_sale",
                    ].includes(formData.promo_type) && (
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
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter value"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Max Discount Amount */}
                    {["percentage", "flash_sale"].includes(
                      formData.promo_type,
                    ) && (
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
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Max discount cap"
                          />
                        </div>
                      </div>
                    )}

                    {/* Buy X Get Y / Bundle fields */}
                    {["buy_x_get_y", "bundle"].includes(
                      formData.promo_type,
                    ) && (
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                          Points Multiplier{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="points_multiplier"
                          value={formData.points_multiplier}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., 2"
                          required
                        />
                      </div>
                    )}

                    {/* Tiered Discount */}
                    {formData.promo_type === "tiered" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiered Discounts{" "}
                          <span className="text-red-500">*</span>
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
                          🚚 Free shipping will be applied when minimum order
                          amount is met. No additional configuration needed.
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

                    {/* Free Gift */}
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
                                {item.name} - ₱
                                {parseFloat(item.price).toFixed(2)}
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

                {/* Common Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Additional Settings
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
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        min={today}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        min={formData.start_date || today}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 1"
                      />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                </div>

                {/* Poster Image Upload */}
                <hr />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Promotion Poster
                  </h3>
                  <div className="mt-2">
                    {previewImage ? (
                      <div className="relative">
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
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
                              className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500"
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

                {/* QR Code Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <QrCodeIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        QR Code Auto-Generation
                      </p>
                      <p className="text-sm text-blue-600">
                        A unique QR code will be automatically generated for
                        this promotion. Customers can scan the QR code to redeem
                        the promotion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* RIGHT COLUMN - CREDIT SUMMARY */}
          {/* ============================================ */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
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

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg ${
                  hasEnoughCredits
                    ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 shadow-purple-600/30"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } disabled:opacity-50`}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Creating...
                  </>
                ) : hasEnoughCredits ? (
                  <>
                    <QrCodeIcon className="w-5 h-5" />
                    Create Promotion
                  </>
                ) : (
                  <>
                    <BoltIcon className="w-5 h-5" />
                    Not Enough Credits
                  </>
                )}
              </button>

              <Link
                href="/promotions"
                className="block w-full px-6 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
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
