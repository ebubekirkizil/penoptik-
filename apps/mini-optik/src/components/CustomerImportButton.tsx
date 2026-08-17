"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import CustomerImportModal from "./CustomerImportModal";

export default function CustomerImportButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">İçe Aktar</span>
      </button>

      {showModal && (
        <CustomerImportModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
