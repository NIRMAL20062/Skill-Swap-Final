
'use server';

/**
 * @fileOverview A chatbot flow for answering questions about the SkillSwap app.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.any()),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput) {
  const { history, message } = input;

  const fullPrompt = `
You are an expert on the SkillSwap application. Your role is to be a helpful assistant that can answer user questions about how the app works.

SkillSwap is a platform for trading skills, not money. Here are key features:
- Discover peers to trade skills.
- Schedule and manage sessions.
- Profile reviews, AI skill suggestions, etc.

Conversation history:
${history.map((h: any, i: number) => `Turn ${i + 1}: ${JSON.stringify(h)}`).join('\n')}

User: ${message}
Assistant:
`;

  const { text } = await ai.generate(fullPrompt);
  return text;
}
