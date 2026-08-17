"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "Bireysel" | "Kurumsal";
  orderCount: number;
  prescriptionCount: number;
  lastOrderDate: string;
  lastOrderStatus: string;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  frameModel: string;
  status: "Bekleyen" | "Hazırlanıyor" | "Teslime Hazır" | "Teslim Edildi";
  date: string;
};

type DemoState = {
  customers: Customer[];
  orders: Order[];
  addCustomer: (c: Customer) => void;
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
};

const DemoStateContext = createContext<DemoState | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "c1", name: "Ebubekir Kızıldax", phone: "05510698812", email: "", type: "Bireysel", orderCount: 1, prescriptionCount: 0, lastOrderDate: "2026-07-25", lastOrderStatus: "Bekliyor" },
    { id: "c2", name: "Muzaffer Kaya", phone: "05537761095", email: "", type: "Bireysel", orderCount: 2, prescriptionCount: 0, lastOrderDate: "2026-07-09", lastOrderStatus: "Hazırlanıyor" },
    { id: "c3", name: "Ecrin Sare Güzel", phone: "05527330554", email: "", type: "Bireysel", orderCount: 1, prescriptionCount: 0, lastOrderDate: "2026-07-07", lastOrderStatus: "Teslim Edildi" },
    { id: "c4", name: "Beyza Gürüx", phone: "05323694954", email: "", type: "Bireysel", orderCount: 1, prescriptionCount: 0, lastOrderDate: "2026-07-06", lastOrderStatus: "Teslim Edildi" },
    { id: "c5", name: "Özgür AYDIN", phone: "05342255014", email: "LegendsOfGamers2017@hotmail.com", type: "Bireysel", orderCount: 0, prescriptionCount: 0, lastOrderDate: "", lastOrderStatus: "Siparix yok" },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: "o1", customerId: "c1", customerName: "Ebubekir Kızıldax", customerPhone: "05510698812", amount: 10000, frameModel: "sfokk", status: "Bekleyen", date: "2026-07-25" },
    { id: "o2", customerId: "c2", customerName: "Muzaffer Kaya", customerPhone: "05537761095", amount: 17000, frameModel: "Persol", status: "Hazırlanıyor", date: "2026-07-09" },
    { id: "o3", customerId: "c2", customerName: "Muzaffer Kaya", customerPhone: "05537761095", amount: 7500, frameModel: "Quantum", status: "Teslime Hazır", date: "2026-07-09" },
    { id: "o4", customerId: "c3", customerName: "Ecrin Sare Güzel", customerPhone: "05527330554", amount: 7000, frameModel: "RayBan", status: "Teslim Edildi", date: "2026-07-07" },
    { id: "o5", customerId: "c4", customerName: "Beyza Gürüx", customerPhone: "05323694954", amount: 12000, frameModel: "", status: "Teslim Edildi", date: "2026-07-06" },
  ]);

  const addCustomer = (c: Customer) => {
    setCustomers((prev) => [c, ...prev]);
  };

  const addOrder = (o: Order) => {
    setOrders((prev) => [o, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <DemoStateContext.Provider value={{ customers, orders, addCustomer, addOrder, updateOrderStatus }}>
      {children}
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error("useDemoState must be used within a DemoStateProvider");
  }
  return context;
}
