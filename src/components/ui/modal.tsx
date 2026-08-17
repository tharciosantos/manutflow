"use client";

import { useEffect, useRef, useId } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  variant = "danger",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && !isLoading) {
      onClose();
    }
  }

  const variantStyles = {
    danger: {
      icon: (
        <svg className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
      confirmButton:
        "bg-red-600 hover:bg-red-500 focus:ring-red-500",
    },
    warning: {
      icon: (
        <svg className="h-6 w-6 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      ),
      confirmButton:
        "bg-amber-600 hover:bg-amber-500 focus:ring-amber-500",
    },
    info: {
      icon: (
        <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      ),
      confirmButton:
        "bg-teal-600 hover:bg-teal-500 focus:ring-teal-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      aria-labelledby={titleId}
      className="fixed inset-0 m-auto h-fit w-full max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {!children && (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-red-500/10' : variant === 'warning' ? 'bg-amber-500/10' : 'bg-teal-500/10'}`}>
              {styles.icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
            )}
            {children}
          </div>
        </div>
      </div>

      {!children && (
        <div className="flex flex-row items-center justify-center gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirmButton}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processando...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
        </div>
      )}
    </dialog>
  );
}
