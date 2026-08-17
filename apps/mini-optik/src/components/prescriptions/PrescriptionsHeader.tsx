"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck, FileDown } from "lucide-react";
import SgkMustehaklikModal from "./SgkMustehaklikModal";
import SgkEreceteModal from "./SgkEreceteModal";
import { PrescriptionSearch } from "@/components/PrescriptionSearch";

export default function PrescriptionsHeader() {
  const [isMustehaklikOpen, setIsMustehaklikOpen] = useState(false);
  const [isEreceteOpen, setIsEreceteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Göz Bilgileri</h1>
          <p className="text-muted-foreground text-sm mt-1">Reçete takibi ve SGK Sorgulamaları</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex-1 w-full sm:w-[300px]">
            <PrescriptionSearch />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsEreceteOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 font-bold rounded-xl transition-colors border border-blue-200 dark:border-blue-500/20"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">E-Reçete</span>
            </button>

            <button 
              onClick={() => setIsMustehaklikOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 font-bold rounded-xl transition-colors border border-indigo-200 dark:border-indigo-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Müstehaklık</span>
            </button>

            <Link
              href="/admin/customers/new"
              className="flex-1 sm:flex-none btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Reçete</span>
            </Link>
          </div>
        </div>
      </div>

      <SgkMustehaklikModal 
        isOpen={isMustehaklikOpen} 
        onClose={() => setIsMustehaklikOpen(false)} 
      />
      <SgkEreceteModal 
        isOpen={isEreceteOpen} 
        onClose={() => setIsEreceteOpen(false)} 
      />
    </>
  );
}
