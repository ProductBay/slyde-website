import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

const groups = [
  {
    title: "Quick Links",
    links: [
      ["/", "Home"],
      ["/about", "About"],
      ["/coverage", "Coverage"],
      ["/safety", "Safety"],
      ["/faq", "FAQ"],
    ],
  },
  {
    title: "Business",
    links: [
      ["/for-businesses", "For Businesses"],
      ["/api-integrations", "API / Integrations"],
      ["/contact", "Partnership Contact"],
    ],
  },
  {
    title: "Slyders",
    links: [
      ["/become-a-slyder", "Become a Slyder"],
      ["/become-a-slyder/apply", "Apply"],
      ["/slyder-payouts", "Slyder Payouts"],
      ["/grow-your-area", "Area Builder Rewards"],
      ["/faq", "Applicant FAQ"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/contact", "Support"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-slate-950 text-white">
      <div className="mx-auto max-w-shell px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow-badge border-white/10 bg-white/5 text-sky-200">Jamaica-First Logistics Infrastructure</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white">
                SLYDE connects courier capacity, merchant fulfillment, and partner-ready logistics workflows.
              </h2>
            </div>
            <div className="text-sm leading-7 text-slate-300">
              Built for local operational credibility now, with standards that can support wider Caribbean scale later.
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-shell gap-10 px-4 py-2 sm:px-6 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] lg:px-8">
        <div className="space-y-5">
          <BrandMark inverted showTagline />
          <p className="max-w-sm text-sm leading-7 text-slate-300">
            SLYDE is a modern logistics network for Jamaica first, designed to support courier operations, merchant fulfillment, and future Caribbean partner integrations.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">{group.title}</h3>
            <div className="mt-4 space-y-3">
              {group.links.map(([href, label]) => (
                <Link key={href} href={href} className="block text-sm text-slate-300 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-shell flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:px-8">
          <p>&copy; 2026 SLYDE. Logistics infrastructure for modern commerce.</p>
          <p>SLYDE is a company of A&apos;Dash Technologies, the parent company and sister brand of GrabQuik.</p>
          <p>Developed by Ashandie Powell.</p>
          <p>Located in Southfield, St. Elizabeth, Jamaica.</p>
          <p>Phone: 8765947320</p>
          <p>Email: info@slyde.app</p>
          <p>
            Legal links:{" "}
            <Link href="/privacy" className="text-slate-300 transition hover:text-white">
              Privacy
            </Link>
            {" / "}
            <Link href="/terms" className="text-slate-300 transition hover:text-white">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
