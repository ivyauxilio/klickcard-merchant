// app/merchant/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  TrashIcon,
  BellIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  setFilter,
  resetNotifications,
  selectNotifications,
  selectUnreadCount,
  selectNotificationPagination,
  selectNotificationFilters,
  selectNotificationLoading,
  selectNotificationLoadingMore,
  selectNotificationRefreshing,
} from "@/store/slices/notificationSlice";

const filterOptions = [
  { key: "all", label: "All", icon: "🔔" },
  { key: "unread", label: "Unread", icon: "🆕" },
  { key: "referral_reward", label: "Rewards", icon: "🎁" },
  { key: "withdrawal_requested", label: "Withdrawals", icon: "📤" },
  { key: "promotion", label: "Promotions", icon: "🎉" },
  { key: "order", label: "Orders", icon: "📦" },
  { key: "system", label: "System", icon: "⚙️" },
];

const getTypeStyle = (type: string) => {
  const map: Record<
    string,
    { color: string; bg: string; icon: string; label: string }
  > = {
    referral_reward: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "🎁",
      label: "Reward",
    },
    referral_signup: {
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: "👋",
      label: "Referral",
    },
    referral_approved: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "💰",
      label: "Approved",
    },
    withdrawal_requested: {
      color: "text-amber-600",
      bg: "bg-amber-100",
      icon: "📤",
      label: "Withdrawal",
    },
    withdrawal_approved: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "✅",
      label: "Paid",
    },
    withdrawal_rejected: {
      color: "text-red-600",
      bg: "bg-red-100",
      icon: "❌",
      label: "Rejected",
    },
    promotion: {
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: "🎉",
      label: "Promotion",
    },
    order: {
      color: "text-blue-600",
      bg: "bg-blue-100",
      icon: "📦",
      label: "Order",
    },
    card_activated: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "💳",
      label: "Card",
    },
    system: {
      color: "text-gray-600",
      bg: "bg-gray-100",
      icon: "🔔",
      label: "System",
    },
    announcement: {
      color: "text-blue-600",
      bg: "bg-blue-100",
      icon: "📢",
      label: "Announcement",
    },
    maintenance: {
      color: "text-amber-600",
      bg: "bg-amber-100",
      icon: "🛠️",
      label: "Maintenance",
    },
  };
  return (
    map[type] ?? {
      color: "text-gray-600",
      bg: "bg-gray-100",
      icon: "🔔",
      label: "Notification",
    }
  );
};

const formatFullTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (d >= today) return `Today at ${time}`;
  if (d >= yesterday) return `Yesterday at ${time}`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const pagination = useSelector(selectNotificationPagination);
  const filters = useSelector(selectNotificationFilters);
  const loading = useSelector(selectNotificationLoading);
  const loadingMore = useSelector(selectNotificationLoadingMore);
  const refreshing = useSelector(selectNotificationRefreshing);

  // Load
  const load = (refresh = false) => {
    dispatch(
      fetchNotifications({
        page: 1,
        refresh,
        unread_only: filters.unread_only,
        type: filters.type === "all" ? undefined : filters.type,
      }) as any,
    );
  };

  useEffect(() => {
    load(true);
  }, [filters.unread_only, filters.type]);

  // Load more
  const handleLoadMore = () => {
    if (loadingMore || loading) return;
    if (pagination.current_page < pagination.last_page) {
      dispatch(
        fetchNotifications({
          page: pagination.current_page + 1,
          unread_only: filters.unread_only,
          type: filters.type === "all" ? undefined : filters.type,
        }) as any,
      );
    }
  };

  // Filter change
  const handleFilterChange = (key: string) => {
    if (key === "unread") {
      dispatch(setFilter({ unread_only: true, type: "all" }));
    } else {
      dispatch(setFilter({ unread_only: false, type: key }));
    }
    dispatch(resetNotifications());
  };

  // Notification click
  const handleClick = (n: any) => {
    if (!n.is_read) {
      dispatch(markNotificationAsRead(n.id) as any);
    }
    if (n.action_url) router.push(n.action_url);
  };

  // Actions
  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    if (confirm("Mark all notifications as read?")) {
      dispatch(markAllNotificationsAsRead() as any);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    dispatch(deleteNotification(id) as any);
  };

  const handleClearAll = () => {
    if (confirm("Delete all read notifications?")) {
      dispatch(clearAllNotifications(true) as any);
    }
  };

  // Get active filter key
  const activeFilterKey = filters.unread_only
    ? "unread"
    : filters.type === "all"
      ? "all"
      : filters.type;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Clear read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 overflow-x-auto">
        <div className="flex gap-1">
          {filterOptions.map((f) => {
            const active = activeFilterKey === f.key;
            const showUnreadBadge = f.key === "unread" && unreadCount > 0;

            return (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                {showUnreadBadge && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {loading && notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {filters.unread_only
              ? "No unread notifications"
              : "No notifications yet"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filters.unread_only
              ? "You're all caught up!"
              : "You'll see updates here when things happen."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {notifications.map((n) => {
            const style = getTypeStyle(n.type);
            const isUnread = !n.is_read;

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors group ${
                  isUnread ? "bg-purple-50/40" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center text-xl`}
                >
                  {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3
                      className={`text-sm flex-1 ${
                        isUnread
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-700"
                      }`}
                    >
                      {n.title}
                    </h3>

                    {isUnread && (
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-1.5" />
                    )}
                  </div>

                  {n.body && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {n.body}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.color}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatFullTime(n.created_at)}
                      </span>
                      {n.priority === "urgent" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          URGENT
                        </span>
                      )}
                      {n.priority === "high" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                          HIGH
                        </span>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-2">
                      {n.action_label && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(n);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          {n.action_label} →
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {pagination.current_page < pagination.last_page && (
            <div className="p-4 text-center bg-gray-50">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-purple-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
