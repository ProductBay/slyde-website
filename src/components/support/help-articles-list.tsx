"use client";

import { useState } from "react";
import type { SupportKnowledgeArticle } from "@/types/backend/onboarding";

function formatInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code class='rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800'>$1</code>");
}

function renderContent(content: string) {
  const paragraphs = content.split("\n\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < paragraphs.length) {
    const para = paragraphs[i].trim();
    const lines = para.split("\n").filter(Boolean);

    const isBulletBlock = lines.every((l) => l.trimStart().startsWith("- "));
    const isNumberedBlock = lines.every((l) => /^\d+\./.test(l.trimStart()));

    if (isBulletBlock || isNumberedBlock) {
      nodes.push(
        <ul key={i} className="mt-3 space-y-2">
          {lines.map((line, li) => {
            const text = line.replace(/^[-\d]+\.?\s+/, "");
            return (
              <li key={li} className="flex min-w-0 gap-2.5 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span
                  className="min-w-0 break-words"
                  dangerouslySetInnerHTML={{ __html: formatInline(text) }}
                />
              </li>
            );
          })}
        </ul>,
      );
    } else {
      nodes.push(
        <p
          key={i}
          className="mt-3 break-words text-sm leading-7 text-slate-700"
          dangerouslySetInnerHTML={{ __html: formatInline(para) }}
        />,
      );
    }

    i++;
  }

  return nodes;
}

type Props = {
  articles: SupportKnowledgeArticle[];
};

export function HelpArticlesList({ articles }: Props) {
  const [selected, setSelected] = useState<SupportKnowledgeArticle | null>(null);

  return (
    <>
      <div className="mt-5 grid gap-3">
        {articles.length ? (
          articles.slice(0, 8).map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => setSelected(article)}
              className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
            >
              <p className="text-sm font-semibold text-slate-950">{article.title}</p>
              <p className="mt-1 text-sm text-slate-600">{article.summary || "Knowledge article"}</p>
            </button>
          ))
        ) : (
          <p className="rounded-[1.35rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
            Support knowledge articles have not been published yet.
          </p>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-x-0 bottom-0 flex flex-col sm:inset-0 sm:items-center sm:justify-center sm:p-6">
            <div
              className="flex w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-[1.75rem]"
              style={{ maxHeight: "90dvh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 justify-center pt-3 sm:hidden">
                <span className="h-1 w-10 rounded-full bg-slate-200" />
              </div>

              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 flex-1">
                  {selected.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="break-words text-base font-semibold leading-snug text-slate-950 sm:text-lg">
                    {selected.title}
                  </h2>
                  {selected.summary && (
                    <p className="mt-1 break-words text-sm text-slate-500">{selected.summary}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                {renderContent(selected.content)}
              </div>

              <div
                className="flex shrink-0 items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6"
                style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
              >
                <p className="text-xs text-slate-400">
                  Need more help?{" "}
                  <a href="/support" className="text-sky-600 underline-offset-2 hover:underline">
                    Submit a request
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
