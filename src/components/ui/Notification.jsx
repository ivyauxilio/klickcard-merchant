"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectNotifications,
  removeNotification,
} from "@/store/slices/uiSlice";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const notificationStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
    icon: CheckCircleIcon,
    iconColor: "text-green-400",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    icon: XCircleIcon,
    iconColor: "text-red-400",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    icon: ExclamationCircleIcon,
    iconColor: "text-yellow-400",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
    icon: InformationCircleIcon,
    iconColor: "text-blue-400",
  },
};

export default function Notification() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  useEffect(() => {
    // Auto-dismiss notifications after duration
    notifications.forEach((notification) => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const style =
          notificationStyles[notification.type] || notificationStyles.info;
        const Icon = style.icon;

        return (
          <div
            key={notification.id}
            className={`${style.bg} border-l-4 ${style.border} rounded-lg shadow-lg p-4 animate-slide-in`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`w-5 h-5 ${style.iconColor}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${style.text}`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => dispatch(removeNotification(notification.id))}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
