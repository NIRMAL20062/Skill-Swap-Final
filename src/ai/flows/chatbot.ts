
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

  const response = await ai.chat({
    messages: [
      {
        role: 'system',
        content: `You are an expert on the SkillSwap application. Your role is to be a helpful assistant that can answer user questions about how the app works.

- **What is SkillSwap?** SkillSwap is a platform where users can trade their skills with peers without any money involved. It's a community for personal and professional growth through skill exchange.
- **How does it work?** Users create a profile listing the skills they can teach and the skills they want to learn. They can then discover other users and request one-on-one learning sessions.
- **Key Features:**
  - **Discover Peers:** Find other users to trade skills with.
  - **Manage Sessions:** Schedule, track, and manage your learning/teaching sessions.
  - **User Profiles:** View detailed profiles with skills, ratings, and reviews.
  - **Reviews and Ratings:** After a session is completed, a mentee can leave a rating and review for their mentor.
  - **AI Skill Suggestions:** The app uses AI to suggest new skills a user might be interested in learning based on their profile.
- **Is it free?** Yes, the platform is free to use. The core concept is exchanging time and knowledge, not money.
- **How do I start?** Sign up, complete your profile by adding your skills, and then head to the "Discover" page to find someone to learn from!

Be friendly, concise, and helpful in your responses. If you don't know the answer to a question, say that you don't have that information.`,
      },
      ...history,
      {
        role: 'user',
        content: message,
      },
    ],
  });

  return response.text;
}
