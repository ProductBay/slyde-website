import { MapPinned, Package, Sparkles, Truck, Waypoints } from "lucide-react";

const ambientParticles = [
  {
    Icon: Package,
    className: "left-[-3%] top-[10%] h-12 w-12 text-sky-300/18",
    delay: "0s",
  },
  {
    Icon: Truck,
    className: "left-[6%] bottom-[8%] h-12 w-12 text-cyan-300/16",
    delay: "1.3s",
  },
  {
    Icon: MapPinned,
    className: "left-[18%] top-[2%] h-9 w-9 text-slate-300/18",
    delay: "2.1s",
  },
  {
    Icon: Waypoints,
    className: "left-[28%] bottom-[4%] h-10 w-10 text-sky-300/14",
    delay: "0.8s",
  },
  {
    Icon: Sparkles,
    className: "left-[40%] top-[4%] h-8 w-8 text-cyan-300/18",
    delay: "1.8s",
  },
  {
    Icon: Package,
    className: "right-[23%] top-[8%] h-10 w-10 text-sky-300/16",
    delay: "0.5s",
  },
  {
    Icon: Truck,
    className: "right-[13%] bottom-[10%] h-11 w-11 text-cyan-300/16",
    delay: "2.6s",
  },
  {
    Icon: MapPinned,
    className: "right-[4%] top-[16%] h-10 w-10 text-slate-300/20",
    delay: "2.1s",
  },
  {
    Icon: Waypoints,
    className: "right-[-2%] bottom-[22%] h-10 w-10 text-sky-300/14",
    delay: "1.1s",
  },
];

export function HomeHeroAmbientParticles() {
  return (
    <>
      <div className="absolute left-[-10%] top-[4%] h-64 w-64 rounded-full bg-sky-200/10 blur-3xl" />
      <div className="absolute left-[18%] top-[0%] h-40 w-40 rounded-full bg-white/30 blur-3xl" />
      <div className="absolute right-[-10%] top-[16%] h-72 w-72 rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="absolute left-[24%] bottom-[4%] h-44 w-44 rounded-full bg-slate-200/10 blur-3xl" />
      <div className="absolute right-[22%] bottom-[2%] h-36 w-36 rounded-full bg-sky-100/20 blur-3xl" />
      <div className="absolute inset-x-[8%] top-[14%] h-px bg-gradient-to-r from-transparent via-sky-300/12 to-transparent" />
      <div className="absolute inset-x-[20%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-cyan-300/12 to-transparent" />

      {ambientParticles.map(({ Icon, className, delay }, index) => (
        <span
          key={`${index}-${delay}`}
          className={`floating-orb absolute hidden items-center justify-center md:inline-flex ${className}`}
          style={{ animationDelay: delay }}
        >
          <Icon className="h-full w-full" strokeWidth={1.6} />
        </span>
      ))}
    </>
  );
}
