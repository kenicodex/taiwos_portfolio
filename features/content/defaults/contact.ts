// Hardcoded Contact page content. These are the defaults and the fallback when the database has no value.
// Moved verbatim from app/(public)/contact/page.tsx. Keep this pure: no server-only imports.

export const CONTACT_EMAIL = "salaudeentaiwo8@gmail.com";

export const DETAILS = [
  { icon: "griddy-icons:email-fast", label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: "proicons:call", label: "Phone", value: "+234 705 400 8872", href: "tel:+2347054008872" },
  { icon: "at-icons:location", label: "Location", value: "Lagos State, Nigeria GMT +1", iconClassName: "text-[#E53E2F]" },
  { icon: "formkit:time", label: "Availability", value: "Open to new opportunities" },
] as const;


export const TIMELINES = ["Less than 1 month", "1 to 3 months", "3 to 6 months", "More than 6 months", "Not sure yet"] as const;
