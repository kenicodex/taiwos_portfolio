"use client";

import { useRef } from "react";
import { ProjectCard } from "@/components/site/project-card";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/features/site/projects";

const BUTTON =
  "flex size-12 items-center justify-center rounded-full border border-brand text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** Horizontal, snap-scrolling row of project cards with previous and next buttons. */
export function ProjectSlider({ projects }: { projects: Project[] }) {
  const track = useRef<HTMLUListElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-3">
        <button type="button" aria-label="Previous projects" onClick={() => scrollByPage(-1)} className={BUTTON}>
          <Icon name="lucide:arrow-left" width={20} height={20} />
        </button>
        <button type="button" aria-label="Next projects" onClick={() => scrollByPage(1)} className={BUTTON}>
          <Icon name="lucide:arrow-right" width={20} height={20} />
        </button>
      </div>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project) => (
          <li key={project.title} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
