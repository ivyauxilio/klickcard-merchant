"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function QRCodeDownload({ value, filename = "qrcode" }) {
  const qrRef = useRef(null);

  const downloadQR = () => {
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef}>
        <QRCodeSVG value={value} size={200} level="H" includeMargin={true} />
      </div>
      <button
        onClick={downloadQR}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Download QR Code
      </button>
    </div>
  );
}
