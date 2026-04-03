import { getPersistenceRepository } from "@/server/persistence";
import type {
  SupportContextSnapshot,
  SupportConversation,
  SupportEvent,
  SupportHandoff,
  SupportKnowledgeArticle,
  SupportMessage,
} from "@/types/backend/onboarding";

export function createSupportConversation(conversation: SupportConversation) {
  return getPersistenceRepository().createSupportConversation(conversation);
}

export function updateSupportConversation(conversation: SupportConversation) {
  return getPersistenceRepository().updateSupportConversation(conversation);
}

export function findSupportConversationById(id: string) {
  return getPersistenceRepository().findSupportConversationById(id);
}

export function listSupportConversations() {
  return getPersistenceRepository().listSupportConversations();
}

export function createSupportMessage(message: SupportMessage) {
  return getPersistenceRepository().createSupportMessage(message);
}

export function listSupportMessagesByConversationId(conversationId: string) {
  return getPersistenceRepository().listSupportMessagesByConversationId(conversationId);
}

export function createSupportContextSnapshot(snapshot: SupportContextSnapshot) {
  return getPersistenceRepository().createSupportContextSnapshot(snapshot);
}

export function listSupportContextSnapshotsByConversationId(conversationId: string) {
  return getPersistenceRepository().listSupportContextSnapshotsByConversationId(conversationId);
}

export function createSupportHandoff(handoff: SupportHandoff) {
  return getPersistenceRepository().createSupportHandoff(handoff);
}

export function listSupportHandoffsByConversationId(conversationId: string) {
  return getPersistenceRepository().listSupportHandoffsByConversationId(conversationId);
}

export function createSupportEvent(event: SupportEvent) {
  return getPersistenceRepository().createSupportEvent(event);
}

export function listSupportEventsByConversationId(conversationId: string) {
  return getPersistenceRepository().listSupportEventsByConversationId(conversationId);
}

export function createSupportKnowledgeArticle(article: SupportKnowledgeArticle) {
  return getPersistenceRepository().createSupportKnowledgeArticle(article);
}

export function updateSupportKnowledgeArticle(article: SupportKnowledgeArticle) {
  return getPersistenceRepository().updateSupportKnowledgeArticle(article);
}

export function findSupportKnowledgeArticleById(id: string) {
  return getPersistenceRepository().findSupportKnowledgeArticleById(id);
}

export function findSupportKnowledgeArticleBySlug(slug: string) {
  return getPersistenceRepository().findSupportKnowledgeArticleBySlug(slug);
}

export function listSupportKnowledgeArticles() {
  return getPersistenceRepository().listSupportKnowledgeArticles();
}
