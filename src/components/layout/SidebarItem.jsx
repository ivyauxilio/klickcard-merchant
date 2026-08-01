"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  onClick,
  badge,
}) {
  const pathname = usePathname();
  const isActive = active || (href && pathname === href);

  return (
    <li>
      <Link
        href={href || "#"}
        onClick={onClick}
        className={`
          flex items-center px-4 py-3 rounded-lg transition-all duration-200
          ${
            isActive
              ? "bg-primary-50 text-primary-600"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }
          ${!href && "cursor-default"}
        `}
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-6 h-6">
          <Icon
            className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-gray-500"}`}
          />
        </div>

        {/* Label */}
        <span className="ml-3 text-sm font-medium whitespace-nowrap">
          {label}
        </span>

        {/* Badge */}
        {badge && (
          <span
            className={`
            ml-auto px-2 py-0.5 text-xs font-medium rounded-full
            ${isActive ? "bg-primary-200 text-primary-700" : "bg-gray-200 text-gray-600"}
          `}
          >
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}
