"use client";

import { useState } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold">{title}</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-zinc-300">{message}</p>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-zinc-800 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for easy confirm dialog usage
export function useConfirm() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "default" | "danger";
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const confirm = (
    title: string,
    message: string,
    variant: "default" | "danger" = "default"
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        variant,
        onConfirm: () => {
          setDialogState({ isOpen: false, title: "", message: "" });
          resolve(true);
        },
        onCancel: () => {
          setDialogState({ isOpen: false, title: "", message: "" });
          resolve(false);
        },
      });
    });
  };

  const handleCancel = () => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      title={dialogState.title}
      message={dialogState.message}
      variant={dialogState.variant}
      onConfirm={dialogState.onConfirm || (() => {})}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogComponent };
}
