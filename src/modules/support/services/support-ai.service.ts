import type { SupportAiRequestInput, SupportAiResponse } from "@/types/backend/onboarding";

function inferRecommendedTeam(input: SupportAiRequestInput) {
  const message = input.userMessage.toLowerCase();
  const domain = input.domain;

  if (message.includes("bill") || message.includes("charge") || message.includes("payment")) {
    return "billing";
  }

  if (domain === "merchant") {
    if (message.includes("approval") || message.includes("activate") || message.includes("application")) {
      return "merchant_onboarding";
    }
    return "merchant_ops";
  }

  if (domain === "slyder") return "slyder_support";
  if (domain === "employee") return "employee_support";
  if (domain === "referrer") return "referrals";

  return "general_support";
}

function shouldHandoff(input: SupportAiRequestInput) {
  const message = input.userMessage.toLowerCase();

  return [
    "human",
    "agent",
    "urgent",
    "refund",
    "failed",
    "cancelled",
    "dispute",
    "locked",
    "login",
    "cannot access",
  ].some((keyword) => message.includes(keyword));
}

function shouldCollectInfo(input: SupportAiRequestInput) {
  const message = input.userMessage.toLowerCase();
  return message.includes("delivery") || message.includes("order") || message.includes("application");
}

function buildKnowledgeAnswer(input: SupportAiRequestInput) {
  const match = input.knowledgeMatches[0];
  if (!match) {
    return "Thanks for contacting SLYDE support. I can help capture the issue, but a support specialist may need to review the next step.";
  }

  return `${match.snippet}\n\nIf this does not fully resolve the issue, I can route the conversation to a SLYDE support specialist with the context already attached.`;
}

export async function generateSupportAiResponse(input: SupportAiRequestInput): Promise<SupportAiResponse> {
  const recommendedTeam = inferRecommendedTeam(input);

  if (shouldHandoff(input)) {
    return {
      action: "handoff",
      answer: "A SLYDE support specialist should review this conversation next.",
      confidence: 0.28,
      handoffReason: "The issue appears sensitive, urgent, or likely to require human review.",
      recommendedTeam,
      agentSummary: `Escalate this ${input.domain} conversation to ${recommendedTeam}. User message: ${input.userMessage}`,
    };
  }

  if (shouldCollectInfo(input) && input.knowledgeMatches.length === 0) {
    return {
      action: "collect_info",
      answer:
        "I can help route this quickly. Please share the main reference involved, such as an order number, delivery reference, or application email, and I will attach it for the support team.",
      confidence: 0.46,
      missingFields: ["reference_id_or_contact_detail"],
      recommendedTeam,
      agentSummary: `Collect the missing reference for this ${input.domain} support request before handoff.`,
    };
  }

  return {
    action: "answer",
    answer: buildKnowledgeAnswer(input),
    confidence: input.knowledgeMatches.length > 0 ? 0.81 : 0.58,
    recommendedTeam,
    agentSummary: `AI provided a first-response answer for a ${input.domain} conversation.`,
  };
}
