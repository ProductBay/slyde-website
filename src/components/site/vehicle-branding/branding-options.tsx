import { Box, Car, CircleDot, HardHat, Truck, Warehouse } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const options = [
  { title: "Vehicle decals", icon: Car },
  { title: "Rear/window branding", icon: CircleDot },
  { title: "Bike box branding", icon: Box },
  { title: "Helmet branding", icon: HardHat },
  { title: "Partial wrap options later", icon: Truck },
  { title: "Fleet branding later", icon: Warehouse },
];

export function BrandingOptions() {
  return (
    <section id="branding-options" className="section-shell py-14">
      <SectionHeading
        eyebrow="Branding options"
        title="Start with practical branding, expand when the program is ready"
        description="This page captures interest so the team can guide Slyders toward available options by vehicle type and location."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(({ title, icon: Icon }) => (
          <div key={title} className="surface-card p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
