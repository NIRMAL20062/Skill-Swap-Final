'use server';

/**
 * @fileOverview A chatbot flow for answering questions about the SkillSwap app.
 * This file defines the `chat` flow which takes conversation history and a new message,
 * and returns the AI's response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single message in the chat history.
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system', 'tool']), // Include all valid roles
  content: z.array(z.object({ text: z.string() })),
});

// Define the schema for the chat flow's input.
const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
  const { history, message } = input;

  const systemPrompt = `You are an expert on the SkillSwap application. Your role is to be a helpful assistant that can answer user questions about how the app works.

SkillSwap is a platform for trading skills, not money. Here are key features:
- Discover peers to trade skills.
- Schedule and manage sessions.
- Profile reviews, AI skill suggestions, etc.
`;

  // Combine system prompt, history, and user message into a single prompt string
  // or adjust based on the library's expected format
  const prompt = `
${systemPrompt}

${history.map((msg) => `${msg.role}: ${msg.content[0].text}`).join('\n')}

user: ${message}
`;

  const { text } = await ai.generate({
    prompt, // Use a single prompt string or adjust to match library's history format
  });

  return text;
}