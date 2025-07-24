"use client";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  question: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  question
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Delete Chat History
        </h3>

        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this chat history entry?
        </p>

        <div className="bg-gray-700 border border-gray-600 rounded p-3 mb-6">
          <p className="text-sm text-gray-300">
            <strong>Question:</strong> {question}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 