import { prisma } from "./prisma";

export interface StatusConfig {
  id: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const DEFAULT_STATUS_CONFIG: StatusConfig[] = [
  { id: "PENDING",   label: "Bekleyen",      color: "text-amber-500",   bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "PREPARING", label: "Hazırlanıyor",  color: "text-blue-500",    bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "READY",     label: "Teslime Hazır", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "DELIVERED", label: "Teslim Edildi", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
];

import { unstable_cache } from "next/cache";

export const getStatusConfig = unstable_cache(
  async (firmId?: string): Promise<StatusConfig[]> => {
    try {
      let settings = null;
      
      if (firmId) {
        settings = await prisma.settings.findFirst({ where: { firmId } });
      }
      
      // Fallback to global if firm specific settings not found or orderStatusConfig is null
      if (!settings || !settings.orderStatusConfig) {
        settings = await prisma.settings.findFirst({ where: { id: "global" } });
      }

      if (settings?.orderStatusConfig) {
        const parsed = JSON.parse(settings.orderStatusConfig);
        
        // Backward compatibility: If it's an object map instead of an array, convert it
        if (!Array.isArray(parsed)) {
          return Object.entries(parsed).map(([id, val]: [string, any]) => ({ id, ...val }));
        }
        
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing orderStatusConfig", e);
    }
    return DEFAULT_STATUS_CONFIG;
  },
  ['status-config'],
  { revalidate: 60, tags: ['settings'] }
);
