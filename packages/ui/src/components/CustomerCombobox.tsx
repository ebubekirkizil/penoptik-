// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type CustomerComboboxProps = {
  customers: Customer[];
  value: string; // customerId
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function CustomerCombobox({ customers, value, onChange, disabled }: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => {
    const q = search.toLocaleLowerCase("tr-TR");
    const name = `${c.firstName} ${c.lastName}`.toLocaleLowerCase("tr-TR");
    return name.includes(q) || c.phone.includes(q);
  });

  const selectedCustomer = customers.find(c => c.id === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-surface border border-border-color rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all disabled:opacity-60"
      >
        <span className="truncate">
          {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName} · ${selectedCustomer.phone}` : "— Müşteri Seçin —"}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-surface/90 backdrop-blur-xl border border-border-color rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center px-3 border-b border-border-color">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="İsim veya telefon ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-border-color">
            {filteredCustomers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Müşteri bulunamadı.</div>
            ) : (
              filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    onChange(customer.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${value === customer.id ? "bg-primary/20 text-foreground font-semibold" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"}`}
                >
                  <Check className={`w-4 h-4 shrink-0 ${value === customer.id ? "opacity-100 text-primary" : "opacity-0"}`} />
                  <span className="truncate">{customer.firstName} {customer.lastName}</span>
                  <span className="text-xs opacity-60 ml-auto shrink-0">{customer.phone}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
