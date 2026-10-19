// Hardcoded About page content. These are the defaults and the fallback when the database has no value.
// Moved verbatim from app/(public)/about/page.tsx. Keep this pure: no server-only imports.

export const SERVICES = [
  {
    icon: "streamline:strategy-tasks",
    title: "Product Strategy",
    body: "Understanding business goals and transforming them into user-centred solutions.",
  },
  {
    icon: "griddy-icons:user-edit",
    title: "User Experience Design",
    body: "Creating intuitive user journeys through research, wireframing, prototyping, and usability testing.",
  },
  {
    icon: "carbon:interface-usage",
    title: "Interface Design",
    body: "Designing clean, modern interfaces with strong visual hierarchy and accessibility.",
  },
  {
    icon: "streamline-ultimate:screen-curved",
    title: "Design Systems",
    body: "Building scalable components, libraries that improve consistency and speed across products.",
  },
] as const;

export const PROCESS_LEFT = [
  { icon: "hugeicons:discover-square", title: "Discover", body: "Understanding the users, business goals, and challenges." },
  { icon: "iconoir:brain-research", title: "Research", body: "User interviews, competitor analysis, and product audits." },
  { icon: "griddy-icons:ai-flow", title: "Define", body: "Mapping user flow and prioritising opportunities." },
] as const;

export const PROCESS_RIGHT = [
  { icon: "iconoir:design-nib", title: "Design", body: "Wireframes, prototypes, and high-fidelity interfaces." },
  { icon: "fluent:person-feedback-20-regular", title: "Test", body: "Collecting feedback and refining the experience." },
  { icon: "hugeicons:safe-delivery-01", title: "Deliver", body: "Developer handoff, QA, and iteration after launch." },
] as const;

export const JOURNEY = [
  { year: "2019", body: "Started my career as a UI Designer, learning the fundamentals of user-centred design." },
  { year: "2020 - 2021", body: "Expanded into UX research, product thinking and enterprise applications." },
  { year: "2022", body: "Worked on gaming, logistics and marketplace platforms." },
  { year: "2023", body: "Designed Fintech products, including remittance and payment experiences." },
  {
    year: "2024",
    current: true,
    body: "Focused on enterprise software, AI products, healthcare systems, and compliance platforms while collaborating with cross-functional teams from discovery to delivery.",
  },
] as const;

export const DESIGN_TOOLS = [
  { name: "Figma", src: "/product-app-icons/image%201822.png" },
  { name: "FigJam", src: "/product-app-icons/image%201822.png" },
  { name: "Adobe Illustrator", src: "/product-app-icons/adobeai.png" },
  { name: "Photoshop", src: "/product-app-icons/photoshop.png" },
] as const;

export const RESEARCH_TOOLS = ["User interviews", "Journey Mapping", "Usability Testing", "Information Architecture"] as const;

export const COLLABORATION_TOOLS = [
  { name: "Jira", src: "/product-app-icons/jira.png" },
  { name: "ClickUp", src: "/product-app-icons/clickup.png" },
  { name: "Chat GPT", src: "/product-app-icons/chatgpt.png" },
  { name: "Notion", src: "/product-app-icons/notion.png" },
  { name: "Slack", src: "/product-app-icons/slack.png" },
] as const;

export const INDUSTRIES = [
  { name: "Logistics", icon: "griddy-icons:delivery" },
  { name: "Fintech", icon: "carbon:finance" },
  { name: "Enterprise", icon: "clarity:building-line" },
  { name: "Healthcare", icon: "mage:heart-health" },
  { name: "AI & SaaS", icon: "arcticons:mi-finance" },
  { name: "iGaming", icon: "streamline:ai-gaming-spark" },
] as const;

export const FUN_FACTS = [
  "I enjoy simplifying complex workflows.",
  "I believe great design is invisible, it feels natural.",
  "I love exploring new AI tools and design trends.",
  "Outside work, I enjoy skateboarding and learning about emerging technology.",
] as const;
