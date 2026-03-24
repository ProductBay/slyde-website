import { readFile } from "node:fs/promises";
import path from "node:path";

export type HandbookBlock =
  | { type: "paragraph"; content: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "subheading"; content: string };

export type HandbookSection = {
  id: string;
  title: string;
  blocks: HandbookBlock[];
};

export type HandbookDocument = {
  title: string;
  summary: string;
  metadata: Array<{ label: string; value: string }>;
  sections: HandbookSection[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeInlineMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function flushParagraph(section: HandbookSection | null, paragraph: string[]) {
  if (!section || paragraph.length === 0) return;
  const content = normalizeInlineMarkdown(paragraph.join(" "));
  if (!content) return;
  section.blocks.push({ type: "paragraph", content });
  paragraph.length = 0;
}

function flushList(section: HandbookSection | null, list: { ordered: boolean; items: string[] } | null) {
  if (!section || !list || list.items.length === 0) return;
  section.blocks.push({
    type: "list",
    ordered: list.ordered,
    items: list.items.map((item) => normalizeInlineMarkdown(item)).filter(Boolean),
  });
}

export async function getEmployeeHandbook(): Promise<HandbookDocument> {
  const handbookPath = path.join(process.cwd(), "docs", "slyde-employee-operations-manual.md");
  const raw = await readFile(handbookPath, "utf8");
  const lines = raw.split(/\r?\n/);

  const metadata: Array<{ label: string; value: string }> = [];
  const sections: HandbookSection[] = [];
  let title = "Employee Operations Manual";
  let summary = "";
  let currentSection: HandbookSection | null = null;
  const paragraph: string[] = [];
  let currentList: { ordered: boolean; items: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed === "---" || trimmed.startsWith("<div")) {
      flushParagraph(currentSection, paragraph);
      flushList(currentSection, currentList);
      currentList = null;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      title = normalizeInlineMarkdown(trimmed.slice(2));
      continue;
    }

    const metadataMatch = trimmed.match(/^\*\*([^*]+):\*\*\s*(.+)$/);
    if (metadataMatch && sections.length === 0) {
      metadata.push({
        label: normalizeInlineMarkdown(metadataMatch[1]),
        value: normalizeInlineMarkdown(metadataMatch[2]),
      });
      continue;
    }

    if (!summary && !trimmed.startsWith("## ") && !trimmed.startsWith("### ") && !trimmed.startsWith("**Confidential")) {
      summary = normalizeInlineMarkdown(trimmed);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph(currentSection, paragraph);
      flushList(currentSection, currentList);
      currentList = null;
      currentSection = {
        id: slugify(normalizeInlineMarkdown(trimmed.slice(3))),
        title: normalizeInlineMarkdown(trimmed.slice(3)),
        blocks: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph(currentSection, paragraph);
      flushList(currentSection, currentList);
      currentList = null;
      currentSection?.blocks.push({ type: "subheading", content: normalizeInlineMarkdown(trimmed.slice(4)) });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph(currentSection, paragraph);
      if (!currentList || currentList.ordered) {
        flushList(currentSection, currentList);
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph(currentSection, paragraph);
      if (!currentList || !currentList.ordered) {
        flushList(currentSection, currentList);
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(orderedMatch[1]);
      continue;
    }

    flushList(currentSection, currentList);
    currentList = null;
    paragraph.push(trimmed);
  }

  flushParagraph(currentSection, paragraph);
  flushList(currentSection, currentList);

  return {
    title,
    summary,
    metadata,
    sections,
  };
}
