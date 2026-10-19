// Hardcoded Experience page content. These are the defaults and the fallback when the database has no value.
// Moved verbatim from app/(public)/experience/page.tsx. Keep this pure: no server-only imports.

export const JOBS = [
  {
    company: "Lordwin Group",
    role: "Game & Product UI/UX Designer",
    location: "Remote",
    period: "Mar 2025 - Present",
    points: [
      "Designed web and mobile experiences that streamlined logistics workflows, reduced manual tasks, and improved operational efficiency, with designs successfully handed off to developers.",
      "Redesigned a transport service ecosystem across mobile apps, web applications, and an administrative back-office, simplifying booking flows, reducing manual work, and improving operational visibility.",
      "Improved gameplay clarity, color contrast, and responsive layouts across digital games built for business clients, creating more intuitive and accessible gaming experiences.",
      "Designed a hotel booking service, translating client requirements into a cohesive booking experience while improving visual clarity across key features, including property investment and management.",
    ],
  },
  {
    company: "WovenRemit",
    role: "Product UI/UX Designer",
    location: "Remote",
    period: "Aug 2025 - Nov 2025",
    points: [
      "Spearheaded the full redesign of WovenRemit, enhancing exchange rate transparency and simplifying global money transfer flows to increase user trust and usability.",
      "Led the entire design of Dropatgate, delivering a seamless mobile concierge experience that improved booking clarity and operational efficiency for airport travelers.",
      "Translated complex operational and financial requirements into intuitive, scalable product experiences across mobile and web.",
      "Contributed to the UX optimization of Trustcomply, improving audit workflows, compliance tracking, and overall enterprise platform usability.",
    ],
  },
  {
    company: "Halla Gaming Company Limited",
    role: "Product (UI/UX) & Graphic Designer",
    location: "Hybrid",
    period: "Jan 2024 – Present",
    points: [
      "Designed and launched a sports blog platform (news, videos, odds, predictions), increasing returning user engagement by 25%.",
      "Collaborated closely with developers to build and maintain a scalable design system, reducing design-to-dev handoff time by 20%.",
      "Contributed to UX and content strategy to enhance fan experience, readability, and accessibility across devices.",
      "Created high-performing social media and marketing assets, improving campaign CTR by 15%.",
    ],
  },
  {
    company: "Bridged Centre for Impact (BCI)",
    role: "Product UI/UX Designer",
    location: "Remote",
    period: "Aug 2025 - Nov 2025",
    points: [
      "Redesigned a hospital EMR system to improve usability and streamline daily workflows for clinical staff.",
      "Worked directly with doctors and nurses to identify pain points and simplify complex medical task flows.",
      "Translated real-world healthcare challenges into practical, user-centred design solutions.",
      "Facilitated cross-team collaboration to align technical constraints with medical requirements.",
    ],
  },
  {
    company: "Syncskills",
    role: "UI/UX Designer",
    location: "Remote",
    period: "March 2024 – Feb 2025",
    points: [
      "Spearheaded the full redesign of WovenRemit, enhancing exchange rate transparency and simplifying global money transfer flows to increase user trust and usability.",
      "Led the entire design of Dropatgate, delivering a seamless mobile concierge experience that improved booking clarity and operational efficiency for airport travelers.",
      "Translated complex operational and financial requirements into intuitive, scalable product experiences across mobile and web.",
      "Contributed to the UX optimization of Trustcomply, improving audit workflows, compliance tracking, and overall enterprise platform usability.",
    ],
  },
  {
    company: "Freelance",
    role: "UI/UX and Graphic Designer",
    location: "Remote",
    period: "Apr 2022 - Oct 2023",
    points: [
      "Designed end-to-end user flows, wireframes, and high-fidelity interfaces for clients across finance, social platforms, art galleries, and service products.",
      "Collaborated with clients across different regions and industries, adapting designs to varied user needs.",
      "Delivered production-ready UI designs for applications with 25+ screens.",
      "Conducted usability testing and iterative improvements prior to product launch.",
    ],
  },
] as const;
