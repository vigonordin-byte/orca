import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runOnClaude(
  instruction: string,
  rolePrompt?: string,
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: rolePrompt,
    messages: [{ role: "user", content: instruction }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}
