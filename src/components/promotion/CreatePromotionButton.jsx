// components/promotions/CreatePromotionButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon } from "@heroicons/react/24/outline";
import { fetchWallet, selectWallet } from "@/store/slices/walletSlice";
import InsufficientCreditsModal from "./InsufficientCreditsModal";

export default function CreatePromotionButton() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wallet = useSelector(selectWallet);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    // ✅ Refresh wallet to get latest balance
    dispatch(fetchWallet());

    // Minimum is 1 credit (basic voucher)
    if ((wallet?.credit_balance ?? 0) < 1) {
      setShowModal(true);
      return;
    }

    router.push("/promotions/create");
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30"
      >
        <PlusIcon className="w-5 h-5" />
        Create Promotion
      </button>

      <InsufficientCreditsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredCredits={1}
        availableCredits={wallet?.credit_balance ?? 0}
        voucherType="basic"
      />
    </>
  );
}
