"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  TagIcon,
  CurrencyDollarIcon,
  StarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/axios";
import { addNotification } from "@/store/slices/uiSlice";

const units = [
  "piece",
  "kg",
  "gram",
  "liter",
  "ml",
  "dozen",
  "box",
  "pack",
  "bottle",
  "can",
  "loaf",
  "bar",
];

const categories = [
  "Fruits",
  "Vegetables",
  "Meat",
  "Poultry",
  "Seafood",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Frozen",
  "Canned",
  "Dry Goods",
  "Household",
  "Personal Care",
  "Baby",
  "Pet",
  "Other",
];

const discountTypes = ["percentage", "fixed", "bogo"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const productId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sub_category: "",
    brand: "",
    price: "",
    original_price: "",
    unit: "piece",
    unit_value: "",
    stock_quantity: "",
    min_stock_alert: 5,
    weight: "",
    country_of_origin: "",
    nutritional_info: "",
    is_featured: false,
    is_active: true,
    attributes: [],
    discount: {
      discount_id: null,
      type: "percentage",
      value: "",
      min_quantity: 1,
      max_quantity: "",
      start_date: "",
      end_date: "",
      usage_limit: "",
      is_active: true,
    },
    points: {
      points_id: null,
      points_per_item: "",
      points_per_php: "",
      min_spend: 0,
      max_points: "",
      start_date: "",
      end_date: "",
      is_active: true,
    },
  });
  const [originalProduct, setOriginalProduct] = useState(null);
  const fileInputRef = useRef();

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      setFetching(true);
      const response = await api.get(`/merchant/products/${productId}`);

      if (response.data.success) {
        const product = response.data.data;
        setOriginalProduct(product);

        // Helper to format datetime for input
        const formatDateTime = (dateStr) => {
          if (!dateStr) return "";
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "";
            // Format: YYYY-MM-DDTHH:mm
            const pad = (n) => String(n).padStart(2, "0");
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
          } catch {
            return "";
          }
        };

        // Get active discount and points
        const activeDiscount = product.discounts?.[0] || null;
        const activePoints = product.points || null;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          sub_category: product.sub_category || "",
          brand: product.brand || "",
          price: product.price || "",
          original_price: product.original_price || "",
          unit: product.unit || "piece",
          unit_value: product.unit_value || "",
          stock_quantity: product.stock_quantity || "",
          min_stock_alert: product.min_stock_alert || 5,
          weight: product.weight || "",
          country_of_origin: product.country_of_origin || "",
          nutritional_info: product.nutritional_info || "",
          is_featured: product.is_featured,
          is_active:
            product.is_active !== undefined ? Boolean(product.is_active) : true,
          attributes: Array.isArray(product.attributes)
            ? product.attributes
            : [],
          discount: {
            discount_id: activeDiscount?.discount_id || null,
            type: activeDiscount?.type || "percentage",
            value: activeDiscount?.value || "",
            min_quantity: activeDiscount?.min_quantity || 1,
            max_quantity: activeDiscount?.max_quantity || "",
            start_date: formatDateTime(activeDiscount?.start_date),
            end_date: formatDateTime(activeDiscount?.end_date),
            usage_limit: activeDiscount?.usage_limit || "",
            is_active:
              activeDiscount?.is_active !== undefined
                ? Boolean(activeDiscount.is_active)
                : true,
          },
          points: {
            points_id: activePoints?.points_id || null,
            points_per_item: activePoints?.points_per_item || "",
            points_per_php: activePoints?.points_per_php || "",
            min_spend: activePoints?.min_spend || 0,
            max_points: activePoints?.max_points || "",
            start_date: formatDateTime(activePoints?.start_date),
            end_date: formatDateTime(activePoints?.end_date),
            is_active:
              activePoints?.is_active !== undefined
                ? Boolean(activePoints.is_active)
                : true,
          },
        });

        // Set image preview if product has image
        if (product.image_url) {
          setImagePreview(getImageUrl(product.image_url));
        }
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error.response?.data?.message || "Failed to load product",
        }),
      );
      router.push("/products");
    } finally {
      setFetching(false);
    }
  }, [productId, dispatch, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0)
      newErrors.stock_quantity = "Valid stock quantity is required";
    if (!formData.unit) newErrors.unit = "Unit is required";

    // Validate discount - only if value is filled
    if (formData.discount.value) {
      if (!formData.discount.start_date) {
        newErrors.discount_start_date = "Start date is required";
      }
      // if (!formData.discount.end_date) {
      //   newErrors.discount_end_date = "End date is required";
      // }
      if (
        formData.discount.start_date &&
        formData.discount.end_date &&
        new Date(formData.discount.end_date) <=
          new Date(formData.discount.start_date)
      ) {
        newErrors.discount_dates = "End date must be after start date";
      }
    }

    // Validate points - only if value is filled
    if (formData.points.points_per_item) {
      if (!formData.points.start_date) {
        newErrors.points_start_date = "Start date is required for points";
      }
      if (
        formData.points.start_date &&
        formData.points.end_date &&
        new Date(formData.points.end_date) <=
          new Date(formData.points.start_date)
      ) {
        newErrors.points_dates = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      discount: {
        ...prev.discount,
        [name]: value,
      },
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePointsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      points: {
        ...prev.points,
        [name]: value,
      },
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 2MB",
        }));
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please fix the errors in the form",
        }),
      );
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // ✅ Basic Fields
      data.append("name", formData.name.trim());
      data.append("description", formData.description || "");
      data.append("category", formData.category);
      data.append("sub_category", formData.sub_category || "");
      data.append("brand", formData.brand || "");
      data.append("price", formData.price);
      data.append("original_price", formData.original_price || "");
      data.append("unit", formData.unit);
      data.append("unit_value", formData.unit_value || "");
      data.append("stock_quantity", formData.stock_quantity);
      data.append("min_stock_alert", formData.min_stock_alert || 5);
      data.append("weight", formData.weight || "");
      data.append("country_of_origin", formData.country_of_origin || "");
      data.append("nutritional_info", formData.nutritional_info || "");

      // ✅ Booleans as "1"/"0" strings (Laravel friendly)
      data.append("is_active", formData.is_active ? "1" : "0");
      data.append("is_featured", formData.is_featured ? "1" : "0");

      // ✅ Attributes as JSON string
      data.append("attributes", JSON.stringify(formData.attributes || []));

      // ✅ Discount - only send if value is filled
      if (formData.discount.value) {
        data.append("discount[type]", formData.discount.type);
        data.append("discount[value]", formData.discount.value);
        data.append(
          "discount[min_quantity]",
          formData.discount.min_quantity || 1,
        );
        data.append("discount[start_date]", formData.discount.start_date);
        data.append("discount[end_date]", formData.discount.end_date);
        data.append(
          "discount[is_active]",
          formData.discount.is_active ? "1" : "0",
        );

        if (formData.discount.max_quantity) {
          data.append("discount[max_quantity]", formData.discount.max_quantity);
        }
        if (formData.discount.usage_limit) {
          data.append("discount[usage_limit]", formData.discount.usage_limit);
        }
      }

      // ✅ Points - only send if points_per_item is filled
      if (formData.points.points_per_item) {
        data.append("points[points_per_item]", formData.points.points_per_item);
        data.append(
          "points[points_per_php]",
          formData.points.points_per_php || 0,
        );
        data.append("points[min_spend]", formData.points.min_spend || 0);
        data.append("points[is_active]", formData.points.is_active ? "1" : "0");

        if (formData.points.start_date) {
          data.append("points[start_date]", formData.points.start_date);
        }
        if (formData.points.end_date) {
          data.append("points[end_date]", formData.points.end_date);
        }
        if (formData.points.max_points) {
          data.append("points[max_points]", formData.points.max_points);
        }
      }

      // ✅ Image if changed
      if (imageFile) {
        data.append("image", imageFile);
      }

      // ✅ Use PUT method via _method
      data.append("_method", "PUT");

      const response = await api.post(`/merchant/products/${productId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        dispatch(
          addNotification({
            type: "success",
            message: "Product updated successfully! 🎉",
          }),
        );
        router.push("/products");
      }
    } catch (error) {
      console.error("Submit error:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);

        // Show first validation error
        const firstError = Object.values(error.response.data.errors)[0];
        dispatch(
          addNotification({
            type: "error",
            message: Array.isArray(firstError) ? firstError[0] : firstError,
          }),
        );
      } else {
        dispatch(
          addNotification({
            type: "error",
            message:
              error.response?.data?.message || "Failed to update product",
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: DocumentTextIcon },
    { id: "pricing", label: "Pricing & Stock", icon: CurrencyDollarIcon },
    { id: "discount", label: "Discount", icon: TagIcon },
    { id: "points", label: "Points", icon: StarIcon },
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-500">
              Update product information, discounts, and points
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/merchant/products/${productId}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-purple-100 text-purple-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Organic, Fresh"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brand name"
                  />
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pricing & Stock
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (₱)
                    </label>
                    <input
                      type="number"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.unit ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Value
                    </label>
                    <input
                      type="number"
                      name="unit_value"
                      value={formData.unit_value}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 500 for 500g"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.stock_quantity
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0"
                    />
                    {errors.stock_quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.stock_quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock Alert
                    </label>
                    <input
                      type="number"
                      name="min_stock_alert"
                      value={formData.min_stock_alert}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Discount Tab */}
            {activeTab === "discount" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Discount Settings
                  </h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.discount.is_active}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          discount: {
                            ...prev.discount,
                            is_active: e.target.checked,
                          },
                        }));
                      }}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    Active
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="type"
                      value={formData.discount.type}
                      onChange={handleDiscountChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {discountTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.discount.value}
                      onChange={handleDiscountChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={
                        formData.discount.type === "percentage"
                          ? "% off"
                          : "₱ off"
                      }
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
                    value={formData.discount.min_quantity}
                    onChange={handleDiscountChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.discount.start_date}
                      onChange={handleDiscountChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.discount_start_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.discount_start_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.discount_start_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.discount.end_date}
                      onChange={handleDiscountChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.discount_dates || errors.discount_end_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.discount_end_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.discount_end_date}
                      </p>
                    )}
                  </div>
                </div>
                {errors.discount_dates && (
                  <p className="text-sm text-red-600">
                    {errors.discount_dates}
                  </p>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.discount.usage_limit}
                    onChange={handleDiscountChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            )}

            {/* Points Tab */}
            {activeTab === "points" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Points Settings
                  </h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.points.is_active}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          points: {
                            ...prev.points,
                            is_active: e.target.checked,
                          },
                        }));
                      }}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    Active
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Per Item
                    </label>
                    <input
                      type="number"
                      name="points_per_item"
                      value={formData.points.points_per_item}
                      onChange={handlePointsChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Per PHP
                    </label>
                    <input
                      type="number"
                      name="points_per_php"
                      value={formData.points.points_per_php}
                      onChange={handlePointsChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Spend (₱)
                    </label>
                    <input
                      type="number"
                      name="min_spend"
                      value={formData.points.min_spend}
                      onChange={handlePointsChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Points
                    </label>
                    <input
                      type="number"
                      name="max_points"
                      value={formData.points.max_points}
                      onChange={handlePointsChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.points.start_date}
                      onChange={handlePointsChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.points_start_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.points_start_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.points_start_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.points.end_date}
                      onChange={handlePointsChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.points_dates
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                {errors.points_dates && (
                  <p className="text-sm text-red-600">{errors.points_dates}</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Image
              </h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden ${
                  errors.image
                    ? "border-red-500"
                    : "border-gray-300 hover:border-purple-500"
                }`}
              >
                {imagePreview ? (
                  <>
                    {/* ✅ Use regular img for blob URLs, Next Image for external */}
                    {imagePreview.startsWith("blob:") ||
                    imagePreview.startsWith("data:") ? (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                      Click to change image
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                    <p className="mt-2 text-sm">Click to upload image</p>
                    <p className="text-xs">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {errors.image && (
                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Featured Product
                  </span>
                </label>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 500g, 1kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Philippines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nutritional Info
                  </label>
                  <textarea
                    name="nutritional_info"
                    value={formData.nutritional_info}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Calories, protein, carbs, etc."
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Saving Changes...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
