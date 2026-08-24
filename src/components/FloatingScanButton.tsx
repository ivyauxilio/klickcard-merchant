// components/FloatingScanButton.tsx
"use client";

import { useState } from "react";
import { QrCodeIcon, CameraIcon } from "@heroicons/react/24/solid";

interface FloatingScanButtonProps {
  onPress: () => void;
}

export default function FloatingScanButton({
  onPress,
}: FloatingScanButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="floating-scan-button bottom-6 right-6 z-40 md:hidden">
      <button
        onClick={onPress}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className={`
          group relative w-16 h-16 rounded-full
          bg-gradient-to-r from-purple-600 to-indigo-600
          shadow-lg shadow-purple-500/50
          flex items-center justify-center
          transition-all duration-300
          ${isPressed ? "scale-90" : "scale-100 hover:scale-105"}
          active:scale-90
        `}
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />

        {/* Icon */}
        <CameraIcon className="w-8 h-8 text-white relative z-10" />

        {/* Badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
      </button>

      {/* Tooltip */}
      <div className="floating-scan-text absolute bg-gray-800 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Scan Card
      </div>
    </div>
  );
}
