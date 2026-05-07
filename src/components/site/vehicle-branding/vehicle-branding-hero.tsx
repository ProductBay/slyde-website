import { BadgeCheck, Bike, CarFront, ShieldCheck } from "lucide-react";
import { HeroSection } from "@/components/site/hero-section";

export function VehicleBrandingHero() {
  return (
    <HeroSection
      eyebrow="Verified Slyder Program"
      title="SLYDE Verified Vehicle Branding"
      description="Make your vehicle stand out, build customer trust, and represent Jamaica's growing delivery network with professional SLYDE branding."
      supportText="For approved or eligible Slyders. Interest capture only, with next steps shared by WhatsApp."
      actions={[
        { href: "#branding-interest-form", label: "Request Branding Info" },
        { href: "/join/slyder", label: "Become a Slyder", variant: "secondary" },
      ]}
      aside={
        <div className="dark-panel p-6 sm:p-8">
          <div className="grid gap-3">
            {[
              { label: "Bike, car, van, truck, box, or helmet options", icon: CarFront },
              { label: "Professional presence for merchant and customer trust", icon: BadgeCheck },
              { label: "Built for eligible Slyders in good standing", icon: ShieldCheck },
              { label: "Simple WhatsApp follow-up after you submit interest", icon: Bike },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                <p className="text-sm leading-6 text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
