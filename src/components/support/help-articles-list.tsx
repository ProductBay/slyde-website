"use client";

import { useState } from "react";
import type { SupportKnowledgeArticle } from "@/types/backend/onboarding";

function renderContent(content: string) {
  return content.split("\n\n").map((paragraph, index) => {
    // Render list items
    if (paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("1.")) {
      const lines = paragraph.split("\n").filter(Boolean);
      return (
        <ul key={index} className="mt-3 space-y-1.5 pl-4">
          {lines.map((line, lineIndex) => {
            const text = line.replace(/^[-\d]+\.?\s+/, "");
            return (
              <li key={lineIndex} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <p
        key={index}
        className="mt-3 text-sm leading-7 text-slate-700"
        dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }}
      />
    );
  });
}

function formatInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code class='rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800'>$1</code>");
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
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
                <h2 className="text-lg font-semibold leading-snug text-slate-950">{selected.title}</h2>
                {selected.summary && (
                  <p className="mt-1 text-sm text-slate-500">{selected.summary}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5">
              {renderContent(selected.content)}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-400">
                Need more help?{" "}
                <a href="/support" className="text-sky-600 underline-offset-2 hover:underline">
                  Submit a support request
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
      )}
    </>
  );
}
