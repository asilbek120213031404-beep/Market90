import { AlertTriangle, Loader2 } from "lucide-react";
import { useEscape } from "../hooks/useEscape";

/* ─── Tasdiqlash oynasi ─── */
const ConfirmDialog = ({
  isDark,
  title,
  message,
  confirmLabel = "Tasdiqlash",
  danger = false,
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: {
  isDark: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  useEscape(() => !loading && onCancel());

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && onCancel()} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 flex flex-col gap-4
          ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              ${danger ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-600"}`}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h2 id="confirm-title" className={`font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
              {title}
            </h2>
            <div className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{message}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors
              ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            autoFocus
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${danger ? "bg-red-500 hover:bg-red-400" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
