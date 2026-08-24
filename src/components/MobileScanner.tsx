// components/MobileScanner.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  XMarkIcon,
  CameraIcon,
  ArrowLeftIcon,
  QrCodeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface MobileScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  onScanError?: (error: string) => void;
}

export default function MobileScanner({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
}: MobileScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "mobile-scanner-container";
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup scanner
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

  // Initialize scanner
  const initScanner = useCallback(async () => {
    try {
      if (isInitializedRef.current) {
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        setError("Scanner container not found");
        return;
      }

      await cleanupScanner();

      scannerRef.current = new Html5Qrcode(containerId);

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (isMountedRef.current) {
            onScanSuccess(decodedText);
            cleanupScanner();
            // Don't auto-close, let the parent handle it
          }
        },
        (errorMessage) => {
          if (onScanError && !errorMessage.includes("NotFoundException")) {
            onScanError(errorMessage);
          }
        },
      );

      isInitializedRef.current = true;
      setIsScanning(true);
      setError(null);
    } catch (error) {
      console.error("Error starting scanner:", error);
      setError("Could not access camera. Please check permissions.");
      isInitializedRef.current = false;
    }
  }, [cleanupScanner, onScanError, onScanSuccess]);

  // Handle isOpen changes
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen) {
      const timer = setTimeout(() => {
        initScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      cleanupScanner();
      setShowManualInput(false);
      setManualCode("");
    }

    return () => {
      isMountedRef.current = false;
      cleanupScanner();
    };
  }, [isOpen, initScanner, cleanupScanner]);

  // Toggle flash
  const toggleFlash = async () => {
    try {
      if (scannerRef.current) {
        // @ts-ignore - torch method might not be in types
        await scannerRef.current.torch(flashOn ? false : true);
        setFlashOn(!flashOn);
      }
    } catch (error) {
      console.error("Flash toggle error:", error);
    }
  };

  // Switch camera
  const switchCamera = async () => {
    try {
      if (scannerRef.current) {
        await cleanupScanner();
        const container = document.getElementById(containerId);
        if (container) {
          scannerRef.current = new Html5Qrcode(containerId);
          const config = {
            fps: 15,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
          };
          await scannerRef.current.start(
            { facingMode: "user" },
            config,
            (decodedText) => {
              if (isMountedRef.current) {
                onScanSuccess(decodedText);
                cleanupScanner();
              }
            },
            (errorMessage) => {
              if (onScanError && !errorMessage.includes("NotFoundException")) {
                onScanError(errorMessage);
              }
            },
          );
          setIsScanning(true);
        }
      }
    } catch (error) {
      console.error("Camera switch error:", error);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <div className="relative z-10 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              cleanupScanner();
              onClose();
            }}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-white font-semibold text-lg">Scan Card</h2>
          <div className="w-10" />
        </div>
        <p className="text-white/60 text-xs text-center mt-1">
          Position the QR code within the frame
        </p>
      </div>

      {/* Scanner Area - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md aspect-square">
          <div
            id={containerId}
            className="w-full h-full rounded-xl overflow-hidden"
          />

          {/* Scanner Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-4 left-4 w-14 h-14 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-14 h-14 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-14 h-14 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-14 h-14 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 border-2 border-purple-500/50 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-purple-500/30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-purple-500/30" />
            </div>

            {/* Scan line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan" />

            {/* Status indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isScanning
                    ? "bg-green-500 animate-pulse"
                    : "bg-yellow-500 animate-pulse"
                }`}
              />
              <span>{isScanning ? "Scanning..." : "Initializing..."}</span>
            </div>
          </div>

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <div className="text-center p-6 max-w-xs">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-white text-sm mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    initScanner();
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls - All centered */}
      <div className="relative z-10 px-6 py-6 bg-gradient-to-t from-black/90 to-transparent">
        {/* Manual input toggle */}
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-white/60 text-xs hover:text-white/80 transition-colors text-center w-full mb-4"
        >
          {showManualInput ? "← Back to Scanner" : "Enter code manually"}
        </button>

        {/* Manual input */}
        {showManualInput && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter QR code (e.g., AWHTCH7R)"
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              autoFocus
              maxLength={10}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Verify
            </button>
          </div>
        )}

        {/* Bottom controls row - Centered */}
        <div className="flex items-center justify-center gap-8">
          {/* Flash button */}
          <button
            onClick={toggleFlash}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 ${flashOn ? "text-yellow-400" : "text-white"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18v-5m0 0V7m0 6h5m-5 0H7"
              />
            </svg>
          </button>

          {/* Main Scan/Close button - Center */}
          <button
            onClick={() => {
              cleanupScanner();
              onClose();
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/50 flex items-center justify-center text-white hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95"
          >
            <CameraIcon className="w-10 h-10" />
          </button>

          {/* Switch camera button */}
          <button
            onClick={switchCamera}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h5M20 20v-5h-5M4 20l7-7m9-9l-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Helper text */}
        <p className="text-white/30 text-xs text-center mt-4">
          Tap the camera button to close scanner
        </p>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translate(-50%, -50%) translateY(-100px);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) translateY(100px);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-100px);
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
