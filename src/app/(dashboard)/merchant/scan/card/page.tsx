// app/merchant/scan/card/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { merchantCardAPI } from "@/lib/merchantCards";
import { addNotification } from "@/store/slices/uiSlice";
import { useDispatch } from "react-redux";
import {
  QrCodeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";

// QR Scanner Component using react-qr-reader
import { Html5Qrcode } from "html5-qrcode";

export default function ScanCardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [manualQrInput, setManualQrInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Initialize QR scanner
  useEffect(() => {
    if (showScanner) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [showScanner]);

  const initializeScanner = async () => {
    try {
      if (!scannerContainerRef.current) return;

      scannerRef.current = new Html5Qrcode("qr-reader-container");

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError,
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      setError("Could not access camera. Please check permissions.");
      setShowScanner(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning after successful scan
    await stopScanner();
    setShowScanner(false);

    // Process the QR code
    await performScan(decodedText);
  };

  const onScanError = (error: any) => {
    // Ignore errors (they happen frequently during scanning)
    // console.log("Scan error:", error);
  };

  const handleManualScan = async () => {
    if (!manualQrInput.trim()) {
      setError("Please enter or paste the QR code data.");
      return;
    }

    await performScan(manualQrInput.trim());
  };

  const performScan = async (qrData: string) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await merchantCardAPI.scanCard(qrData);
      // const response = await merchantCardAPI.getCardByQr(qrData);
      if (response.success) {
        setScanResult(response.data);
        dispatch(
          addNotification({
            type: "success",
            message: "Card verified successfully!",
          }),
        );

        // Play success sound or haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        setError(response.message || "Failed to scan card.");
        if (navigator.vibrate) {
          navigator.vibrate([100, 100, 100]);
        }
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to scan card. Please try again.",
      );
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100]);
      }
    } finally {
      setLoading(false);
      setManualQrInput("");
    }
  };

  // Simulate QR code scan for testing
  const simulateScan = async () => {
    // In production, this would be a real QR code
    const demoQrData = btoa(
      JSON.stringify({
        card_id: "card_123456",
        type: "physical_card",
        version: "1.0",
        timestamp: new Date().toISOString(),
      }),
    );

    setManualQrInput(demoQrData);
    await performScan(demoQrData);
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setManualQrInput(text);
    } catch (error) {
      setError("Could not read from clipboard. Please paste manually.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6" />
            Scan Customer Card
          </h1>
          <p className="text-purple-100 text-sm mt-1">
            Scan the customer's physical card QR code to verify their identity
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Scanner Section */}
          <div className="space-y-4">
            {/* Scan Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <CameraIcon className="w-5 h-5" />
                {showScanner ? "Close Scanner" : "Open QR Scanner"}
              </button>
              <button
                onClick={simulateScan}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <QrCodeIcon className="w-5 h-5" />
                Test
              </button>
            </div>

            {/* QR Scanner Container */}
            {showScanner && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <div
                  id="qr-reader-container"
                  ref={scannerContainerRef}
                  className="w-full aspect-square max-w-md mx-auto"
                />
                <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none m-4 rounded-lg" />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  {isScanning ? "Scanning..." : "Initializing camera..."}
                </div>
              </div>
            )}

            {/* Manual Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Or enter QR code data manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualQrInput}
                  onChange={(e) => {
                    setManualQrInput(e.target.value);
                    setError(null);
                  }}
                  placeholder="Paste QR code data here"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading || showScanner}
                />
                <button
                  onClick={handlePaste}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  disabled={loading || showScanner}
                >
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleManualScan}
                disabled={loading || !manualQrInput.trim() || showScanner}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Verifying...
                  </div>
                ) : (
                  "Verify Card"
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">
                    Verification Failed
                  </h4>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {scanResult && (
            <div className="space-y-6">
              {/* Verification Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800">
                      Card Verified Successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      Scanned at{" "}
                      {new Date(
                        scanResult.verification.scan_timestamp,
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      QR Code:{" "}
                      {scanResult.verification.qr_valid
                        ? "✅ Valid"
                        : "⚠️ Invalid"}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {scanResult.user.full_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {scanResult.user.email}
                      </p>
                    </div>
                  </div>

                  {scanResult.user.phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {scanResult.user.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          scanResult.user.member_since,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Information */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-purple-600" />
                  Card Information
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Card Number</p>
                    <p className="font-medium text-gray-900">
                      {scanResult.card.card_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        scanResult.card.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {scanResult.card.status.charAt(0).toUpperCase() +
                        scanResult.card.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <CurrencyDollarIcon className="w-4 h-4 text-green-600" />₱
                      {scanResult.card.balance.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      {scanResult.card.points}
                    </p>
                  </div>

                  {scanResult.card.expires_at && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Expires At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          scanResult.card.expires_at,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setScanResult(null);
                    setManualQrInput("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Scan Another Card
                </button>
                <button
                  onClick={() => router.push("/merchant/dashboard")}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
