"use client";

import { useSidebar } from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    return segments[segments.length - 1]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page Title */}
          <h1 className="text-lg font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              {user?.name || user?.email} ivy
            </span>
            {/* <span className="hidden font-body text-sm text-ink/55 sm:inline">
              {user?.name || user?.email}
            </span> */}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
}

// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser } from "@/store/slices/authSlice";

// const links = [
//   { href: "/dashboard", label: "Dashboard" },
//   { href: "/profile", label: "Profile" },
// ];

// export default function Navbar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   async function handleLogout() {
//     await dispatch(logoutUser());
//     router.replace("/login");
//   }

//   return (
//     <header className="border-b border-ink/8 bg-white">
//       <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
//         <div className="flex items-center gap-8">
//           <Link href="/dashboard" className="font-display text-lg font-semibold text-ink">
//             Auth App
//           </Link>
//           <nav className="hidden gap-6 sm:flex">
//             {links.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`font-body text-sm font-medium transition ${
//                   pathname === link.href ? "text-brand-600" : "text-ink/55 hover:text-ink"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </nav>
//         </div>

//         <div className="flex items-center gap-4">
//           <span className="hidden font-body text-sm text-ink/55 sm:inline">
//             {user?.name || user?.email}
//           </span>
//           <button
//             onClick={handleLogout}
//             className="rounded-lg border border-ink/15 px-3.5 py-1.5 font-body text-sm font-medium text-ink transition hover:bg-ink/5"
//           >
//             Log out
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }
