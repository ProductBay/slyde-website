import {
  BadgeCheck,
  Bike,
  Building2,
  Cable,
  CarFront,
  Map,
  PackageCheck,
  Radar,
  ShieldCheck,
  Store,
  Truck,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CtaLink, FaqCategory, InfoCard, NavItem, TimelineStep, ZoneStatusKey, ZoneStatusMessage } from "@/types/site";

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/become-a-slyder", label: "Become a Slyder" },
  { href: "/for-businesses", label: "For Businesses" },
  { href: "/api-integrations", label: "API / Integrations" },
  { href: "/safety", label: "Safety" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const primaryCtas: CtaLink[] = [
  { href: "/become-a-slyder/apply", label: "Apply as a Slyder", variant: "primary" },
  { href: "/for-businesses", label: "Partner with SLYDE", variant: "secondary" },
];

export const heroMetrics = [
  { value: "Jamaica-first", label: "Built for Jamaica first. Designed to scale across the Caribbean." },
  { value: "Region by region", label: "Launch readiness is tracked town by town and parish by parish." },
  { value: "First-wave ready", label: "Early approved Slyders are best positioned as their area approaches launch." },
];

export const trustStrip: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Real-time delivery tracking", description: "Operational visibility from order creation to handoff.", icon: Radar },
  { title: "Verified Slyders", description: "Independent couriers move through structured review, approval, and readiness checks.", icon: Truck },
  { title: "Smart dispatch workflows", description: "SLYDE is built around reliable delivery coordination from day one.", icon: Store },
  { title: "Structured onboarding", description: "Applications, setup, and readiness are handled through a clear launch-stage process.", icon: Map },
  { title: "Proof and accountability", description: "Delivery lifecycle controls support safer, more reliable operations.", icon: PackageCheck },
  { title: "Caribbean-scale ambition", description: "Built for Jamaica first, with the standards to expand region by region.", icon: Cable },
];

export const homeSolutions: Array<InfoCard & { icon: LucideIcon }> = [
  {
    eyebrow: "For Slyders",
    title: "Independent couriers with a more structured path into delivery work",
    description: "SLYDE gives future Slyders a clear route from application to approval, app access, setup, and launch readiness.",
    icon: UserRoundCheck,
  },
  {
    eyebrow: "For Merchants",
    title: "Modern delivery support without building your own fleet",
    description: "Prepare your business for launch-ready delivery operations backed by structured courier onboarding and dispatch.",
    icon: Building2,
  },
  {
    eyebrow: "For Platforms",
    title: "A logistics orchestration layer for future integrations",
    description: "Create deliveries, track milestones, and connect delivery events into your commerce or operations stack.",
    icon: Workflow,
  },
  {
    eyebrow: "For Enterprise",
    title: "A launch-stage network designed to scale with Caribbean commerce",
    description: "Build localized logistics strength in Jamaica now and expand with a more repeatable operating model later.",
    icon: ShieldCheck,
  },
];

export const howSlydeWorks: TimelineStep[] = [
  { title: "Order created", description: "A business, operator, or future integrated platform creates a delivery request." },
  { title: "SLYDE dispatches", description: "SLYDE routes the job through a structured workflow based on area readiness and courier availability." },
  { title: "Slyder accepts", description: "A verified and ready Slyder accepts within the operating process for that zone." },
  { title: "Pickup completed", description: "Pickup is confirmed through a controlled delivery lifecycle." },
  { title: "Live tracking", description: "Stakeholders follow the delivery with clearer visibility from pickup to drop-off." },
  { title: "Delivery confirmed", description: "Confirmation closes the order with stronger reliability and accountability." },
];

export const lifecycleTimeline: TimelineStep[] = [
  { title: "Apply online", description: "Submit your details, documents, preferences, and readiness information through the website." },
  { title: "Confirmation sent", description: "SLYDE confirms your application by WhatsApp and email so you know it was received." },
  { title: "Application review", description: "The SLYDE team reviews your profile, documents, vehicle details, and area fit." },
  { title: "Approval and app access", description: "If approved, you receive access to the SLYDE app and onboarding guidance." },
  { title: "Setup and readiness", description: "Complete your setup, confirm readiness, and stay prepared as your area approaches launch." },
  { title: "Area launch and eligibility", description: "You become best positioned to work when your zone is live and your readiness requirements are complete." },
];

export const slyderTypes = [
  { title: "Bicycle riders", icon: Bike, description: "Well suited to short-distance urban movement as SLYDE builds out delivery density." },
  { title: "Motorcyclists", icon: Radar, description: "Strong fit for fast point-to-point coverage in early launch zones." },
  { title: "Car drivers", icon: CarFront, description: "Useful for more flexible retail, pharmacy, and general delivery coverage." },
  { title: "Van and fleet support", icon: Truck, description: "Important for larger or more operationally demanding deliveries as the network grows." },
];

export const coverageCards: InfoCard[] = [
  {
    eyebrow: "Launching soon",
    title: "Kingston - 92% ready",
    description: "One of the strongest early launch areas, with Slyder onboarding moving toward final readiness.",
  },
  {
    eyebrow: "Building network",
    title: "Mandeville - we need more Slyders",
    description: "This area is in network-building phase, and early applicants help move it closer to launch.",
  },
  {
    eyebrow: "Final onboarding phase",
    title: "Montego Bay - near ready",
    description: "Courier strength is growing and the area is moving closer to launch readiness.",
  },
];

