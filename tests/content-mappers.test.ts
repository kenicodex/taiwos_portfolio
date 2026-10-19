import { describe, expect, it } from "vitest";
import { formatMonthYear, formatPeriod, groupTools, mapExperienceRow, mapProjectRow, parsePeriod } from "@/features/content/mappers";

describe("formatMonthYear", () => {
  it("formats an ISO date as Mon YYYY", () => {
    expect(formatMonthYear("2025-03-01")).toBe("Mar 2025");
    expect(formatMonthYear("2024-12-31")).toBe("Dec 2024");
  });

  it("returns an empty string for missing or malformed dates", () => {
    expect(formatMonthYear(null)).toBe("");
    expect(formatMonthYear("")).toBe("");
    expect(formatMonthYear("2025-13-01")).toBe("");
  });
});

describe("formatPeriod", () => {
  const base = { periodLabel: "", startDate: "2025-03-01", endDate: "2025-11-30", isCurrent: false };

  it("uses the admin's period label when one is set", () => {
    expect(formatPeriod({ ...base, periodLabel: "  Spring 2025  " })).toBe("Spring 2025");
  });

  it("derives a range from the dates", () => {
    expect(formatPeriod(base)).toBe("Mar 2025 - Nov 2025");
  });

  it("shows Present for the current role", () => {
    expect(formatPeriod({ ...base, endDate: null, isCurrent: true })).toBe("Mar 2025 - Present");
  });
});

describe("mapProjectRow", () => {
  const row = {
    title: "DP Logistics",
    slug: "dp-logistics",
    category: "Logistics",
    summary: "Delivery management.",
    role: "Product Designer",
    duration: "3 Months",
    placeholderColor: "#1A3F8C",
    caseStudyUrl: null,
    featured: false,
    coverSrc: "/work/dp-logistics.png",
    coverWidth: null,
    coverHeight: null,
  };

  it("links to the project's own case study page by default", () => {
    expect(mapProjectRow(row).href).toBe("/projects/dp-logistics");
  });

  it("uses a custom case study URL when one is set", () => {
    expect(mapProjectRow({ ...row, caseStudyUrl: "https://example.com/case" }).href).toBe("https://example.com/case");
  });

  it("omits the cover when there is no image", () => {
    expect(mapProjectRow({ ...row, coverSrc: null }).cover).toBeUndefined();
  });

  it("uses a default cover box when the image size is unknown", () => {
    expect(mapProjectRow(row).cover).toEqual({ src: "/work/dp-logistics.png", width: 393, height: 309 });
  });
});

describe("mapExperienceRow", () => {
  it("maps achievements to points and derives the period", () => {
    const job = mapExperienceRow({
      company: "Lordwin Group",
      role: "Designer",
      location: null,
      periodLabel: "",
      startDate: "2025-03-01",
      endDate: null,
      isCurrent: true,
      achievements: ["One"],
    });
    expect(job).toEqual({
      company: "Lordwin Group",
      role: "Designer",
      location: "",
      period: "Mar 2025 - Present",
      points: ["One"],
    });
  });
});

describe("groupTools", () => {
  it("returns null when there are no visible skills, so defaults are used", () => {
    expect(groupTools([])).toBeNull();
  });

  it("groups skills into the three About page lists", () => {
    const grouped = groupTools([
      { name: "Figma", category: "design", iconSrc: "/product-app-icons/figma.png" },
      { name: "User interviews", category: "research", iconSrc: null },
      { name: "Slack", category: "collaboration", iconSrc: null },
    ]);
    expect(grouped).toEqual({
      design: [{ name: "Figma", src: "/product-app-icons/figma.png" }],
      research: ["User interviews"],
      collaboration: [{ name: "Slack", src: undefined }],
    });
  });
});

describe("parsePeriod", () => {
  it("reads a range ending in Present", () => {
    expect(parsePeriod("Mar 2025 - Present")).toEqual({ startDate: "2025-03-01", endDate: null, isCurrent: true });
  });

  it("reads a closed range with full and short month names and an en dash", () => {
    expect(parsePeriod("March 2024 – Feb 2025")).toEqual({ startDate: "2024-03-01", endDate: "2025-02-01", isCurrent: false });
  });

  it("returns null for text it cannot read", () => {
    expect(parsePeriod("Sometime in 2024")).toBeNull();
    expect(parsePeriod("Foo 2024 - Bar 2025")).toBeNull();
  });
});
