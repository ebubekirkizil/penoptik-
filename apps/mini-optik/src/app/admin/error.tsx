"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-8 max-w-lg w-full text-center">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          Bir Hata Oluştu
        </h2>
        <p className="text-sm text-red-500/80 mb-1">
          {error.message || "Bilinmeyen hata"}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Hata kodu: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
