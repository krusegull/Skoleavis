import { Role } from "@prisma/client";

/**
 * Eneste stedet rettigheter er definert i appen. Rettigheter følger alltid
 * ROLLEN til en aktiv konto - aldri en bestemt e-postadresse eller bruker-id.
 */

export function canApproveArticles(role: Role | null | undefined): boolean {
  return role === Role.ADMIN || role === Role.EDITOR;
}

export function canManageUsers(role: Role | null | undefined): boolean {
  return role === Role.ADMIN;
}

export function canManageSchoolYears(role: Role | null | undefined): boolean {
  return role === Role.ADMIN;
}

/** Alle aktive roller kan opprette og redigere egne kladder. */
export function canCreateDrafts(role: Role | null | undefined): boolean {
  return role != null;
}

export function canEditArticle(
  role: Role | null | undefined,
  articleAuthorId: string,
  currentUserId: string | null | undefined
): boolean {
  if (canApproveArticles(role)) return true;
  return articleAuthorId === currentUserId;
}

export function canAccessDashboard(role: Role | null | undefined): boolean {
  return role != null;
}