export const launchZoneCards: Array<InfoCard & { status: string }> = [
  {
    eyebrow: "Launching Soon",
    title: "Kingston",
    description: "92% Ready. One of the strongest first-wave areas as SLYDE launches across Jamaica.",
    status: "92% Ready",
  },
  {
    eyebrow: "Building Network",
    title: "Mandeville",
    description: "We need more Slyders. Joining now helps bring your area closer to launch.",
    status: "Building Network",
  },
  {
    eyebrow: "Near Ready",
    title: "Montego Bay",
    description: "Final onboarding phase. Early approved Slyders will be well positioned as launch approaches.",
    status: "Near Ready",
  },
];

export const faqPreview = [
  {
    question: "What happens after I submit a Slyder application?",
    answer: "You will receive a WhatsApp confirmation and an email, then your application moves into review, approval, app access, setup, and readiness before work eligibility begins.",
  },
  {
    question: "When can I start working?",
    answer: "SLYDE launches region by region, so start timing depends on your area's readiness. Joining early still puts you in the best position when your zone goes live.",
  },
  {
    question: "Why does area readiness matter?",
    answer: "SLYDE tracks network strength by town and parish so each launch area has enough approved and ready Slyders to support reliable service from day one.",
  },
];

export const faqs: FaqCategory[] = [
  {
    title: "General",
    items: [
      {
        question: "What is SLYDE?",
        answer: "SLYDE is a logistics network and delivery orchestration platform built for Jamaica first, with future Caribbean expansion in mind. It supports public delivery demand, merchant fulfillment, courier operations, and partner integrations.",
      },
      {
        question: "Is SLYDE only a delivery app?",
        answer: "No. SLYDE is positioned as infrastructure: a dispatch and fulfillment layer, a courier network, and an API-ready platform for merchants and partners.",
      },
    ],
  },
  {
    title: "Slyders",
    items: [
      {
        question: "How does Slyder approval work?",
        answer: "You apply on the website, operations reviews your information and documents, approved applicants are converted into real Slyder accounts, and activation instructions are sent before app login and readiness completion.",
      },
      {
        question: "Can I work immediately after applying?",
        answer: "No. SLYDE launches region by region. Applying starts the review process, but work begins only after approval, app access, setup completion, readiness checks, and your area reaching launch readiness.",
      },
    ],
  },
  {
    title: "Businesses",
    items: [
      {
        question: "Who should partner with SLYDE?",
        answer: "Retailers, restaurants, pharmacies, marketplaces, service operators, and enterprise teams that need reliable local fulfillment without building an internal fleet.",
      },
      {
        question: "Can SLYDE support branded business operations?",
        answer: "Yes. The platform is positioned to support managed delivery workflows, proof of delivery, customer visibility, and future integration-driven operations.",
      },
    ],
  },
  {
    title: "API / Integrations",
    items: [
      {
        question: "What API capabilities does SLYDE plan to support?",
        answer: "Delivery creation, quoting, courier assignment workflows, live tracking, delivery events, proof of delivery data, and webhook-style lifecycle updates.",
      },
      {
        question: "Is the website already integrated with production APIs?",
        answer: "The site is structured for the public endpoints needed for applications and inquiries today, and the messaging is aligned with future integration endpoints for deeper partner use cases.",
      },
    ],
  },
];

export const safetyPillars: Array<InfoCard & { icon: LucideIcon }> = [
  {
    eyebrow: "Verification",
    title: "Identity and document checks before activation",
    description: "Applicants move through review and verification before a Slyder account is activated.",
    icon: BadgeCheck,
  },
  {
    eyebrow: "Readiness",
    title: "Operational readiness before dispatch eligibility",
    description: "Setup, equipment, and compliance checks reduce operational gaps before a courier starts working.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Lifecycle control",
    title: "Tracked delivery progression with proof controls",
    description: "Merchants and customers benefit from monitored status events and delivery confirmation workflows.",
    icon: Workflow,
  },
];

export const zoneStatusMessages: Record<ZoneStatusKey, ZoneStatusMessage> = {
  not_ready: {
    headline: "We're building in your area",
    body: "Your area is currently in the network-building phase. Joining now helps us build toward launch and puts you in position early.",
  },
  building: {
    headline: "Your area is building toward launch",
    body: "We are actively onboarding Slyders in your area. As more approved and ready Slyders join, your zone moves closer to launch.",
  },
  near_ready: {
    headline: "Your area is nearing launch readiness",
    body: "Your area is approaching launch threshold. Early approved Slyders will be well positioned when deliveries begin.",
  },
  ready: {
    headline: "Your area is launch-ready",
    body: "Your area has reached readiness and is in final preparation. Complete your setup and stay ready for activation.",
  },
  live: {
    headline: "SLYDE is live in your area",
    body: "Your area is now active. Eligible Slyders can begin receiving delivery opportunities through the SLYDE network.",
  },
};
