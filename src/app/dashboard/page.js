"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  StarIcon,
  PlusIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import {
  getMerchantStats,
  selectMerchantStats,
} from "@/store/slices/merchantSlice";
import { getMenuItems, selectMenuStats } from "@/store/slices/menuSlice";
import QRScansChart from "@/components/charts/QRScansChart";
import MenuPerformanceChart from "@/components/charts/MenuPerformanceChart";
import {
  getPromotions,
  selectPromotionStats,
} from "@/store/slices/promotionSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  const merchantStats = useSelector(selectMerchantStats);
  const menuStats = useSelector(selectMenuStats);
  const promotionStats = useSelector(selectPromotionStats);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(getMerchantStats()),
        dispatch(getMenuItems()),
        dispatch(getPromotions()),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  // Destructure stats with fallbacks
  const stats = merchantStats || {};
  const menu = menuStats || {};
  const promotions = promotionStats || {};

  // Menu Stats
  const totalMenuItems = menu.total || stats.total_menu_items || 0;
  const availableItems = menu.available || stats.available_items || 0;
  const outOfStockItems = menu.out_of_stock || stats.out_of_stock_items || 0;
  const lowStockItems = menu.low_stock || stats.low_stock_items || 0;
  const featuredItems = menu.featured || stats.featured_items || 0;

  // Promotion Stats
  const totalPromotions = promotions.total || stats.total_promotions || 0;
  const activePromotions = promotions.active || stats.active_promotions || 0;
  const expiredPromotions = promotions.expired || stats.expired_promotions || 0;

  // QR Code Stats
  const totalQrScans = stats.total_qr_scans || 0;
  const qrScansToday = stats.qr_scans_today || 0;
  const qrScansThisWeek = stats.qr_scans_this_week || 0;

  // Customer Stats
  const totalCustomers = stats.total_customers || 0;
  const newCustomersToday = stats.new_customers_today || 0;
  const newCustomersThisWeek = stats.new_customers_this_week || 0;
  const newCustomersThisMonth = stats.new_customers_this_month || 0;

  // Rating Stats
  const averageRating = stats.average_rating || null;
  const totalReviews = stats.total_reviews || 0;

  // Top Selling Items
  const topSellingItems = stats.top_selling_items || [];
  // Prepare chart data - weekly QR scans (mock data - replace with actual API data)
  const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = [
    Math.floor(Math.random() * 20) + 5,
    Math.floor(Math.random() * 30) + 10,
    Math.floor(Math.random() * 25) + 8,
    Math.floor(Math.random() * 35) + 12,
    Math.floor(Math.random() * 40) + 15,
    Math.floor(Math.random() * 30) + 10,
    Math.floor(Math.random() * 15) + 5,
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's your business overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          {/* <Link
            href="/analytics"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2"
          >
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </Link> */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Menu Items */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Menu Items</p>
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <ClipboardDocumentListIcon className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {totalMenuItems}
          </p>
          <span className="text-xs text-purple-600">
            {availableItems} available • {outOfStockItems} out
          </span>
        </div>

        {/* Promotions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Promotions</p>
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <TagIcon className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {totalPromotions}
          </p>
          <span className="text-xs text-orange-600">
            {activePromotions} active • {expiredPromotions} expired
          </span>
        </div>

        {/* QR Scans */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">QR Scans</p>
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <QrCodeIcon className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalQrScans}</p>
          <span className="text-xs text-indigo-600">
            {qrScansToday} today • {qrScansThisWeek} this week
          </span>
        </div>

        {/* Customers */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Customers</p>
            <div className="p-1.5 bg-cyan-50 rounded-lg">
              <UserGroupIcon className="w-4 h-4 text-cyan-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {totalCustomers}
          </p>
          <span className="text-xs text-cyan-600">
            {newCustomersToday} new today
          </span>
        </div>

        {/* Featured Items */}
        {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Featured</p>
            <div className="p-1.5 bg-yellow-50 rounded-lg">
              <StarIcon className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {featuredItems}
          </p>
          <span className="text-xs text-yellow-600">
            {totalMenuItems > 0
              ? Math.round((featuredItems / totalMenuItems) * 100)
              : 0}
            % of menu
          </span>
        </div> */}

        {/* Rating */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Rating</p>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <StarIcon className="w-4 h-4 text-green-600 fill-current" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {averageRating ? averageRating.toFixed(1) : "N/A"}
          </p>
          <span className="text-xs text-green-600">{totalReviews} reviews</span>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Available Items</p>
          <p className="text-xl font-bold text-green-600">{availableItems}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-xl font-bold text-yellow-600">{lowStockItems}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-xl font-bold text-red-600">{outOfStockItems}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">New Customers</p>
          <p className="text-xl font-bold text-blue-600">
            {newCustomersThisMonth}
          </p>
          <span className="text-xs text-gray-500">this month</span>
        </div>
      </div>

      {/* Charts Row - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">QR Scans Overview</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <QRScansChart
            data={weeklyData}
            labels={weeklyLabels}
            isLoading={loading}
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Menu Items</p>
                <p className="font-bold text-gray-900">{totalMenuItems}</p>
              </div>
              <span className="text-xs text-green-600">
                {availableItems} available
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Promotions</p>
                <p className="font-bold text-gray-900">{totalPromotions}</p>
              </div>
              <span className="text-xs text-green-600">
                {activePromotions} active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">QR Scans</p>
                <p className="font-bold text-gray-900">{totalQrScans}</p>
              </div>
              <span className="text-xs text-green-600">
                +{qrScansToday} today
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Customer Rating</p>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-bold text-gray-900">
                    {averageRating ? averageRating.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {totalReviews} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Items & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Top Selling Items</h3>
            <Link
              href="/analytics"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {topSellingItems.length > 0 ? (
              topSellingItems.map((item, index) => (
                <div
                  key={index}
                  className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₱{parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {item.sold_count || 0} sold
                    </p>
                    {item.rating && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1 justify-end">
                        <StarIcon className="w-3 h-3 fill-current" />
                        {item.rating}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No items sold yet</p>
                <p className="text-sm">
                  Start selling to see your top items here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {/* QR Scan Activity */}
            {qrScansToday > 0 && (
              <div className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="p-1.5 bg-indigo-50 rounded-full flex-shrink-0">
                  <QrCodeIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {qrScansToday} QR code scan{qrScansToday > 1 ? "s" : ""}{" "}
                    today
                  </p>
                  <p className="text-xs text-gray-400">
                    Total {totalQrScans} scans
                  </p>
                </div>
              </div>
            )}

            {/* New Customers Activity */}
            {newCustomersToday > 0 && (
              <div className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="p-1.5 bg-cyan-50 rounded-full flex-shrink-0">
                  <UserGroupIcon className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {newCustomersToday} new customer
                    {newCustomersToday > 1 ? "s" : ""} today
                  </p>
                  <p className="text-xs text-gray-400">
                    {newCustomersThisMonth} this month
                  </p>
                </div>
              </div>
            )}

            {/* Low Stock Alert */}
            {lowStockItems > 0 && (
              <div className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="p-1.5 bg-yellow-50 rounded-full flex-shrink-0">
                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {lowStockItems} item{lowStockItems > 1 ? "s" : ""} running
                    low on stock
                  </p>
                  <p className="text-xs text-gray-400">Please restock soon</p>
                </div>
              </div>
            )}

            {/* Out of Stock Alert */}
            {outOfStockItems > 0 && (
              <div className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="p-1.5 bg-red-50 rounded-full flex-shrink-0">
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {outOfStockItems} item{outOfStockItems > 1 ? "s" : ""} out
                    of stock
                  </p>
                  <p className="text-xs text-gray-400">
                    Needs immediate attention
                  </p>
                </div>
              </div>
            )}

            {/* No Activity */}
            {qrScansToday === 0 &&
              newCustomersToday === 0 &&
              lowStockItems === 0 &&
              outOfStockItems === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm">Start engaging with your customers</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/menu/create"
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center group"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-100 transition-colors">
            <PlusIcon className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">Add Menu Item</p>
          <p className="text-xs text-gray-500">Expand your menu</p>
        </Link>

        <Link
          href="/promotions/create"
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center group"
        >
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-100 transition-colors">
            <TagIcon className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">Create Promotion</p>
          <p className="text-xs text-gray-500">Boost your sales</p>
        </Link>

        <Link
          href="/promotions"
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center group"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-100 transition-colors">
            <QrCodeIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">View QR Codes</p>
          <p className="text-xs text-gray-500">Manage promotions</p>
        </Link>

        <Link
          href="/analytics"
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center group"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-100 transition-colors">
            <ChartBarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">View Analytics</p>
          <p className="text-xs text-gray-500">Track performance</p>
        </Link>
      </div>
    </div>
  );
}
