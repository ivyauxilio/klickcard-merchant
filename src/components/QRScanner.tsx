// components/QRScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export default function QRScanner({
  onScanSuccess,
  onScanError,
  onClose,
  isOpen,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);

  const containerId = "qr-reader-container-sidebar";

  /**
   * Stop and clean up the QR scanner
   */
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

  /**
   * Start the QR scanner
   */
  const initScanner = async () => {
    // Prevent duplicate initialization
    if (isStartingRef.current) {
      return;
    }

    // Don't create another scanner if one is already running
    if (scannerRef.current) {
      return;
    }

    const container = document.getElementById(containerId);

    if (!container) {
      console.error("QR scanner container not found");

      setError("Scanner container not found.");
      return;
    }

    try {
      isStartingRef.current = true;
      setError(null);

      // Make sure the container is empty
      container.innerHTML = "";

      const scanner = new Html5Qrcode(containerId);

      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: {
          width: 200,
          height: 200,
        },
        aspectRatio: 1,
      };

      await scanner.start(
        { facingMode: "environment" },
        config,

        // QR scan success
        (decodedText) => {
          console.log("QR Code detected:", decodedText);

          // Send result to parent component
          onScanSuccess(decodedText);

          // Stop camera after successful scan
          void cleanupScanner();

          if (onClose) {
            onClose();
          }
        },

        // QR scan error
        (errorMessage) => {
          // html5-qrcode generates this constantly while
          // looking for a QR code, so don't show it to users.
          if (onScanError && !errorMessage.includes("NotFoundException")) {
            onScanError(errorMessage);
          }
        },
      );

      setIsScanning(true);

      console.log("QR scanner started successfully");
    } catch (error) {
      console.error("QR CAMERA ERROR:", error);

      scannerRef.current = null;
      setIsScanning(false);

      const message = error instanceof Error ? error.message : String(error);

      console.error("Camera error details:", message);

      setError(
        "Could not access camera. Please allow camera permission and try again.",
      );
    } finally {
      isStartingRef.current = false;
    }
  };

  /**
   * Start/stop scanner when isOpen changes
   */
  useEffect(() => {
    if (!isOpen) {
      void cleanupScanner();
      return;
    }

    // Give React time to render the scanner container
    const timer = window.setTimeout(() => {
      void initScanner();
    }, 300);

    return () => {
      window.clearTimeout(timer);
      void cleanupScanner();
    };
  }, [isOpen]);

  /**
   * Don't render anything when scanner is closed
   */
  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>

          <h3 className="text-white font-medium">Scan QR Code</h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              void cleanupScanner();
              onClose();
            }}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close scanner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Scanner content */}
      <div className="p-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center">
            <div className="text-red-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM10.29 3.86l-7.82 13.5A2 2 0 004.2 20.36h15.6a2 2 0 001.73-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <p className="text-red-600 text-sm">{error}</p>

            <button
              type="button"
              onClick={() => {
                setError(null);
                void initScanner();
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* html5-qrcode renders the camera here */}
            <div id={containerId} className="w-full max-w-md mx-auto" />

            {/* Scanner border */}
            <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none m-4 rounded-lg" />

            {/* Scanning indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isScanning ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />

              {isScanning ? "Scanning..." : "Initializing camera..."}
            </div>

            {/* Instructions */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
              Position QR code in center
            </div>
          </div>
        )}

        {/* Camera permission hint */}
        {!error && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Allow camera access when your browser asks for permission.
          </p>
        )}
      </div>
    </div>
  );
}
