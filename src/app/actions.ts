'use server';

import { aiBriefingForKetua, AIBriefingForKetuaInput } from '@/ai/flows/ai-briefing-for-ketua';
import { aiNotulenForSecretaries, AiNotulenForSecretariesInput } from '@/ai/flows/ai-notulen-for-secretaries';

export async function generateBriefingAction(input: AIBriefingForKetuaInput) {
  try {
    const result = await aiBriefingForKetua(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate briefing.' };
  }
}

export async function generateNotulenAction(input: AiNotulenForSecretariesInput) {
  try {
    const result = await aiNotulenForSecretaries(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate minutes.' };
  }
}
