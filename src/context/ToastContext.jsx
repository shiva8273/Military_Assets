import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const typeStyles = {
  success: "bg-green-900 border-green-700 text-green-200",
  error: "bg-red-900   border-red-700   text-red-200",
  warning: "bg-amber-900 border-amber-700 text-amber-200",
  info: "bg-blue-900  border-blue-700  text-blue-200",
};

const typeIcons = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-xl animate-slide-up pointer-events-auto ${typeStyles[t.type]}`}
        >
          <span className="text-base leading-5 font-bold flex-shrink-0">
            {typeIcons[t.type]}
          </span>
          <p className="text-sm flex-1 leading-5">{t.message}</p>
          <button
            onClick={() => onRemove(t.id)}
            className="text-current opacity-60 hover:opacity-100 ml-1 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
