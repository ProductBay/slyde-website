import crypto from "node:crypto";
import {
  createSupportKnowledgeArticle,
  findSupportKnowledgeArticleBySlug,
  listSupportKnowledgeArticles,
  updateSupportKnowledgeArticle,
} from "@/modules/support/repositories/support.repository";
import type { SupportKnowledgeArticle, SupportDomain } from "@/types/backend/onboarding";

function nowIso() {
  return new Date().toISOString();
}

export async function createDraftSupportKnowledgeArticle(input: {
  domain: SupportDomain;
  title: string;
  slug: string;
  content: string;
  audience?: string[];
  summary?: string;
  tags?: string[];
}) {
  const article: SupportKnowledgeArticle = {
    id: crypto.randomUUID(),
    domain: input.domain,
    audience: input.audience ?? [],
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    content: input.content,
    tags: input.tags ?? [],
    published: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return createSupportKnowledgeArticle(article);
}

export async function publishSupportKnowledgeArticle(slug: string) {
  const existing = await findSupportKnowledgeArticleBySlug(slug);
  if (!existing) throw new Error("Support knowledge article not found");
  return updateSupportKnowledgeArticle({
    ...existing,
    published: true,
    updatedAt: nowIso(),
  });
}

export async function listPublishedSupportKnowledgeArticles() {
  const articles = await listSupportKnowledgeArticles();
  return articles.filter((article) => article.published);
}

export async function findRelevantSupportKnowledgeArticles(input: {
  domain: SupportDomain;
  query: string;
  limit?: number;
}) {
  const normalizedQuery = input.query.toLowerCase();
  const terms = normalizedQuery.split(/\s+/).filter((term) => term.length >= 3);
  const articles = await listPublishedSupportKnowledgeArticles();

  const ranked = articles
    .filter((article) => article.domain === input.domain || article.domain === "public")
    .map((article) => {
      const haystack = [article.title, article.summary ?? "", article.content, ...(article.tags ?? [])].join(" ").toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, input.limit ?? 3)
    .map((entry) => entry.article);

  return ranked;
}
