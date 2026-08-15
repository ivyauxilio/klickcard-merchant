"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function QRCodeDownload({
  promotion,
  qrImage,
  filename = "qrcode",
}) {
  const qrRef = useRef(null);

  // Method 1: Download as PNG using canvas
  const downloadAsPNG = () => {
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Draw image with padding
      const padding = 20;
      ctx.drawImage(
        img,
        padding,
        padding,
        size - padding * 2,
        size - padding * 2,
      );

      // Download as PNG
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = qrImage;
      // link.download = `${filename}.png`;
      link.download = `qr-code-${promotion?.qr_code || "promotion"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Method 2: Using html2canvas (alternative)
  const downloadUsingHtml2Canvas = async () => {
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // You would need to install html2canvas: npm install html2canvas
    // const html2canvas = (await import('html2canvas')).default;
    // const canvas = await html2canvas(svg);
    // const link = document.createElement('a');
    // link.download = `${filename}.png`;
    // link.href = canvas.toDataURL('image/png');
    // link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef}> </div>
      <button
        onClick={downloadAsPNG}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Download PNG
      </button>
    </div>
  );
}
