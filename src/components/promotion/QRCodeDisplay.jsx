"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UsersIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import QRCodeDownload from "./QRCodeDownload";

export default function QRCodeDisplay({ promotion }) {
  const [qrValue, setQrValue] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      if (!promotion?.promotion_id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchant/qr-code/${promotion.promotion_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load QR code");
        }

        const data = await response.json();

        // Store the QR code image data
        if (data.data?.qr_code_image) {
          setQrImage(data.data.qr_code_image);
        }

        // Also set QR value for fallback
        if (data.data?.qr_code) {
          setQrValue(data.data.qr_code);
        }

        setError(null);
      } catch (err) {
        console.error("QR Code fetch error:", err);
        setError(err.message);
        // Use fallback QR code generation
        if (promotion?.qr_code) {
          setQrValue(
            JSON.stringify({
              promotion_id: promotion.promotion_id,
              qr_code: promotion.qr_code,
              title: promotion.title,
            }),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [promotion]);

  const downloadAsPNG = () => {
    const img = new window.Image();

    img.onload = () => {
      const size = 400;
      const padding = 20;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);

      // Draw the QR code
      ctx.drawImage(
        img,
        padding,
        padding,
        size - padding * 2,
        size - padding * 2,
      );

      // Convert canvas to PNG
      const pngUrl = canvas.toDataURL("image/png");

      // Download
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-code-${promotion?.qr_code || "promotion"}.png`;
      link.click();
    };

    img.src = qrImage; // SVG data URL or SVG file URL
  };

  // Check if promotion is active/valid
  const isValid =
    promotion?.status === "active" &&
    (!promotion?.end_date || new Date(promotion.end_date) >= new Date());

  const remainingUses = promotion?.usage_limit
    ? promotion.usage_limit - (promotion?.used_count || 0)
    : "∞";

  const usagePercentage = promotion?.usage_limit
    ? ((promotion?.used_count || 0) / promotion.usage_limit) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !qrValue) {
    return (
      <div className="text-center p-4 text-red-600">
        <ExclamationCircleIcon className="w-12 h-12 mx-auto mb-2" />
        <p>Failed to load QR code</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCodeIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium text-gray-900">QR Code</h3>
        </div>
        <div className="flex items-center gap-2">
          {isValid ? (
            <span className="flex items-center text-sm text-green-600">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Active
            </span>
          ) : (
            <span className="flex items-center text-sm text-red-600">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {promotion?.status === "expired" ? "Expired" : "Inactive"}
            </span>
          )}
        </div>
      </div>

      {/* QR Code Display */}
      <div className="p-6">
        <div className="flex flex-col items-center">
          {/* Toggle QR Code Button */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <QrCodeIcon className="w-4 h-4" />
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </button>

          {/* QR Code Display */}
          {showQR && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              {/* Option 1: Display base64 image from API */}
              {qrImage ? (
                <img
                  src={qrImage}
                  alt="QR Code"
                  className="w-48 h-48"
                  onError={(e) => {
                    // If image fails to load, show fallback
                    e.target.style.display = "none";
                    document.getElementById("qr-fallback").style.display =
                      "block";
                  }}
                />
              ) : null}

              {/* Option 2: Fallback using qrcode.react */}
              <div
                id="qr-fallback"
                style={{ display: qrImage ? "none" : "block" }}
              >
                {qrValue && (
                  <QRCodeSVG
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="w-48 h-48"
                  />
                )}
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                Scan to redeem promotion
              </p>

              {/* Download Button */}
              {qrImage && (
                <button
                  // onClick={() => {
                  //   const link = document.createElement("a");
                  //   link.href = qrImage;
                  //   link.download = `qr-code-${promotion?.qr_code || "promotion"}.svg`;
                  //   document.body.appendChild(link);
                  //   link.click();
                  //   document.body.removeChild(link);
                  // }}
                  onClick={downloadAsPNG}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download QR Code
                </button>
              )}
              {/* <div className="flex justify-center">
                <QRCodeDownload
                  promotion={promotion}
                  qrImage={qrImage}
                  qrValue={qrValue}
                  variant="button"
                />
              </div> */}
            </div>
          )}

          {/* Usage Stats */}
          <div className="w-full mt-6 space-y-3">
            {/* Usage Progress */}
            {promotion?.usage_limit && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Usage</span>
                  <span className="font-medium text-gray-900">
                    {promotion?.used_count || 0} /{" "}
                    {promotion?.usage_limit || "∞"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usagePercentage >= 100
                        ? "bg-red-600"
                        : usagePercentage >= 80
                          ? "bg-yellow-600"
                          : "bg-green-600"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">
                    {remainingUses === "∞"
                      ? "Unlimited"
                      : `${remainingUses} remaining`}
                  </span>
                  <span className="text-gray-500">
                    {usagePercentage.toFixed(0)}% used
                  </span>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">QR Code</p>
                <p className="text-sm font-mono text-gray-700 truncate">
                  {promotion?.qr_code || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Used</p>
                <p className="text-sm text-gray-700">
                  {promotion?.last_used_at
                    ? new Date(promotion.last_used_at).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
