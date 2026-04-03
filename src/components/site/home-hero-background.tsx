import { MapPinned, Package, Sparkles, Truck, Waypoints } from "lucide-react";

const particles = [
  {
    Icon: Package,
    className:
      "left-[4%] top-[18%] h-14 w-14 rounded-[1.25rem] border border-sky-200/60 bg-white/70 text-sky-700 shadow-soft backdrop-blur",
    delay: "0s",
  },
  {
    Icon: Truck,
    className:
      "left-[46%] top-[10%] h-12 w-12 rounded-full border border-cyan-200/70 bg-cyan-50/80 text-cyan-700 shadow-soft backdrop-blur",
    delay: "1.4s",
  },
  {
    Icon: MapPinned,
    className:
      "left-[11%] bottom-[14%] h-12 w-12 rounded-full border border-slate-200/80 bg-white/75 text-slate-700 shadow-soft backdrop-blur",
    delay: "2.2s",
  },
  {
    Icon: Waypoints,
    className:
      "right-[36%] bottom-[18%] h-11 w-11 rounded-full border border-sky-200/70 bg-sky-50/80 text-sky-700 shadow-soft backdrop-blur",
    delay: "0.8s",
  },
  {
    Icon: Sparkles,
    className:
      "right-[7%] top-[16%] h-10 w-10 rounded-full border border-slate-200/70 bg-white/80 text-slate-500 shadow-soft backdrop-blur",
    delay: "1.9s",
  },
];

export function HomeHeroBackground() {
  return (
    <>
      <div className="absolute inset-x-[22%] top-0 h-28 bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_68%)] blur-3xl" />
      <div className="absolute left-[-4%] top-[26%] h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />
      <div className="absolute right-[-4%] bottom-[10%] h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-50" />

      <div className="absolute left-[18%] top-[28%] h-px w-[18%] bg-gradient-to-r from-sky-200/0 via-sky-300/70 to-sky-200/0" />
      <div className="absolute right-[16%] top-[44%] h-px w-[16%] bg-gradient-to-r from-cyan-200/0 via-cyan-300/70 to-cyan-200/0" />
      <div className="absolute left-[30%] bottom-[20%] h-px w-[14%] bg-gradient-to-r from-slate-200/0 via-slate-300/70 to-slate-200/0" />

      {particles.map(({ Icon, className, delay }, index) => (
        <span
          key={`${index}-${delay}`}
          className={`floating-orb absolute hidden items-center justify-center md:inline-flex ${className}`}
          style={{ animationDelay: delay }}
        >
          <Icon className="h-5 w-5" />
        </span>
      ))}
    </>
  );
}
