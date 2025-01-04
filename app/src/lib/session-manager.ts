import { useRoles } from "./hooks";

export function CheckUserRole (requiredRoles: string[], roles: string[]) {

  try {
    return requiredRoles.some(requiredPermission => roles.some(role =>
      role.includes(requiredPermission)
    )
    );
  } catch (error) {
    console.error("Error checking user role:", error);

    return false;
  }
}

export const useCheckUserRole = (requiredRoles: string[]): (() => boolean) => {
  const [, roles] = useRoles();

  return () =>
    requiredRoles.some(requiredPermission =>
      roles.some(role => role.role_name.includes(requiredPermission))
    );
};