// Case study content for /projects/[slug]. Images live in public/projects/case_study_images/<folder>/.
// Width and height are the source file's pixel size, so next/image reserves the right space.

const IMAGES = "/projects/case_study_images";

/** `overlay` places the image over the previous image in its group, as a percentage of that image's box. */
export type CaseStudyImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Places the image over the previous image in its group. Percentages of the group's box. */
  overlay?: { left: string; top: string; width: string };
  /** On the first image of a group: the group's box is this aspect ratio, and the image is placed inside it. */
  frame?: { aspect: number; left: string; top: string; width: string };
};

export type CaseStudySection = {
  heading: string;
  paragraphs: string[];
  images: CaseStudyImage[];
  /** Overrides the case study's picture background for this section. */
  pictureBackground?: string;
  /** Padding classes for this section's picture panel. */
  panelPadding?: string;
  /** Width classes for the images in this section's panel. */
  imageClassName?: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  category: string;
  role: string;
  duration: string;
  summary: string;
  /** Background behind the hero device mockups. */
  heroBackground: string;
  /** Background behind every picture section. Falls back to the default panel colour. */
  pictureBackground?: string;
  /** Decorative image drawn in the bottom-right corner of each picture panel. */
  pictureArt?: string;
  /** Headline shown to the left of the hero images, one entry per line. */
  heroTitle?: string[];
  heroTitleFont?: "open-sans" | "plus-jakarta-sans";
  /** Font size of the hero title on large screens, in px. */
  heroTitleSize?: 60 | 64;
  /** Padding classes for the hero panel. Overrides the default and the flush option. */
  heroPadding?: string;
  /** Shows the intro paragraphs under the hero panel instead of above it. */
  introAfterHero?: boolean;
  /** Lines of smaller text under the hero title. */
  heroSubtitle?: string[];
  /** Hero images sit on the bottom edge of the hero panel and the panel has little space above them. */
  heroImagesFlush?: boolean;
  /** Background of the footer picture panel. Defaults to the warm off-white panel colour. */
  footerBackground?: string;
  /** Headline centred above the hero images. */
  heroTopTitle?: string[];
  /** Images fill the full width of their picture panel instead of a capped width. */
  wideImages?: boolean;
  hero: CaseStudyImage[];
  intro: string[];
  sections: CaseStudySection[];
  closing: string[];
  /** Full-width image shown after the closing copy. */
  footerImage?: CaseStudyImage;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "wovenremit",
    title: "WovenRemit",
    category: "Fintech",
    role: "Product Designer",
    duration: "3 Months",
    summary:
      "A currency exchange and international money-transfer comparison platform that helps people understand rates and compare transfer options.",
    heroBackground: "#050D0580",
    pictureBackground: "#050D0580",
    pictureArt: `${IMAGES}/wovenremit/right-svg-art.png`,
    heroTitle: ["Fast, Secure", "Money Transfer", "You can Trust"],
    hero: [
      { src: `${IMAGES}/wovenremit/laptop-behind-phone.png`, width: 592, height: 351, alt: "WovenRemit rate checker on a laptop" },
      {
        src: `${IMAGES}/wovenremit/phone-in-front-of-laptop.png`,
        width: 201,
        height: 389,
        alt: "WovenRemit rate checker on a phone",
        overlay: { left: "80.8%", top: "7.2%", width: "33.4%" },
      },
    ],
    intro: [
      "WovenRemit is a currency exchange and international money-transfer comparison platform designed to help people understand exchange rates, compare transfer options, and make more informed decisions about sending money across borders.",
    ],
    sections: [
      {
        heading: "The consumer exchange experience",
        paragraphs: [
          "Individual users need a straightforward rate-checking experience, while businesses need a way to understand the service and communicate their payment requirements. The design aimed to create a connected experience that makes currency information accessible and supports informed transfer decisions.",
        ],
        images: [
          { src: `${IMAGES}/wovenremit/laptop-behind-phone-2.png`, width: 422, height: 276, alt: "Live rate results on a laptop" },
          {
            src: `${IMAGES}/wovenremit/phone-in-front-of-laptop-2.png`,
            width: 146,
            height: 298,
            alt: "Live rate results on a phone",
            overlay: { left: "83.8%", top: "2.8%", width: "29.2%" },
          },
          { src: `${IMAGES}/wovenremit/laptop-behind-phone-3.png`, width: 529, height: 313, alt: "Live rates at your fingertips on a laptop" },
          {
            src: `${IMAGES}/wovenremit/phone-in-front-of-laptop-3.png`,
            width: 146,
            height: 298,
            alt: "Rate alerts on a phone",
            overlay: { left: "76.9%", top: "2.9%", width: "26.8%" },
          },
        ],
      },
      {
        heading: "Structured rates and familiar comparisons",
        paragraphs: [
          "The design work established a connected experience for currency checking, provider comparison, rate monitoring, and business payment inquiries. To make financial information easy to understand, I used a structured rate checker and consistent provider cards, giving important figures a clear hierarchy and keeping related information together.",
          "I also established a repeatable comparison-card structure and used it across the mobile and website experiences, allowing users to review providers within a familiar visual pattern.",
        ],
        images: [],
      },
      {
        heading: "WovenBusiness",
        paragraphs: [
          "The product also extends beyond individual consumers through WovenBusiness, a business-focused experience that introduces international payment solutions and allows companies to submit enquiries about their payment needs.",
          "WovenBusiness communicates the business proposition and provides a structured form for collecting relevant payment requirements. This journey gives business visitors a dedicated path from understanding the service to expressing interest in a solution.",
        ],
        images: [
          {
            src: `${IMAGES}/wovenremit/laptop-left-behind.png`,
            width: 502,
            height: 297,
            alt: "WovenBusiness payslip and invoicing feature",
            frame: { aspect: 2.959, left: "0%", top: "21%", width: "44.96%" },
          },
          {
            src: `${IMAGES}/wovenremit/laptop-right-behind.png`,
            width: 502,
            height: 297,
            alt: "WovenBusiness key features",
            overlay: { left: "55.15%", top: "21.6%", width: "44.85%" },
          },
          {
            src: `${IMAGES}/wovenremit/laptop-center-forward.png`,
            width: 552,
            height: 327,
            alt: "WovenBusiness homepage and enquiry form",
            overlay: { left: "24%", top: "0%", width: "49.14%" },
          },
        ],
      },
    ],
    closing: [
      "WovenRemit was an opportunity to design a fintech experience around a central user need: understanding international exchange options before making a transfer decision.",
      "My focus was on simplifying currency selection, structuring provider comparisons, providing a dedicated rate alert experience, and creating a separate business journey for international payment inquiries.",
    ],
  },
  {
    slug: "sportsdey",
    title: "SportsDey",
    category: "Blog & Gaming",
    role: "Product Designer",
    duration: "3 Months",
    summary:
      "A sports content and gaming platform that brings news, videos, betting tips, odds and match predictions into one experience.",
    heroBackground: "#5E8A6A",
    pictureBackground: "linear-gradient(90deg, rgba(11, 102, 35, 0.25) 42.82%, rgba(6, 74, 26, 0.25) 100%), radial-gradient(72.45% 72.45% at 50% 50%, rgba(1, 35, 5, 0) 0%, rgba(1, 35, 5, 0.25) 79.6%)",
    heroTitle: ["Nigeria's all-", "in-one gaming", "platform."],
    heroImagesFlush: true,
    footerBackground: "#FFFFFF",
    hero: [
      { src: `${IMAGES}/sportsdey/three-phones-1.png`, width: 561, height: 418, alt: "SportsDey home, sports and esports screens" },
    ],
    intro: [
      "SportsDey is a sports content and gaming platform designed to bring news, videos, betting tips, odds, and match predictions together in one experience. My focus was on creating a clear, engaging interface that helped users navigate sports content while maintaining a consistent visual identity across the product.",
    ],
    sections: [
      {
        heading: "Making sports content easier to discover and engage with",
        panelPadding: "px-6 pt-4 pb-0 sm:px-10 sm:pt-6 sm:pb-0",
        imageClassName: "w-full",
        paragraphs: [
          "SportsDey combines sports information and gaming-related content in one digital experience. Users can explore sports news, watch videos, review betting tips and odds, and discover match predictions.",
          "Because these content types serve different purposes, the design needed to balance information density with readability, navigation, and a visually engaging sports experience.",
        ],
        images: [
          { src: `${IMAGES}/sportsdey/five-phones.png`, width: 1072, height: 476, alt: "SportsDey match details, games, casino, wallet and promotions" },
        ],
      },
      {
        heading: "Keeping many destinations within reach",
        paragraphs: [
          "SportsDey serves users with different goals. Some want to read sports news, others want to follow a match, explore casino games, check their wallet, or discover promotions.",
          "Part of my design decision was the persistent navigation, which creates a stable foundation for a product with many features. Rather than requiring users to return to the homepage every time they want to change activities, the main destinations remain visible. I also improved information clarity by making live scores, match statistics, odds, transactions, and game information easier to find.",
          "The challenge was to bring these different activities together without making the interface feel fragmented or overwhelming.",
        ],
        images: [],
      },
    ],
    closing: [],
    footerImage: { src: `${IMAGES}/sportsdey/laptop-bottom.png`, width: 906, height: 536, alt: "SportsDey homepage on a laptop" },
  },
  {
    slug: "dp-logistics",
    title: "DP Logistics",
    category: "Logistics",
    role: "Product Designer",
    duration: "2 Months",
    summary:
      "A logistics management product concept that helps customers manage shipments, track deliveries and monitor logistics expenses.",
    heroBackground: "#1A3F8C",
    pictureBackground: "linear-gradient(90deg, #0E2557 0%, #1E50BD 100%)",
    heroTitle: ["Ship", "Smarter & Faster"],
    heroTitleFont: "plus-jakarta-sans",
    heroTitleSize: 64,
    heroSubtitle: [
      "Create shipments instantly, track deliveries in real time",
      "and access recent shipment updates all from one",
      "powerful dashboard.",
    ],
    heroPadding: "px-6 py-6 sm:px-12 sm:py-8",
    introAfterHero: true,
    hero: [
      { src: `${IMAGES}/dp-logistics/three-phones-top.png`, width: 525, height: 404, alt: "DP Logistics tracking, home and barcode scan screens" },
    ],
    intro: [
      "DP Logistics is a logistics management product concept focused on simplifying how customers manage shipments, track deliveries, monitor logistics expenses, and receive important delivery updates.",
      "DP Logistics is a mobile application I designed to bring essential logistics activities into one mobile experience, allowing users to access shipment information, follow delivery progress, review transactions, and retrieve shipment details through barcode scanning.",
      "My responsibility was to translate the product requirements into a clear, intuitive interface that could support the shipment journey from initial management through delivery tracking and payment-related activities. I also translated the product structure into high-fidelity mobile screens, using a consistent visual system built around blue tones, white surfaces, clear typography, and recognisable status indicators.",
    ],
    sections: [
      {
        heading: "Creating or booking shipments made easy and instant",
        pictureBackground: "linear-gradient(90deg, rgba(14, 37, 87, 0.2) 0%, rgba(30, 80, 189, 0.2) 100%)",
        panelPadding: "px-6 py-3 sm:px-10 sm:py-4",
        imageClassName: "w-full",
        paragraphs: [
          "Managing deliveries can become frustrating when shipment information, tracking updates, payment records, and delivery communications are spread across different channels or require manual follow-up.",
          "Users need to know where their packages are, whether a delivery is delayed, what actions are required, and how much they have spent on logistics services. Without a well-structured digital experience, these activities can add friction to the delivery journey and make it harder for customers to stay informed.",
        ],
        images: [
          { src: `${IMAGES}/dp-logistics/four-phones-1.png`, width: 887, height: 465, alt: "Booking a shipment: pickup, sender, receiver and item details" },
        ],
      },
      {
        heading: "Managing and tracking deliveries",
        pictureBackground: "linear-gradient(90deg, rgba(14, 37, 87, 0.2) 0%, rgba(30, 80, 189, 0.2) 100%)",
        panelPadding: "px-6 py-3 sm:px-10 sm:py-4",
        imageClassName: "w-full",
        paragraphs: [
          "The design established a structured mobile experience for core logistics activities, connecting shipment management, tracking, payments, scanning, and notifications within one interface.",
          "My focus was on structuring the product around users' everyday needs, creating clear and consistent interfaces, and communicating the intended functionality to the development team.",
        ],
        images: [
          { src: `${IMAGES}/dp-logistics/four-phones-2.png`, width: 927, height: 468, alt: "Shipments, shipment details, wallet and notifications" },
        ],
      },
    ],
    closing: [],
  },
  {
    slug: "deltaline-transport",
    title: "DeltaLine Transport",
    category: "Transport Service",
    role: "Product Designer",
    duration: "4 Months",
    summary:
      "A multi-platform transport and logistics system that connects passengers, transport partners, drivers and operations teams.",
    heroBackground: "#1D4A7A",
    pictureBackground: "linear-gradient(241.96deg, #022741 11.81%, #0564A7 113.31%)",
    heroTitle: ["Book your", "journey across", "Nigeria"],
    heroTitleFont: "plus-jakarta-sans",
    heroTitleSize: 64,
    hero: [
      { src: `${IMAGES}/delta-line/laptop-behind-phone.png`, width: 592, height: 351, alt: "DeltaLine dashboard on a laptop" },
    ],
    intro: [
      "DeltaLine is a multi-platform transportation and logistics management system designed to connect passengers, transport partners, drivers, and internal operations teams through a unified digital ecosystem.",
      "DeltaLine Transport is a transportation management platform designed to support the different people and operational activities involved in providing intercity transportation services.",
      "The product brings together four connected experiences: a customer-facing mobile application for booking and managing trips, a partner application for managing transport business activities, a driver application for accessing assigned trips and vehicle information, and an administrative back office for monitoring and coordinating operations.",
    ],
    sections: [
      {
        heading: "Understanding the users",
        pictureBackground: "linear-gradient(241.96deg, rgba(2, 39, 65, 0.15) 11.81%, rgba(5, 100, 167, 0.15) 113.31%)",
        paragraphs: [
          "The goal was to design a connected transportation platform that could support customers and the teams responsible for delivering the service.",
          "The structured screens and user flows gave the development team a reference for understanding the intended functionality across the different product areas.",
        ],
        images: [
          {
            src: `${IMAGES}/delta-line/customer-app-experience.png`,
            width: 510,
            height: 325,
            alt: "Customer app screens",
            frame: { aspect: 2, left: "32%", top: "0%", width: "36%" },
          },
          {
            src: `${IMAGES}/delta-line/Partner-App-experience.png`,
            width: 515,
            height: 334,
            alt: "Partner app screens",
            overlay: { left: "0%", top: "48%", width: "40%" },
          },
          {
            src: `${IMAGES}/delta-line/driver-app-experience.png`,
            width: 515,
            height: 334,
            alt: "Driver app screens",
            overlay: { left: "60%", top: "48%", width: "40%" },
          },
        ],
      },
      {
        heading: "Designing across the whole service",
        pictureBackground: "linear-gradient(241.96deg, rgba(2, 39, 65, 0.15) 11.81%, rgba(5, 100, 167, 0.15) 113.31%)",
        panelPadding: "px-6 py-3 sm:px-10 sm:py-4",
        imageClassName: "w-full",
        paragraphs: [
          "DeltaLine reinforced the importance of designing around the wider service rather than individual screens.",
          "The project also strengthened my approach to information architecture and interface consistency across multiple platforms.",
          "For customer-facing screens, clarity and accessibility are essential to helping users complete travel-related tasks. For administrative screens, consistent data structures and clear navigation are critical to supporting efficient record management.",
          "Most importantly, the project demonstrated the value of translating complex product requirements into distinct user experiences that remain visually and functionally connected.",
        ],
        images: [
          { src: `${IMAGES}/delta-line/administrative-back-office.png`, width: 1100, height: 224, alt: "Administrative back office screens" },
        ],
      },
    ],
    closing: [],
  },
  {
    slug: "office-one-ai",
    title: "Office One AI",
    category: "AI/SaaS",
    role: "Product Designer",
    duration: "2 Months",
    summary:
      "An AI-powered workplace platform where teams collaborate with specialised AI employees and manage AI-assisted tasks in a shared workspace.",
    heroBackground: "#3E4A3A",
    pictureBackground:
      "linear-gradient(1.43deg, rgba(89, 106, 76, 0.4) 21.79%, rgba(40, 48, 34, 0.5) 76.24%, rgba(31, 37, 27, 0.5) 98.78%)",
    wideImages: true,
    heroTopTitle: ["Your AI Assistant for", "Smarter Workspace"],
    hero: [
      { src: `${IMAGES}/office-one-ai/six-phones-top.png`, width: 1022, height: 394, alt: "Office One AI onboarding, sign-up and workspace setup screens" },
    ],
    intro: [
      "Office One AI is an AI-powered workplace platform designed to help teams collaborate with specialised AI employees, organise their work, and manage AI-assisted tasks within a shared workspace.",
    ],
    sections: [
      {
        heading: "Introducing a new AI workplace concept",
        paragraphs: [
          "The concept introduces AI employees that represent different workplace functions, including Product Management, Data Analysis, Writing, and HR and Marketing. Rather than interacting with a single general-purpose assistant, users can access specialised AI employees based on the type of work they need to accomplish.",
          "The central design challenge was to make an AI-powered workplace feel approachable and organised while supporting multiple AI employees, different work activities, and workspace-level configuration. I used the onboarding screen to introduce the central concept, followed by a dashboard that makes the AI employees and common actions visible.",
        ],
        images: [
          { src: `${IMAGES}/office-one-ai/four-phones.png`, width: 769, height: 420, alt: "Office One AI dashboard, AI employees, conversations and chat" },
        ],
      },
      {
        heading: "Creating a workspace",
        paragraphs: [
          "The dashboard, AI employee directory, conversations, and settings use consistent bottom navigation. The chat interface uses a dedicated conversation layout, while workspace setup uses focused screens with clear back navigation and next-step actions. Consistent cards and role identities make specialised AI employees easier to discover and access.",
          "The screens show the option to create or join a workspace, an initial workspace setup form, a workspace name and AI employee selection step, and a configuration screen for visibility and membership. Workspace creation involves several related decisions, so a structured sequence helps users understand the process and gives each decision the attention it requires.",
        ],
        images: [
          { src: `${IMAGES}/office-one-ai/five-phones.png`, width: 841, height: 377, alt: "Creating a workspace: setup, AI employee selection, visibility and success" },
        ],
      },
    ],
    closing: [
      "The focus was on maintaining consistency between screens, keeping actions clear, and making sure the workspace creation journey had a recognisable completion state. The project demonstrates my approach to product design: breaking down a complex product concept, structuring its information and user journeys, and translating those requirements into a coherent, reusable interface system.",
    ],
  },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
