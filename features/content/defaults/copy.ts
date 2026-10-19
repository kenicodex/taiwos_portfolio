// Hardcoded page copy. These are the defaults and the fallback when the database has no value.
// Moved verbatim from the page files. Keep this pure: no server-only imports.

export const ABOUT_INTRO = {
  pill: "About Me",
  headingBefore: "Designing products that simplify complexity and create",
  headingHighlight: "immersive user experience",
  paragraphs: [
    "Hi, I'm a Product Designer with over 5 years of experience designing digital products across Fintech, AI, Healthcare, Logistics, gaming and enterprise software.",
    "I enjoy turning complex problems into intuitive, scalable experiences by combining user research, strategic thinking, and thoughtful interactive design.",
  ],
  resumeLabel: "Download Resume",
  connectLabel: "Let's Connect",
  basedInLabel: "Based in",
  basedInValue: "Lagos Nigeria",
} as const;

export const ABOUT_SECTIONS = {
  services: "What I do best",
  process: "My Design Process",
  journey: "My Journey",
  tools: "Tools & Skills",
  toolsDesign: "Design",
  toolsResearch: "Research",
  toolsCollaboration: "Collaboration",
  industries: "Industries I Work In",
  funFacts: "Fun Facts",
} as const;

export const ABOUT_CTA = {
  heading: "Let's build products people love using.",
  body: "I'm always open to discussing new opportunities and interesting projects.",
  buttonLabel: "Let's Work Together!",
} as const;

export const PROJECTS_PAGE = {
  pill: "My Projects",
  heading: "Recent Projects",
  intro:
    "A collection of product design projects that demonstrate how I solve complex problems through research, strategy and thoughtful design.",
  resumeLabel: "Download Resume",
  connectLabel: "Let's Connect",
  caseStudyLabel: "View Case Study",
} as const;

export const PROJECTS_CTA = {
  heading: "Interested in working together?",
  body: "Let's create products that solve real problems and deliver meaningful experiences.",
  buttonLabel: "Contact me",
} as const;

export const EXPERIENCE_PAGE = {
  pill: "My Journey",
  headingBefore: "5+ years of designing solutions that solve",
  headingHighlight: "real business problems.",
  intro:
    "I've had the opportunity to work across fintech, healthcare, gaming, enterprise software, logistics, AI, E-commerce and more. Partnering with startups and growing teams to create products that are reliable, scalable, and built around real user needs.",
  quote: "Turning complex problems into simple, intuitive products people love using.",
} as const;

export const EXPERIENCE_CTA = {
  heading: "Let's create something impactful together.",
  body: "I'm always open to discussing new opportunities and interesting projects.",
  buttonLabel: "Let's Talk",
} as const;

export const CONTACT_PAGE = {
  pill: "Get in Touch",
  heading: "Let's build something amazing together.",
  introLines: ["Have a project in mind or just want to say hello?", "I'd love to hear from you."],
} as const;
