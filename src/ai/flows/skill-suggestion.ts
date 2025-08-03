'use server';

/**
 * @fileOverview AI-powered skill suggestion flow.
 *
 * This file defines a Genkit flow that suggests relevant skills to users based on their existing skills
 * and session history. It exports the `suggestSkills` function, the `SkillSuggestionInput` type,
 * and the `SkillSuggestionOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillSuggestionInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'User profile information including existing skills and session history.'
    ),
});
export type SkillSuggestionInput = z.infer<typeof SkillSuggestionInputSchema>;

const SkillSuggestionOutputSchema = z.object({
  suggestedSkills: z
    .array(z.string())
    .describe('An array of suggested skills relevant to the user.'),
});
export type SkillSuggestionOutput = z.infer<typeof SkillSuggestionOutputSchema>;

export async function suggestSkills(input: SkillSuggestionInput): Promise<SkillSuggestionOutput> {
  return suggestSkillsFlow(input);
}

const skillSuggestionPrompt = ai.definePrompt({
  name: 'skillSuggestionPrompt',
  input: {schema: SkillSuggestionInputSchema},
  output: {schema: SkillSuggestionOutputSchema},
  prompt: `Based on the following user profile and session history, suggest 3-5 skills that the user might be interested in adding to their profile to improve their matchmaking and user engagement.\n\nUser Profile and Session History: {{{userProfile}}}\n\nConsider skills that are related to the user's existing skills or skills that could complement their session history. Return an array of skills.`, // Ensure array output
});

const suggestSkillsFlow = ai.defineFlow(
  {
    name: 'suggestSkillsFlow',
    inputSchema: SkillSuggestionInputSchema,
    outputSchema: SkillSuggestionOutputSchema,
  },
  async input => {
    const {output} = await skillSuggestionPrompt(input);
    return output!;
  }
);
