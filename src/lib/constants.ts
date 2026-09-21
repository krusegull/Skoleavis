import { Category, LocalActivityCategory, Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin (lærer)",
  EDITOR: "Redaktør",
  JOURNALIST: "Journalist",
  PHOTOGRAPHER: "Fotograf",
  DESIGNER: "Grafisk designer",
  SOCIAL_MEDIA: "Sosiale medier-ansvarlig",
};

/** Rekkefølge roller vises i på Redaksjonen-siden og i brukeradministrasjonen. */
export const ROLE_ORDER: Role[] = [
  Role.ADMIN,
  Role.EDITOR,
  Role.JOURNALIST,
  Role.PHOTOGRAPHER,
  Role.DESIGNER,
  Role.SOCIAL_MEDIA,
];

export const CATEGORY_LABELS: Record<Category, string> = {
  NEWS: "Nyheter",
  REPORTAGE: "Reportasje",
  INTERVIEW: "Intervju",
  REVIEW: "Anmeldelse",
  SPORT: "Sport",
  CULTURE: "Kultur",
  WEEKLY_PICK: "Ukas nyhet",
  HISTORICAL_NEWS: "Historiske nyheter",
  COMPETITION: "Konkurranse",
};

export const CATEGORY_SLUGS: Record<Category, string> = {
  NEWS: "nyheter",
  REPORTAGE: "reportasje",
  INTERVIEW: "intervju",
  REVIEW: "anmeldelse",
  SPORT: "sport",
  CULTURE: "kultur",
  WEEKLY_PICK: "ukas-nyhet",
  HISTORICAL_NEWS: "historiske-nyheter",
  COMPETITION: "konkurranse",
};

export const SLUG_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([category, slug]) => [slug, category as Category])
) as Record<string, Category>;

export const CATEGORY_ORDER: Category[] = [
  Category.NEWS,
  Category.REPORTAGE,
  Category.INTERVIEW,
  Category.REVIEW,
  Category.SPORT,
  Category.CULTURE,
  Category.WEEKLY_PICK,
  Category.HISTORICAL_NEWS,
  Category.COMPETITION,
];

export const LOCAL_ACTIVITY_CATEGORY_LABELS: Record<LocalActivityCategory, string> = {
  SPORT: "Idrett",
  LEISURE_CLUB: "Fritidsklubber",
  CULTURE: "Kultur",
  LIBRARY: "Bibliotek",
  OTHER: "Annet",
};

export const LOCAL_ACTIVITY_CATEGORY_ORDER: LocalActivityCategory[] = [
  LocalActivityCategory.SPORT,
  LocalActivityCategory.LEISURE_CLUB,
  LocalActivityCategory.CULTURE,
  LocalActivityCategory.LIBRARY,
  LocalActivityCategory.OTHER,
];

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  NEW: "Ny",
  READ: "Lest",
  ARCHIVED: "Arkivert",
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Kladd",
  PENDING_REVIEW: "Til godkjenning",
  PUBLISHED: "Publisert",
  REJECTED: "Avvist",
};
