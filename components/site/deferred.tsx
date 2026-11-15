"use client";

// Client components used by only some pages. Each becomes its own chunk, so other pages don't download it.
// They still render on the server (ssr stays on), so the content is in the HTML for search engines.
import dynamic from "next/dynamic";

export const DeferredContactForm = dynamic(() => import("@/app/(public)/contact/ContactForm").then((m) => m.ContactForm));

export const DeferredTestimonialCarousel = dynamic(() =>
  import("@/components/site/testimonial-carousel").then((m) => m.TestimonialCarousel),
);

export const DeferredProjectSlider = dynamic(() => import("@/components/site/project-slider").then((m) => m.ProjectSlider));
