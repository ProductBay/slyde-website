import Image from "next/image";
import { BadgeCheck } from "lucide-react";

/**
 * Full-width showcase strip displayed near the top of the Vehicle Branding page.
 * Replace /images/vehicle-branding-showcase.jpg with the real asset once provided.
 */
export function VehicleShowcaseBanner() {
  return (
    <section className="w-full overflow-hidden bg-slate-950">
      {/* Image strip */}
      <div className="relative w-full" style={{ aspectRatio: "3 / 1", minHeight: 220 }}>
        <Image
          src="/images/vehicle-branding-showcase.jpg"
          alt="SLYDE branded delivery vehicles — bikes, cars, and vans showing professional SLYDE livery"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark gradient overlay so the caption is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Bottom caption bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-4 sm:px-8 sm:py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10">
            <BadgeCheck className="h-4 w-4 text-cyan-200" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 sm:text-[0.7rem]">
            SLYDE Verified Vehicle Branding — Real examples from our Slyder network
          </p>
        </div>
      </div>
    </section>
  );
}
