"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type SearchableGuide = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  href: string;
  searchTerms: string[];
};

const presetQueries = [
  "handbook",
  "logistics",
  "manager updates",
  "paycheck",
  "payout",
  "operations",
  "policy",
];

export function GuideSearchPanel({ guides }: { guides: SearchableGuide[] }) {
  const [query, setQuery] = useState("");

  const filteredGuides = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return guides;

    return guides.filter((guide) =>
      [guide.title, guide.summary, guide.category, ...guide.searchTerms].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [guides, query]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Guides</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Assigned employee guides and handbook resources</h1>
      </div>

      <div className="employee-paper p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Guide search</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Search by topic, process, or common employee need. Quick-fill terms below preload frequent searches for faster access.
            </p>
          </div>
          <label className="admin-search-shell min-w-0 lg:min-w-[360px]">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="admin-search-input"
              placeholder="Search handbook, paycheck, logistics, updates..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              list="employee-guide-presets"
            />
            <datalist id="employee-guide-presets">
              {presetQueries.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presetQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 sm:text-xs sm:tracking-[0.18em]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredGuides.map((guide) => (
          <Link key={guide.slug} href={guide.href} className="employee-paper p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{guide.category}</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{guide.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{guide.summary}</p>
          </Link>
        ))}
      </div>

      {filteredGuides.length === 0 ? (
        <div className="employee-paper p-6 text-sm leading-7 text-slate-600">
          No guides matched that search. Try a broader term like `handbook`, `operations`, or `paycheck`.
        </div>
      ) : null}
    </div>
  );
}
