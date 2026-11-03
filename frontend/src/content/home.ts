// Homepage copy. Facts come from the requirements document (see site.ts); photos are Pexels stock (credits in README).

export type HeroSlide = {
  title: string;
  accent: string;
  text: string;
  image: { src: string; alt: string };
};

export const heroSlides: HeroSlide[] = [
  {
    title: "Ideas to innovation,",
    accent: "engineered to perform.",
    text: "An AI-driven technology partner that turns business challenges into intelligent, scalable software powered by specialists.",
    image: { src: "/images/hero/engineering-team.webp", alt: "Software engineers working together at computers in a modern office" },
  },
  {
    title: "Software built",
    accent: "to keep up with you.",
    text: "Custom applications, APIs and integrations designed around how your business works, and ready for how it will change.",
    image: { src: "/images/hero/software-code.webp", alt: "Close-up of programming code on a computer monitor" },
  },
  {
    title: "Cloud and data",
    accent: "you can rely on.",
    text: "Azure DevOps pipelines, database administration and ongoing support that keep critical systems running.",
    image: { src: "/images/hero/cloud-infrastructure.webp", alt: "Server unit lit in blue inside a data centre" },
  },
  {
    title: "110+ specialists.",
    accent: "One delivery team.",
    text: "Engineers, analysts, testers and project managers across the UK and India, working as an extension of yours.",
    image: { src: "/images/hero/team-collaboration.webp", alt: "Colleagues reviewing plans together at a whiteboard" },
  },
];

export const about = {
  greeting: "Hello, we're Kiaratech.",
  paragraphs: [
    "Founded in India in 2022, with a UK presence since 2025, Kiaratech Solutions is an AI-driven technology partner for mid-market and enterprise organisations.",
    "Our specialists across software, cloud, data and quality engineering turn ambitious ideas into secure, intelligent and scalable digital solutions that create measurable value, for clients across the UK, Europe, North America and beyond.",
  ],
  figures: [
    { value: "110+", label: "Professionals" },
    { value: "30+", label: "Projects" },
    { value: "12+", label: "Clients" },
  ],
  image: { src: "/images/about/greeting.webp", alt: "Smiling professional in a red shirt holding an open laptop" },
} as const;
