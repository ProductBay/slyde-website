import { NextResponse } from "next/server";
import { supportAiRequestSchema } from "@/modules/support/schemas/support-ai.schema";
import { generateSupportAiResponse } from "@/modules/support/services/support-ai.service";
import { getSupportConversationDetail, updateSupportConversationStatus } from "@/modules/support/services/support-conversation.service";
import { createSupportHandoffRecord } from "@/modules/support/services/support-handoff.service";
import { appendSupportMessage } from "@/modules/support/services/support-message.service";
import { findRelevantSupportKnowledgeArticles } from "@/modules/support/services/support-knowledge.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = supportAiRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid AI request" }, { status: 400 });
  }

  const detail = await getSupportConversationDetail(parsed.data.conversationId);
  if (!detail) {
    return NextResponse.json({ error: "Support conversation not found" }, { status: 404 });
  }

  const knowledgeArticles = await findRelevantSupportKnowledgeArticles({
    domain: parsed.data.domain,
    query: parsed.data.userMessage,
    limit: 3,
  });

  const response = await generateSupportAiResponse({
    ...parsed.data,
    contextSnapshots:
      parsed.data.contextSnapshots.length > 0
        ? parsed.data.contextSnapshots
        : detail.contextSnapshots.map((snapshot) => ({
            type: snapshot.contextType,
            payload: snapshot.payload,
          })),
    knowledgeMatches:
      parsed.data.knowledgeMatches.length > 0
        ? parsed.data.knowledgeMatches
        : knowledgeArticles.map((article) => ({
            title: article.title,
            snippet: article.summary ?? article.content.slice(0, 260),
            sourceId: article.id,
          })),
  });

  if (response.action === "handoff") {
    const handoff = await createSupportHandoffRecord({
      conversationId: parsed.data.conversationId,
      reason: response.handoffReason ?? "AI requested human review.",
      summary: response.agentSummary ?? response.answer,
      recommendedTeam: response.recommendedTeam ?? "general_support",
      confidenceScore: response.confidence,
    });
    await updateSupportConversationStatus(parsed.data.conversationId, "waiting_on_agent");
    return NextResponse.json({ response, handoff });
  }

  const message = await appendSupportMessage({
    conversationId: parsed.data.conversationId,
    senderType: "ai",
    body: response.answer,
    messageFormat: "plain_text",
    aiGenerated: true,
    metadata: {
      confidence: response.confidence,
      missingFields: response.missingFields,
      recommendedTeam: response.recommendedTeam,
    },
  });

  if (response.action === "collect_info") {
    await updateSupportConversationStatus(parsed.data.conversationId, "waiting_on_user");
  }

  return NextResponse.json({ response, message });
}
