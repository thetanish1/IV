"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import AdminButton from "./AdminButton";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AdminErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 rounded-2xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-ink-950/90 backdrop-blur-md text-center space-y-6 max-w-xl mx-auto my-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-500/30 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {this.props.fallbackTitle || "An unexpected error occurred"}
            </h3>
            <p className="text-xs text-gray-600 dark:text-ink-400 max-w-[65ch] mx-auto leading-relaxed">
              The module failed to render cleanly. This error has been isolated to prevent tearing down the admin console session.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 text-[11px] font-mono text-red-600 dark:text-red-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <AdminButton
              variant="brand"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={this.handleRetry}
            >
              Retry Component
            </AdminButton>

            <AdminButton
              variant="outline"
              size="sm"
              icon={<Home className="w-3.5 h-3.5" />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/admin/dashboard";
              }}
            >
              Reset Dashboard
            </AdminButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
