export const ROLES = {
  MEGA_ADMIN: "MEGA_ADMIN",
  PERSONEL_3: "PERSONEL_3",
  PERSONEL_2: "PERSONEL_2",
  PERSONEL_1: "PERSONEL_1",
} as const;

export type Role = keyof typeof ROLES;

const roleHierarchy: Record<string, number> = {
  PERSONEL_1: 1,
  PERSONEL_2: 2,
  PERSONEL_3: 3,
  MEGA_ADMIN: 4,
};

/**
 * Checks if the given user role is greater than or equal to the required role in the hierarchy.
 * @param userRole - The role of the user (e.g., from cookies or DB)
 * @param requiredRole - The minimum role required for the action
 * @returns boolean
 */
export function hasRequiredRole(userRole: string, requiredRole: Role): boolean {
  // Varsayılan olarak eğer userRole tanımlı değilse en düşük yetki PERSONEL_1 veya MEGA_ADMIN?
  // Normalde login esnasında atanır ancak null ise yetkisiz kabul edilir.
  if (!userRole) return false;
  
  // Eğer eski kayıtlarda FIRM_ADMIN vb. varsa onu MEGA_ADMIN gibi görebiliriz veya en azından PERSONEL_3 yapabiliriz.
  if (userRole === "FIRM_ADMIN") return true; 

  const userLevel = roleHierarchy[userRole] ?? 0;
  const reqLevel = roleHierarchy[requiredRole] ?? 0;
  
  return userLevel >= reqLevel;
}
