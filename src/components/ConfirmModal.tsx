import React, { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Yes, Confirm",
  cancelText = "Cancel",
}) => {
  // Close modal when pressing Escape key // Accessibility: Improves keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog" // Accessibility: Announces modal as a dialog
      aria-modal="true" // Accessibility: Ensures focus is trapped inside the modal
      aria-labelledby="modal-title" // Accessibility: Links title to modal
      aria-describedby="modal-message" // Accessibility: Links message to modal
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          {title}
        </h2>
        <p id="modal-message" className="mb-4">
          {message}
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onClose}
            aria-label="Cancel and close modal" // Accessibility: Describes button action for screen readers
            autoFocus // Focuses on the cancel button when modal opens
          >
            {cancelText}
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onConfirm}
            aria-label={`Confirm ${title}`} // Accessibility: Provides context to screen readers
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
