'use server';

/**
 * @fileOverview This flow allows secretaries to upload audio recordings of meetings
 * and have AI automatically transcribe them and create draft meeting minutes.
 *
 * - aiNotulenForSecretaries - A function that takes audio data URI as input and returns draft meeting minutes.
 * - AiNotulenForSecretariesInput - The input type for the aiNotulenForSecretaries function.
 * - AiNotulenForSecretariesOutput - The return type for the aiNotulenForSecretaries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNotulenForSecretariesInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio recording of the meeting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiNotulenForSecretariesInput = z.infer<typeof AiNotulenForSecretariesInputSchema>;

const AiNotulenForSecretariesOutputSchema = z.object({
  minutes: z
    .string()
    .describe('The draft meeting minutes generated from the audio recording.'),
});
export type AiNotulenForSecretariesOutput = z.infer<typeof AiNotulenForSecretariesOutputSchema>;

export async function aiNotulenForSecretaries(
  input: AiNotulenForSecretariesInput
): Promise<AiNotulenForSecretariesOutput> {
  return aiNotulenForSecretariesFlow(input);
}

const aiNotulenForSecretariesPrompt = ai.definePrompt({
  name: 'aiNotulenForSecretariesPrompt',
  input: {schema: AiNotulenForSecretariesInputSchema},
  output: {schema: AiNotulenForSecretariesOutputSchema},
  prompt: `You are an AI assistant helping a secretary generate meeting minutes.
  Transcribe the audio recording provided and create a draft of the meeting minutes.
  Audio Recording: {{media url=audioDataUri}}`,
});

const aiNotulenForSecretariesFlow = ai.defineFlow(
  {
    name: 'aiNotulenForSecretariesFlow',
    inputSchema: AiNotulenForSecretariesInputSchema,
    outputSchema: AiNotulenForSecretariesOutputSchema,
  },
  async input => {
    const {output} = await aiNotulenForSecretariesPrompt(input);
    return output!;
  }
);
