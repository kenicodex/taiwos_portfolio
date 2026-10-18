"use client";

import Image from "next/image";
import { useRef } from "react";
import { Icon } from "@/components/ui/icon";

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  logo: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

const ARROW =
  "inline-flex size-12 items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// Horizontal, snap-scrolling carousel. The arrows scroll one card at a time; no slide state is kept.
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    const card = list?.firstElementChild as HTMLElement | null | undefined;
    if (!list || !card) return;
    list.scrollBy({ left: direction * (card.offsetWidth + 24), behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6">
      <ul
        ref={listRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <li
            key={index}
            className="shrink-0 snap-start basis-[85%] sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
          >
            <figure className="flex h-full flex-col gap-6 rounded-2xl bg-white dark:bg-neutral-900 p-7 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.3)]">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon name="lucide:quote" width={18} height={18} />
              </span>
              <blockquote className="flex-1 text-[17px] leading-7 text-neutral-800 dark:text-neutral-200">
                “{item.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-5">
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="size-12 shrink-0 object-contain"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white"
                  >
                    {initials(item.company || item.author)}
                  </span>
                )}
                <span className="flex flex-col">
                  <span className="font-bold text-neutral-950 dark:text-neutral-50">{item.role}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.company}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => scroll(-1)}
          className={`${ARROW} bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300`}
        >
          <Icon name="lucide:chevron-left" width={20} height={20} />
        </button>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => scroll(1)}
          className={`${ARROW} bg-brand text-white`}
        >
          <Icon name="lucide:chevron-right" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}
