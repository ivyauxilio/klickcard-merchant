"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteMenuItem } from "@/store/slices/menuSlice";
import { addNotification } from "@/store/slices/uiSlice";

export default function DeleteButton({
  itemId,
  itemName,
  onSuccess,
  variant = "icon",
  className = "",
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await dispatch(deleteMenuItem(itemId)).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: `"${itemName}" has been deleted successfully!`,
        }),
      );

      setShowModal(false);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to menu list if not on success callback
        router.push("/menu");
        router.refresh();
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: error || "Failed to delete menu item",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Icon button variant (for table/list views)
  if (variant === "icon") {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ${className}`}
          title="Delete item"
        >
          <TrashIcon className="w-4 h-4" />
        </button>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <DeleteModal
            itemName={itemName}
            isLoading={isLoading}
            onConfirm={handleDelete}
            onCancel={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Button variant (for detail pages)
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ${className}`}
      >
        <TrashIcon className="w-4 h-4" />
        Delete Item
      </button>

      {showModal && (
        <DeleteModal
          itemName={itemName}
          isLoading={isLoading}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

function DeleteModal({ itemName, isLoading, onConfirm, onCancel }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Menu Item
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{itemName}"</strong>?
              This action cannot be undone and all associated data will be
              permanently removed.
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
