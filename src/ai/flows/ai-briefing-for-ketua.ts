'use server';

/**
 * @fileOverview AI briefing flow for the Ketua OSIS.
 *
 * - aiBriefingForKetua - A function that generates a daily AI briefing for the Ketua OSIS.
 */

import { ai } from '@/ai/genkit';
import { 
    AIBriefingForKetuaInputSchema, 
    AIBriefingForKetuaOutputSchema, 
    type AIBriefingForKetuaInput,
    type AIBriefingForKetuaOutput
} from '@/lib/types';


// This function can be called from other server-side code.
export async function aiBriefingForKetua(input: AIBriefingForKetuaInput): Promise<AIBriefingForKetuaOutput> {
  return aiBriefingForKetuaFlow(input);
}


const prompt = ai.definePrompt({
    name: 'aiBriefingForKetuaPrompt',
    input: { schema: AIBriefingForKetuaInputSchema },
    output: { schema: AIBriefingForKetuaOutputSchema },
    prompt: `You are an AI assistant providing a daily briefing for the Ketua OSIS (Head of Student Council).

    Here is a summary of pending approvals: {{{pendingApprovals}}}

    Here is a summary of division progress: {{{divisionProgress}}}

    Here is a summary of sentiment analysis from public forums: {{{sentimentAnalysis}}}

    Based on this information, generate a concise and informative briefing for the Ketua OSIS to quickly understand the current situation and make informed decisions. Structure your output as a single string.`,
});


const aiBriefingForKetuaFlow = ai.defineFlow(
  {
    name: 'aiBriefingForKetuaFlow',
    inputSchema: AIBriefingForKetuaInputSchema,
    outputSchema: AIBriefingForKetuaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate briefing from prompt.');
    }
    return output;
  }
);
