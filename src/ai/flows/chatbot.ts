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
  role: z.enum(['user', 'model']),
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

  // Convert history to the expected format and include system prompt and user message
  const messages = [
    { role: 'system', content: [{ text: systemPrompt }] },
    ...history, // Assuming history is already in the correct format
    { role: 'user', content: [{ text: message }] },
  ];

  const { text } = await ai.generate({
    messages, // Pass messages array instead of separate prompt, system, and history
  });

  return text;
}