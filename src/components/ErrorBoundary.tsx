import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/* ─── Kutilmagan xatolarda butun ilova oq ekran bo'lib qolmasligi uchun ─── */
class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center bg-slate-50 dark:bg-gray-950">
        <p className="text-5xl">⚠️</p>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Kutilmagan xatolik yuz berdi</h1>
        <p className="text-sm max-w-md text-gray-500 dark:text-gray-400">{this.state.error.message}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Sahifani yangilash
          </button>
          <button
            onClick={() => window.location.assign("/")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300"
          >
            Bosh sahifa
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
