"use client";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Header from "@/components/Navbar";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
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
  TruckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  getMerchantStats,
  selectMerchantStats,
} from "@/store/slices/merchantSlice";
import { getMenuItems, selectMenuStats } from "@/store/slices/menuSlice";
import {
  getPromotions,
  selectPromotionStats,
} from "@/store/slices/promotionSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year

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

  // Calculate totals
  const totalRevenue = merchantStats?.total_revenue || 0;
  const totalOrders = merchantStats?.total_orders || 0;
  const totalMenuItems = menuStats?.total || 0;
  const totalPromotions = promotionStats?.total || 0;
  const totalCustomers = merchantStats?.total_customers || 0;

  // Recent orders (mock data - replace with actual API)
  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      items: 3,
      total: 450.0,
      status: "completed",
      time: "2 mins ago",
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      items: 2,
      total: 320.0,
      status: "pending",
      time: "15 mins ago",
    },
    {
      id: "#ORD-003",
      customer: "Mike Johnson",
      items: 5,
      total: 780.0,
      status: "processing",
      time: "1 hour ago",
    },
    {
      id: "#ORD-004",
      customer: "Sarah Wilson",
      items: 1,
      total: 150.0,
      status: "completed",
      time: "2 hours ago",
    },
    {
      id: "#ORD-005",
      customer: "David Brown",
      items: 4,
      total: 560.0,
      status: "cancelled",
      time: "3 hours ago",
    },
  ];

  // Top selling items (mock data - replace with actual API)
  const topSellingItems = [
    { name: "Classic Burger", sales: 45, revenue: 11250, trend: "up" },
    { name: "Cheese Pizza", sales: 38, revenue: 13300, trend: "up" },
    { name: "Chicken Sandwich", sales: 32, revenue: 8960, trend: "down" },
    { name: "Caesar Salad", sales: 28, revenue: 5040, trend: "up" },
    { name: "Mango Shake", sales: 25, revenue: 3750, trend: "down" },
  ];

  // Recent activity feed (mock data - replace with actual API)
  const recentActivities = [
    {
      type: "order",
      message: "New order #ORD-006 received",
      time: "5 mins ago",
      status: "success",
    },
    {
      type: "menu",
      message: "Classic Burger stock updated to 45 units",
      time: "20 mins ago",
      status: "info",
    },
    {
      type: "promotion",
      message: "Summer Sale promotion activated",
      time: "1 hour ago",
      status: "success",
    },
    {
      type: "order",
      message: "Order #ORD-003 marked as completed",
      time: "2 hours ago",
      status: "success",
    },
    {
      type: "review",
      message: "New 5-star review from Emily Chen",
      time: "3 hours ago",
      status: "success",
    },
    {
      type: "order",
      message: "Order #ORD-002 payment pending",
      time: "4 hours ago",
      status: "warning",
    },
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
          <Link
            href="/analytics"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2"
          >
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Revenue</p>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            ₱{totalRevenue.toLocaleString()}
          </p>
          <span className="text-xs text-green-600 flex items-center gap-1">
            <ArrowTrendingUpIcon className="w-3 h-3" />
            +12.5%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Orders</p>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <ShoppingBagIcon className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalOrders}</p>
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <ArrowTrendingUpIcon className="w-3 h-3" />
            +8.3%
          </span>
        </div>

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
          <span className="text-xs text-purple-600">+2 this week</span>
        </div>

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
            {promotionStats?.active || 0} active
          </span>
        </div>

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
          <span className="text-xs text-cyan-600">+15 new</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">QR Scans</p>
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <QrCodeIcon className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {merchantStats?.qr_scans || 0}
          </p>
          <span className="text-xs text-indigo-600">+5 today</span>
        </div>
      </div>

      {/* Charts Row - Placeholder for actual charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Revenue Overview</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-primary-600 rounded-full"></span>
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                Orders
              </span>
            </div>
          </div>
          {/* Chart placeholder - you can integrate Chart.js or Recharts here */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
              <p>Revenue Chart</p>
              <p className="text-sm">(Integrate Chart.js/Recharts)</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="font-bold text-gray-900">₱245.00</p>
              </div>
              <span className="text-xs text-green-600">+5.2%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="font-bold text-gray-900">3.8%</p>
              </div>
              <span className="text-xs text-green-600">+0.6%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="font-bold text-gray-900">2.5 min</p>
              </div>
              <span className="text-xs text-red-600">+0.3 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-bold text-gray-900">4.8</span>
                  <span className="text-xs text-gray-500">(245 reviews)</span>
                </div>
              </div>
              <span className="text-xs text-green-600">Excellent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Recent Orders</h3>
            <Link
              href="/orders"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      order.status === "completed"
                        ? "bg-green-50"
                        : order.status === "pending"
                          ? "bg-yellow-50"
                          : order.status === "processing"
                            ? "bg-blue-50"
                            : "bg-red-50"
                    }`}
                  >
                    {order.status === "completed" && (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                    {order.status === "pending" && (
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                    )}
                    {order.status === "processing" && (
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                    )}
                    {order.status === "cancelled" && (
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer} • {order.items} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₱{order.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
            {topSellingItems.map((item, index) => (
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
                    <p className="text-xs text-gray-500">{item.sales} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₱{item.revenue.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs flex items-center gap-1 justify-end ${
                      item.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.trend === "up" ? (
                      <ArrowTrendingUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-3 h-3" />
                    )}
                    {item.trend === "up" ? "+" : ""}12%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`p-1.5 rounded-full flex-shrink-0 ${
                    activity.status === "success"
                      ? "bg-green-50"
                      : activity.status === "warning"
                        ? "bg-yellow-50"
                        : "bg-blue-50"
                  }`}
                >
                  {activity.type === "order" && (
                    <ShoppingBagIcon
                      className={`w-4 h-4 ${
                        activity.status === "success"
                          ? "text-green-600"
                          : activity.status === "warning"
                            ? "text-yellow-600"
                            : "text-blue-600"
                      }`}
                    />
                  )}
                  {activity.type === "menu" && (
                    <ClipboardDocumentListIcon className="w-4 h-4 text-purple-600" />
                  )}
                  {activity.type === "promotion" && (
                    <TagIcon className="w-4 h-4 text-orange-600" />
                  )}
                  {activity.type === "review" && (
                    <StarIcon className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/menu/create"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                <ClipboardDocumentListIcon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Add Menu Item
                </p>
                <p className="text-xs text-gray-500">
                  Add new item to your menu
                </p>
              </div>
            </Link>
            <Link
              href="/promotions/create"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <TagIcon className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Create Promotion
                </p>
                <p className="text-xs text-gray-500">Launch a new promotion</p>
              </div>
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <ShoppingBagIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Orders</p>
                <p className="text-xs text-gray-500">Manage incoming orders</p>
              </div>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <ChartBarIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  View Analytics
                </p>
                <p className="text-xs text-gray-500">
                  See your business insights
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
