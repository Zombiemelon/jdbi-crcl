"use client";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/feed";
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">Completing sign-in, please wait...</p>
      </div>
    </main>
  );
}
