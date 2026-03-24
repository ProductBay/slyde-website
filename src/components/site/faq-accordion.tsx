"use client";

import { useDeferredValue, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { FaqCategory } from "@/types/site";
import { cn } from "@/lib/utils";

export function FAQAccordion({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        if (!deferredQuery) return true;
        return (
          item.question.toLowerCase().includes(deferredQuery) ||
          item.answer.toLowerCase().includes(deferredQuery)
        );
      }),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="space-y-8">
      <label className="surface-card flex items-center gap-3 px-4 py-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Search SLYDE FAQs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {filteredCategories.map((category) => (
        <section key={category.title} className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-950">{category.title}</h3>
          <div className="space-y-3">
            {category.items.map((item) => (
              <details key={item.question} className="surface-card group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-left text-base font-semibold text-slate-950">{item.question}</span>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180")} />
                </summary>
                <p className="mt-4 max-w-reading text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      {filteredCategories.length === 0 ? (
        <div className="surface-card p-6 text-sm text-slate-600">No FAQ results match your search yet.</div>
      ) : null}
    </div>
  );
}
