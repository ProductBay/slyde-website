export type NavItem = {
  href: string;
  label: string;
};

export type CtaLink = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type InfoCard = {
  title: string;
  description: string;
  eyebrow?: string;
};

export type TimelineStep = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  title: string;
  items: FaqItem[];
};

export type ZoneStatusKey = "not_ready" | "building" | "near_ready" | "ready" | "live";

export type ZoneStatusMessage = {
  headline: string;
  body: string;
};
