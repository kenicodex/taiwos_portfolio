"use client";

import Image from "next/image";
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

// The scroll needs enough cards to fill the screen twice over, so short lists are repeated.
function loopable(items: Testimonial[]) {
  if (items.length === 0 || items.length >= 3) return items;
  return Array.from({ length: Math.ceil(3 / items.length) }).flatMap(() => items);
}

// Automatic, endless horizontal scroll. It pauses while the pointer or keyboard focus is on it.
// With reduced motion on, it stops, and a visible scrollbar lets the list be scrolled by hand.
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const cards = loopable(items);
  const group = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-6 pr-6">
      {cards.map((item, index) => (
        <li key={index} className="w-[85vw] max-w-[360px] shrink-0 sm:w-[calc((100vw-6rem)/2)] lg:w-[calc((min(100vw,80rem)-3rem)/3)] lg:max-w-none">
          <figure className="flex h-full flex-col gap-6 rounded-2xl bg-white dark:bg-neutral-900 p-7 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.3)]">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-light text-brand">
              <Icon name="lucide:quote" width={18} height={18} />
            </span>
            <blockquote className="flex-1 text-[17px] leading-7 text-neutral-800 dark:text-neutral-200">
              “{item.quote}”
            </blockquote>
            <figcaption className="flex items-center gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-5">
              {item.logo ? (
                <Image src={item.logo} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 object-contain" />
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
  );

  return (
    <div
      role="region"
      aria-label="Testimonials"
      className="group overflow-x-auto pb-2 motion-safe:overflow-hidden motion-safe:[scrollbar-width:none] motion-safe:[&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max motion-safe:animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
