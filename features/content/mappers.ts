// Pure conversions from database rows to the shapes the public pages render.
// No server-only imports, so these are unit tested directly.

import type { Project } from "./defaults/projects";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-03-01" -> "Mar 2025". Returns "" for an empty or malformed date. */
export function formatMonthYear(date: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})/.exec(date ?? "");
  if (!match) return "";
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return "";
  return `${MONTHS[month]} ${match[1]}`;
}

/** The period shown on an experience card: the admin's label if set, otherwise derived from the dates. */
export function formatPeriod(row: {
  periodLabel: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}): string {
  if (row.periodLabel.trim()) return row.periodLabel.trim();
  const start = formatMonthYear(row.startDate);
  const end = row.isCurrent ? "Present" : formatMonthYear(row.endDate);
  return end ? `${start} - ${end}` : start;
}

type ProjectRow = {
  title: string;
  slug: string;
  category: string;
  summary: string;
  role: string;
  duration: string;
  placeholderColor: string;
  caseStudyUrl: string | null;
  featured: boolean;
  coverSrc: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
};

/** Default cover box used when the stored image has no recorded size. */
const DEFAULT_COVER_BOX = { width: 393, height: 309 };

/** Maps a published project row to the card shape. The case study defaults to the project's own page. */
export function mapProjectRow(row: ProjectRow): Project & { role: string; duration: string } {
  return {
    title: row.title,
    category: row.category,
    summary: row.summary,
    role: row.role,
    duration: row.duration,
    cover: row.coverSrc
      ? {
          src: row.coverSrc,
          width: row.coverWidth ?? DEFAULT_COVER_BOX.width,
          height: row.coverHeight ?? DEFAULT_COVER_BOX.height,
        }
      : undefined,
    placeholder: row.placeholderColor,
    href: row.caseStudyUrl?.trim() || `/projects/${row.slug}`,
  } as Project & { role: string; duration: string };
}

type ExperienceRow = {
  company: string;
  role: string;
  location: string | null;
  periodLabel: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  achievements: string[];
};

/** Maps an experience row to the card shape used by the experience page. */
export function mapExperienceRow(row: ExperienceRow) {
  return {
    company: row.company,
    role: row.role,
    location: row.location ?? "",
    period: formatPeriod(row),
    points: row.achievements,
  };
}

export type ToolRow = { name: string; category: string; iconSrc: string | null };

/**
 * Groups visible skills into the three tool lists on the About page. Returns null when there are no
 * visible skills at all, so the caller can fall back to the defaults.
 */
export function groupTools(rows: ToolRow[]) {
  if (rows.length === 0) return null;
  const pick = (category: string) =>
    rows.filter((row) => row.category === category).map((row) => ({ name: row.name, src: row.iconSrc ?? undefined }));
  return {
    design: pick("design"),
    research: rows.filter((row) => row.category === "research").map((row) => row.name),
    collaboration: pick("collaboration"),
  };
}

const MONTH_INDEX: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/**
 * Reads a period such as "Mar 2025 - Present" or "March 2024 – Feb 2025" into dates. Returns null when
 * the text does not match, so the seed can skip a row rather than guess.
 */
export function parsePeriod(period: string): { startDate: string; endDate: string | null; isCurrent: boolean } | null {
  const parts = period.split(/\s[-–]\s/).map((part) => part.trim());
  if (parts.length !== 2) return null;
  const start = monthStart(parts[0]);
  if (!start) return null;
  if (/^present$/i.test(parts[1])) return { startDate: start, endDate: null, isCurrent: true };
  const end = monthStart(parts[1]);
  return end ? { startDate: start, endDate: end, isCurrent: false } : null;
}

function monthStart(text: string): string | null {
  const match = /^([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})$/.exec(text);
  if (!match) return null;
  const month = MONTH_INDEX[match[1].toLowerCase()];
  return month ? `${match[2]}-${month}-01` : null;
}
