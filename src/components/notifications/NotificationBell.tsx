"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
} from "@/store/slices/notificationSlice";

const getTypeStyle = (type: string) => {
  const map: Record<string, { color: string; icon: string; bg: string }> = {
    referral_reward: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "🎁",
    },
    referral_signup: {
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: "👋",
    },
    referral_approved: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "💰",
    },
    withdrawal_requested: {
      color: "text-amber-600",
      bg: "bg-amber-100",
      icon: "📤",
    },
    withdrawal_approved: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "✅",
    },
    withdrawal_rejected: {
      color: "text-red-600",
      bg: "bg-red-100",
      icon: "❌",
    },
    promotion: { color: "text-purple-600", bg: "bg-purple-100", icon: "🎉" },
    order: { color: "text-blue-600", bg: "bg-blue-100", icon: "📦" },
    card_activated: {
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: "💳",
    },
    system: { color: "text-gray-600", bg: "bg-gray-100", icon: "🔔" },
    announcement: { color: "text-blue-600", bg: "bg-blue-100", icon: "📢" },
    maintenance: { color: "text-amber-600", bg: "bg-amber-100", icon: "🛠️" },
  };
  return map[type] ?? { color: "text-gray-600", bg: "bg-gray-100", icon: "🔔" };
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return d.toLocaleDateString();
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const router = useRouter();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch + polling
  useEffect(() => {
    dispatch(fetchUnreadCount() as any);
    dispatch(fetchNotifications({ page: 1 }) as any);

    // Poll unread count every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount() as any);
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) {
      // Refresh on open
      dispatch(fetchNotifications({ page: 1, refresh: true }) as any);
    }
  };

  const handleNotificationClick = async (n: any) => {
    // Mark as read
    if (!n.is_read) {
      dispatch(markNotificationAsRead(n.id) as any);
    }

    setOpen(false);

    // Navigate
    if (n.action_url) {
      router.push(n.action_url);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markAllNotificationsAsRead() as any);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    dispatch(deleteNotification(id) as any);
  };

  // Show latest 5 in dropdown
  const previewList = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolid className="w-6 h-6 text-purple-600" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <CheckCircleIcon className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && previewList.length === 0 ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto" />
              </div>
            ) : previewList.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              previewList.map((n) => {
                const style = getTypeStyle(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 group ${
                      !n.is_read ? "bg-purple-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center text-lg`}
                      >
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p
                            className={`text-sm flex-1 ${
                              !n.is_read
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-1.5" />
                          )}
                        </div>

                        {n.body && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {n.time_ago || formatTime(n.created_at)}
                          </span>

                          <button
                            onClick={(e) => handleDelete(e, n.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <Link
              href="/merchant/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-purple-600 hover:text-purple-700 py-1"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
