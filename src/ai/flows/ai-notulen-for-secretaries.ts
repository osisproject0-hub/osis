'use server';

/**
 * @fileOverview This flow allows secretaries to upload audio recordings of meetings
 * and have AI automatically transcribe them and create draft meeting minutes.
 *
 * - aiNotulenForSecretaries - A function that takes audio data URI as input and returns draft meeting minutes.
 */

import {ai} from '@/ai/genkit';
import { 
    AiNotulenForSecretariesInputSchema,
    AiNotulenForSecretariesOutputSchema,
    type AiNotulenForSecretariesInput,
    type AiNotulenForSecretariesOutput
} from '@/lib/types';


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
