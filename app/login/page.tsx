"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) router.replace(redirect);
      })
      .catch(() => {});
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.replace(redirect);
      } else {
        setError(data.error || "Invalid password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-sm mx-4"
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        padding: "32px 28px",
      }}
    >
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20l.03-.02A4.4 4.4 0 0 0 5 21a4 4 0 0 0 4-4v-3" />
            <circle cx="18" cy="6" r="1" fill="white" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
          }}
        >
          Kuruvi
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
          Enter password to continue
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: "100%",
            height: "44px",
            padding: "0 14px",
            fontSize: "14px",
            borderRadius: "10px",
            border: error ? "1px solid #ef4444" : "1px solid #e5e7eb",
            outline: "none",
            background: "#fafbfc",
            color: "#111827",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = "#6366f1";
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = "#e5e7eb";
          }}
        />

        {error && (
          <p
            style={{
              fontSize: "13px",
              color: "#ef4444",
              marginTop: "8px",
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!password.trim() || loading}
          style={{
            width: "100%",
            height: "44px",
            marginTop: "16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            cursor: password.trim() && !loading ? "pointer" : "not-allowed",
            background: password.trim() && !loading ? "#6366f1" : "#e5e7eb",
            color: password.trim() && !loading ? "#ffffff" : "#9ca3af",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#fafbfc" }}
    >
      <Suspense
        fallback={
          <div
            className="w-full max-w-sm mx-4"
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin mx-auto"
              style={{ borderTopColor: "#6366f1" }}
            />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
