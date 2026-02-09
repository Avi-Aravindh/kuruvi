"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#fafbfc",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "32px",
        textAlign: "center",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          margin: "0 auto 20px",
          borderRadius: "12px",
          background: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#111827",
          margin: "0 0 8px 0",
        }}>
          Something went wrong
        </h1>

        <p style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "1.5",
          margin: "0 0 24px 0",
        }}>
          {error?.message || "An unexpected error occurred"}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              background: "#6366f1",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            Reload Page
          </button>

          <button
            onClick={reset}
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              background: "#ffffff",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
