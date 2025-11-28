'use server';

/**
 * @fileOverview This flow allows secretaries to generate draft official letters.
 *
 * - aiSuratResmiForSecretaries - A function that takes letter details and returns a draft letter.
 * - AiSuratResmiForSecretariesInput - The input type for the function.
 * - AiSuratResmiForSecretariesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AiSuratResmiForSecretariesInputSchema = z.object({
  recipient: z.string().describe('The recipient of the letter (e.g., "Kepala Sekolah", "Ketua OSIS SMPN 1").'),
  subject: z.string().describe('The subject or title of the letter (e.g., "Permohonan Izin Tempat", "Undangan Rapat").'),
  bodyPoints: z.string().describe('A list of key points or the main message to be included in the letter body. Can be bullet points or a short paragraph.'),
  letterType: z.enum(['invitation', 'request', 'notification']).describe('The type of letter to be generated.'),
});
export type AiSuratResmiForSecretariesInput = z.infer<typeof AiSuratResmiForSecretariesInputSchema>;

export const AiSuratResmiForSecretariesOutputSchema = z.object({
  letter: z
    .string()
    .describe('The complete draft of the official letter, formatted in proper Indonesian, including header, body, and closing.'),
});
export type AiSuratResmiForSecretariesOutput = z.infer<typeof AiSuratResmiForSecretariesOutputSchema>;

// This function can be called from other server-side code.
export async function aiSuratResmiForSecretaries(
  input: AiSuratResmiForSecretariesInput
): Promise<AiSuratResmiForSecretariesOutput> {
  return aiSuratResmiForSecretariesFlow(input);
}

const aiSuratResmiForSecretariesPrompt = ai.definePrompt({
  name: 'aiSuratResmiForSecretariesPrompt',
  input: {schema: AiSuratResmiForSecretariesInputSchema},
  output: {schema: AiSuratResmiForSecretariesOutputSchema},
  prompt: `You are an expert AI assistant for an OSIS secretary, tasked with drafting official letters in Indonesian.
  
  Based on the following details, please generate a complete and formal official letter. The letter should have a professional tone and follow the standard format for official Indonesian correspondence (surat resmi).

  - Letter Type: {{{letterType}}}
  - Recipient (Tujuan Surat): {{{recipient}}}
  - Subject (Perihal): {{{subject}}}
  - Key Points for Body: {{{bodyPoints}}}

  Please generate the full letter, including a simple header (Nomor, Lampiran, Perihal), date, recipient address, opening salutation (Dengan hormat,), the main body paragraphs elaborating on the key points, a closing salutation (Hormat kami,), and a space for the signature.
  `,
});

const aiSuratResmiForSecretariesFlow = ai.defineFlow(
  {
    name: 'aiSuratResmiForSecretariesFlow',
    inputSchema: AiSuratResmiForSecretariesInputSchema,
    outputSchema: AiSuratResmiForSecretariesOutputSchema,
  },
  async input => {
    const {output} = await aiSuratResmiForSecretariesPrompt(input);
    if (!output) {
        throw new Error('Failed to generate letter from prompt.');
    }
    return output;
  }
);
