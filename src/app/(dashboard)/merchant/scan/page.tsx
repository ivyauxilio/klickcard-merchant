"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { QrReader } from "react-qr-reader";

export default function QRScannerPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = (data: string | null) => {
    if (data && !processing) {
      setProcessing(true);
      // Process the QR code data
      console.log("QR Code scanned:", data);
      setScanResult(data);

      // Redirect to redemption page with the data
      router.push(`/merchant/scan/redeem?qrcode=${encodeURIComponent(data)}`);
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner error:", err);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
        <div className="relative aspect-square max-w-md mx-auto bg-gray-900 rounded-lg overflow-hidden">
          <QrReader
            onResult={(result, error) => {
              if (result) {
                handleScan(result.getText());
              }
              if (error) {
                // Handle error silently
              }
            }}
            constraints={{
              facingMode: "environment",
            }}
            videoStyle={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none m-8 rounded-lg" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            Position QR code within the box
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/store/hooks";
// import api from "@/lib/axios";
// import { addNotification } from "@/store/slices/uiSlice";
// import { useDispatch } from "react-redux";
// import { QrCodeIcon, CameraIcon } from "@heroicons/react/24/outline";

// // Import a QR scanner library
// import { QrReader } from 'react-qr-reader';

// export default function QRScannerPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { token } = useAppSelector((state) => state.auth);
//   const [scanning, setScanning] = useState(false);
//   const [scanResult, setScanResult] = useState<any>(null);
//   const [processing, setProcessing] = useState(false);
//   const [showScanner, setShowScanner] = useState(false);

//   const handleScan = async (data: any) => {
//     if (data && data.text && !processing) {
//       setProcessing(true);
//       setScanning(false);

//       try {
//         // Parse QR code data
//         const qrData = JSON.parse(data.text);
//         const { promotion_id, qr_code, user_id } = qrData;

//         // Verify and redeem the promotion
//         const response = await api.post(
//           "/merchant/scan/redeem",
//           {
//             promotion_id,
//             qr_code,
//             user_id,
//           },
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );

//         const result = response.data;

//         if (result.success) {
//           dispatch(
//             addNotification({
//               type: "success",
//               message: "Promotion redeemed successfully!",
//             }),
//           );
//           setScanResult({
//             success: true,
//             data: result.data,
//           });
//         } else {
//           dispatch(
//             addNotification({
//               type: "error",
//               message: result.message || "Failed to redeem promotion",
//             }),
//           );
//           setScanResult({
//             success: false,
//             message: result.message,
//           });
//         }
//       } catch (error: any) {
//         dispatch(
//           addNotification({
//             type: "error",
//             message: error.response?.data?.message || "Scan failed",
//           }),
//         );
//         setScanResult({
//           success: false,
//           message: error.response?.data?.message || "Invalid QR code",
//         });
//       } finally {
//         setProcessing(false);
//       }
//     }
//   };

//   const handleError = (err: any) => {
//     console.error("QR Scanner error:", err);
//     dispatch(
//       addNotification({
//         type: "error",
//         message: "Camera access denied. Please enable camera permission.",
//       }),
//     );
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6 p-4">
//       <div className="flex items-center gap-4">
//         <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
//         <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
//           Merchant Scanner
//         </span>
//       </div>

//       {/* Scan Result */}
//       {scanResult && (
//         <div
//           className={`p-4 rounded-lg ${
//             scanResult.success
//               ? "bg-green-50 border border-green-200"
//               : "bg-red-50 border border-red-200"
//           }`}
//         >
//           <div className="flex items-center gap-3">
//             {scanResult.success ? (
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-6 h-6 text-green-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//             ) : (
//               <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-6 h-6 text-red-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </div>
//             )}
//             <div>
//               <h3
//                 className={`font-medium ${scanResult.success ? "text-green-800" : "text-red-800"}`}
//               >
//                 {scanResult.success
//                   ? "Redemption Successful!"
//                   : "Redemption Failed"}
//               </h3>
//               <p
//                 className={`text-sm ${scanResult.success ? "text-green-600" : "text-red-600"}`}
//               >
//                 {scanResult.data?.title ||
//                   scanResult.message ||
//                   "Unknown error"}
//               </p>
//               {scanResult.data && (
//                 <div className="mt-2 text-sm text-gray-600">
//                   <p>Customer: {scanResult.data.user_name || "N/A"}</p>
//                   <p>Discount: {scanResult.data.discount_text || "N/A"}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//           <button
//             onClick={() => setScanResult(null)}
//             className="mt-3 text-sm text-gray-500 hover:text-gray-700"
//           >
//             Scan another QR code
//           </button>
//         </div>
//       )}

//       {/* Scanner Controls */}
//       {!scanResult && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           {!showScanner ? (
//             <button
//               onClick={() => setShowScanner(true)}
//               className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex flex-col items-center"
//             >
//               <CameraIcon className="w-16 h-16 text-gray-400" />
//               <p className="mt-4 text-gray-600">Tap to start scanning</p>
//               <p className="text-sm text-gray-400">
//                 Point camera at customer's QR code
//               </p>
//             </button>
//           ) : (
//             <div className="space-y-4">
//               <div className="relative aspect-square max-w-md mx-auto bg-gray-900 rounded-lg overflow-hidden">
//                 <QrScanner
//                   onScan={handleScan}
//                   onError={handleError}
//                   style={{ width: "100%", height: "100%" }}
//                   facingMode="environment"
//                   delay={300}
//                 />
//                 <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none m-8 rounded-lg" />
//                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//                   <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
//                     Position QR code within the box
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <button
//                   onClick={() => setShowScanner(false)}
//                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     // Reset scanner state
//                     setScanResult(null);
//                     setProcessing(false);
//                   }}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                 >
//                   <CameraIcon className="w-5 h-5 inline mr-2" />
//                   Resume Scanning
//                 </button>
//               </div>

//               {processing && (
//                 <div className="flex items-center justify-center py-4">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
//                   <span className="ml-3 text-gray-600">Processing...</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Instructions */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <h4 className="font-medium text-blue-800 flex items-center gap-2">
//           <QrCodeIcon className="w-5 h-5" />
//           How to redeem
//         </h4>
//         <ol className="mt-2 text-sm text-blue-700 space-y-1 list-decimal list-inside">
//           <li>Customer shows their QR code on their phone</li>
//           <li>Tap "Start Scanning" and point camera at the QR code</li>
//           <li>System will validate and redeem the promotion</li>
//           <li>Both parties receive confirmation</li>
//         </ol>
//       </div>
//     </div>
//   );
// }
