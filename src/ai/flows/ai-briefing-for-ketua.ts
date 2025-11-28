'use server';

/**
 * @fileOverview AI briefing flow for the Ketua OSIS.
 *
 * - aiBriefingForKetua - A function that generates a daily AI briefing for the Ketua OSIS.
 * - AIBriefingForKetuaInput - The input type for the aiBriefingForKetua function.
 * - AIBriefingForKetuaOutput - The return type for the aiBriefingForKetua function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIBriefingForKetuaInputSchema = z.object({
  pendingApprovals: z.string().describe('A summary of pending approvals.'),
  divisionProgress: z.string().describe('A summary of division progress.'),
  sentimentAnalysis: z
    .string()
    .describe('A summary of sentiment analysis from public forums.'),
});
export type AIBriefingForKetuaInput = z.infer<typeof AIBriefingForKetuaInputSchema>;

const AIBriefingForKetuaOutputSchema = z.object({
  briefing: z.string().describe('A comprehensive AI briefing for the Ketua OSIS.'),
});
export type AIBriefingForKetuaOutput = z.infer<typeof AIBriefingForKetuaOutputSchema>;


const aiBriefingForKetuaFlow = ai.defineFlow(
  {
    name: 'aiBriefingForKetuaFlow',
    inputSchema: AIBriefingForKetuaInputSchema,
    outputSchema: AIBriefingForKetuaOutputSchema,
  },
  async (input) => {
    const prompt = `You are an AI assistant providing a daily briefing for the Ketua OSIS (Head of Student Council).

    Here is a summary of pending approvals: ${input.pendingApprovals}

    Here is a summary of division progress: ${input.divisionProgress}

    Here is a summary of sentiment analysis from public forums: ${input.sentimentAnalysis}

    Based on this information, generate a concise and informative briefing for the Ketua OSIS to quickly understand the current situation and make informed decisions. Structure your output as a single string.`;

    const { output } = await ai.generate({
        prompt: prompt,
        output: {
            schema: AIBriefingForKetuaOutputSchema,
        }
    });
    
    return output!;
  }
);

export async function aiBriefingForKetua(input: AIBriefingForKetuaInput): Promise<AIBriefingForKetuaOutput> {
    return await aiBriefingForKetuaFlow(input);
}
