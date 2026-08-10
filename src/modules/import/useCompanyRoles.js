import { useQuery } from "@tanstack/react-query";
import { buildRoleMap, getCompanyRoles } from "./import.service";
// TODO: sesuaikan path import di atas dengan lokasi asli import.service.js
// relatif terhadap folder hooks/ project-mu.

/**
 * Roles milik company user yang sedang login, hanya di-fetch selagi modal
 * (AddUserForm) terbuka. Mengembalikan juga role-name -> role-id map dan
 * id role default berdasarkan `defaultRoleName`.
 */
export function useCompanyRoles(isOpen, userId, defaultRoleName) {
  const { data: roles = [] } = useQuery({
    queryKey: ["company-roles", userId],
    queryFn: () => getCompanyRoles(userId),
    enabled: isOpen && Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  const roleMap = buildRoleMap(roles);
  const defaultRoleId = roleMap[defaultRoleName?.toLowerCase()] ?? null;

  return { roles, roleMap, defaultRoleId };
}