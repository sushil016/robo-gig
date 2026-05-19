"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-700">Something went wrong</p>
              <p className="mt-1 text-xs text-red-500">{this.state.error?.message}</p>
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
