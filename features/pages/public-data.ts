import "server-only";
import { cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { experiences, media, projects, skills } from "@/db/schema";
import type { BlockData } from "@/features/page-builder/render/blocks";
import { PUBLIC_CONTENT_TAG } from "./service";

/** Loads only the collections a page's blocks display. Published rows only. */
export async function getBlockData(needs: string[]): Promise<BlockData> {
  "use cache";
  cacheTag(PUBLIC_CONTENT_TAG);

  const wants = new Set(needs);
  const [projectRows, skillRows, experienceRows] = await Promise.all([
    wants.has("projects")
      ? db
          .select({
            id: projects.id,
            title: projects.title,
            slug: projects.slug,
            summary: projects.summary,
            category: projects.category,
            featured: projects.featured,
            coverSrc: media.url,
          })
          .from(projects)
          .leftJoin(media, eq(projects.coverImageId, media.id))
          .where(eq(projects.status, "published"))
          .orderBy(asc(projects.displayOrder))
      : Promise.resolve([]),
    wants.has("skills")
      ? db
          .select({ id: skills.id, name: skills.name, category: skills.category })
          .from(skills)
          .orderBy(asc(skills.displayOrder))
      : Promise.resolve([]),
    wants.has("experience")
      ? db
          .select({
            id: experiences.id,
            company: experiences.company,
            role: experiences.role,
            startDate: experiences.startDate,
            endDate: experiences.endDate,
            isCurrent: experiences.isCurrent,
            description: experiences.description,
          })
          .from(experiences)
          .orderBy(asc(experiences.displayOrder))
      : Promise.resolve([]),
  ]);

  return { projects: projectRows, skills: skillRows, experience: experienceRows };
}
