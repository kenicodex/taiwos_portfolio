// Site-wide profile, navigation and social links. These are hard-coded for now; they should move to
// site_settings (and a nav table or block) once the admin settings screens exist.

export const PROFILE = {
  name: "Taiwo Salaudeen",
  role: "Product Designer",
  initials: "TS",
  avatarSrc: "/avatar.png",
  location: "Lagos State, Nigeria GMT +1",
  resumeHref: "/Taiwo's_CV.pdf",
} as const;

export type NavItem = { label: string; href: string };

// Header navigation (pill menu). Hrefs starting with "/#" point at sections on the homepage.
export const HEADER_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Contact", href: "/contact" },
];

// Footer navigation (dotted row).
export const FOOTER_NAV: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Process", href: "/#process" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/contact" },
];

export type SocialLink = { label: string; href: string; icon: `tabler:${string}` };

// TODO: replace the "#" placeholders with the real profile URLs.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "LinkedIn", href: "#", icon: "tabler:brand-linkedin" },
  { label: "Email", href: "mailto:hello@example.com", icon: "tabler:mail" },
  { label: "Twitter", href: "#", icon: "tabler:brand-twitter" },
  { label: "Dribbble", href: "#", icon: "tabler:brand-dribbble" },
];
