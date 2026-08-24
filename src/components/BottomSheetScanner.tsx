// components/BottomSheetScanner.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  XMarkIcon,
  CameraIcon,
  QrCodeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface BottomSheetScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export default function BottomSheetScanner({
  isOpen,
  onClose,
  onScanSuccess,
}: BottomSheetScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "bottom-sheet-scanner";
  const isInitializedRef = useRef(false);

  const cleanupScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    // Clear the ref immediately so another initialization
    // cannot use the same scanner instance.
    scannerRef.current = null;

    try {
      await scanner.stop();
    } catch (error) {
      console.log("Scanner already stopped:", error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.log("Scanner already cleared:", error);
    }

    setIsScanning(false);
  };

  const initScanner = useCallback(async () => {
    try {
      if (isInitializedRef.current) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      await cleanupScanner();

      scannerRef.current = new Html5Qrcode(containerId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
          cleanupScanner();
          onClose();
        },
        (errorMessage) => {
          if (!errorMessage.includes("NotFoundException")) {
            console.log("Scan error:", errorMessage);
          }
        },
      );

      isInitializedRef.current = true;
      setIsScanning(true);
      setError(null);
    } catch (error) {
      console.error("Error starting scanner:", error);
      setError("Could not access camera");
    }
  }, [cleanupScanner, onClose, onScanSuccess]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => initScanner(), 300);
      return () => clearTimeout(timer);
    } else {
      cleanupScanner();
    }
  }, [isOpen, initScanner, cleanupScanner]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          cleanupScanner();
          onClose();
        }}
      />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Scan QR Code</h3>
            </div>
            <button
              onClick={() => {
                cleanupScanner();
                onClose();
              }}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Position the QR code within the frame
          </p>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  initScanner();
                }}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="relative bg-black rounded-xl overflow-hidden">
              <div
                id={containerId}
                className="w-full aspect-square max-h-[400px]"
              />
              <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none m-2 rounded-lg" />
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isScanning ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                {isScanning ? "Scanning..." : "Initializing..."}
              </div>
            </div>
          )}

          {/* Toggle Manual Input */}
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="mt-4 text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors w-full text-center"
          >
            {showManualInput ? "Back to Scanner" : "Enter code manually"}
          </button>

          {/* Manual Input */}
          {showManualInput && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Enter QR code (e.g., AWHTCH7R)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  autoFocus
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Verify
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Enter the QR code displayed on the card
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Camera access required</span>
          <span>v1.0</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
