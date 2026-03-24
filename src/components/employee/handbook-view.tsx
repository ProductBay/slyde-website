"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import type { HandbookBlock, HandbookDocument } from "@/server/employee-hub/handbook";
import { cn } from "@/lib/utils";

const presetQueries = [
  "operations",
  "escalation",
  "notifications",
  "login",
  "onboarding",
  "daily checklist",
  "system health",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(content: string, query: string) {
  const normalized = query.trim();
  if (!normalized) return 0;
  const matches = content.match(new RegExp(escapeRegExp(normalized), "ig"));
  return matches?.length ?? 0;
}

function highlightText(content: string, query: string, hitCursor: { value: number }, activeMatchIndex: number): ReactNode {
  const normalized = query.trim();
  if (!normalized) return content;

  const regex = new RegExp(`(${escapeRegExp(normalized)})`, "ig");
  const parts = content.split(regex);

  return parts.map((part, index) => {
    const isMatch = index % 2 === 1;
    if (!isMatch) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    const matchIndex = hitCursor.value;
    hitCursor.value += 1;
    return (
      <mark
        key={`${part}-${index}`}
        data-handbook-hit={matchIndex}
        className={cn(
          "rounded-md px-1 text-slate-950 transition",
          matchIndex === activeMatchIndex ? "bg-cyan-300 ring-2 ring-cyan-500/40" : "bg-amber-200/80",
        )}
      >
        {part}
      </mark>
    );
  });
}

function blockMatches(block: HandbookBlock, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  if (block.type === "subheading") return block.content.toLowerCase().includes(normalized);
  if (block.type === "paragraph") return block.content.toLowerCase().includes(normalized);
  return block.items.some((item) => item.toLowerCase().includes(normalized));
}

export function HandbookView({ handbook }: { handbook: HandbookDocument }) {
  const [query, setQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const visibleSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return handbook.sections.map((section) => ({ ...section, matchedBlocks: section.blocks, matches: true }));
    }

    return handbook.sections
      .map((section) => {
        const titleMatches = section.title.toLowerCase().includes(normalized);
        const matchedBlocks = section.blocks.filter((block) => blockMatches(block, normalized));
        return {
          ...section,
          matchedBlocks: titleMatches ? section.blocks : matchedBlocks,
          matches: titleMatches || matchedBlocks.length > 0,
        };
      })
      .filter((section) => section.matches);
  }, [handbook.sections, query]);

  const totalMatches = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return 0;

    return visibleSections.reduce((sum, section) => {
      const titleCount = countMatches(section.title, normalized);
      const blockCount = section.matchedBlocks.reduce((blockSum, block) => {
        if (block.type === "subheading") return blockSum + countMatches(block.content, normalized);
        if (block.type === "paragraph") return blockSum + countMatches(block.content, normalized);
        return blockSum + block.items.reduce((itemSum, item) => itemSum + countMatches(item, normalized), 0);
      }, 0);
      return sum + titleCount + blockCount;
    }, 0);
  }, [query, visibleSections]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [query]);

  useEffect(() => {
    if (!query.trim() || totalMatches === 0) return;
    if (activeMatchIndex >= totalMatches) {
      setActiveMatchIndex(0);
      return;
    }

    const activeNode = contentRef.current?.querySelector<HTMLElement>(`[data-handbook-hit="${activeMatchIndex}"]`);
    activeNode?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeMatchIndex, query, totalMatches]);

  function moveToMatch(direction: 1 | -1) {
    if (totalMatches === 0) return;
    setActiveMatchIndex((current) => {
      const next = current + direction;
      if (next < 0) return totalMatches - 1;
      if (next >= totalMatches) return 0;
      return next;
    });
  }

  const renderHitCursor = { value: 0 };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div ref={contentRef} className="space-y-6">
        <section className="employee-hero-panel overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="employee-hero-orb left-[-8%] top-[-14%] h-44 w-44" />
          <div className="employee-hero-orb bottom-[-18%] right-[-6%] h-52 w-52" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Digital handbook
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">{handbook.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200">{handbook.summary}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {handbook.metadata.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-white/8 p-4 backdrop-blur sm:rounded-[1.4rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="employee-paper p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Search handbook</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Search inside the handbook by workflow, system area, or policy term. Matches are highlighted directly in the content below.
              </p>
            </div>
            <label className="admin-search-shell min-w-0 lg:min-w-[360px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="admin-search-input"
                placeholder="Search escalation, onboarding, login, health..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                list="employee-handbook-search"
              />
              <datalist id="employee-handbook-search">
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
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {query.trim() ? `${visibleSections.length} matching section${visibleSections.length === 1 ? "" : "s"}` : `${handbook.sections.length} total sections`}
            </p>
            {query.trim() ? (
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <span className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 sm:rounded-full sm:text-xs sm:tracking-[0.18em]">
                  {totalMatches === 0 ? "0 matches" : `${activeMatchIndex + 1} of ${totalMatches}`}
                </span>
                <button
                  type="button"
                  onClick={() => moveToMatch(-1)}
                  disabled={totalMatches === 0}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full"
                  aria-label="Previous match"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveToMatch(1)}
                  disabled={totalMatches === 0}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full"
                  aria-label="Next match"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="employee-paper divide-y divide-slate-200/80 overflow-hidden">
          {visibleSections.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-24 px-6 py-8 sm:px-8 lg:px-10">
              <div className="max-w-reading">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                  {highlightText(section.title, query, renderHitCursor, activeMatchIndex)}
                </h2>
                <div className="mt-5 space-y-5 text-[15px] leading-7 text-slate-700">
                  {section.matchedBlocks.map((block, index) => {
                    if (block.type === "subheading") {
                      return (
                        <h3 key={`${section.id}-sub-${index}`} className="pt-2 text-base font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {highlightText(block.content, query, renderHitCursor, activeMatchIndex)}
                        </h3>
                      );
                    }

                    if (block.type === "list") {
                      const ListTag = block.ordered ? "ol" : "ul";
                      return (
                        <ListTag
                          key={`${section.id}-list-${index}`}
                          className={block.ordered ? "space-y-2 pl-5 marker:font-semibold" : "space-y-2 pl-5 marker:text-cyan-700"}
                        >
                          {block.items.map((item) => (
                            <li key={item}>{highlightText(item, query, renderHitCursor, activeMatchIndex)}</li>
                          ))}
                        </ListTag>
                      );
                    }

                    return <p key={`${section.id}-paragraph-${index}`}>{highlightText(block.content, query, renderHitCursor, activeMatchIndex)}</p>;
                  })}
                </div>
              </div>
            </article>
          ))}
          {visibleSections.length === 0 ? (
            <div className="px-6 py-8 text-sm leading-7 text-slate-600 sm:px-8 lg:px-10">
              No handbook sections matched that search. Try broader terms like `operations`, `login`, or `notifications`.
            </div>
          ) : null}
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <div className="handbook-rail-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Jump to section</p>
          <div className="mt-4 space-y-2">
            {visibleSections.map((section) => (
              <Link
                key={section.id}
                href={`/employee/portal/guides/employee-handbook#${section.id}`}
                className="block rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-slate-950"
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="handbook-rail-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Related employee pages</p>
          <div className="mt-4 space-y-3">
            <Link href="/employee/portal/announcements" className="block rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              Open manager updates
            </Link>
            <Link href="/employee/portal/pay" className="block rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-semibold text-slate-700">
              Review pay and payouts
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
