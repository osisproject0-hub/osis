'use server';

import { aiNotulenForSecretaries } from '@/ai/flows/ai-notulen-for-secretaries';
import { aiSuratResmiForSecretaries } from '@/ai/flows/ai-surat-resmi-for-secretaries';
import type { AiNotulenForSecretariesInput, AiSuratResmiForSecretariesInput } from '@/lib/types';


export async function generateNotulenAction(input: AiNotulenForSecretariesInput) {
  try {
    const result = await aiNotulenForSecretaries(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate minutes.' };
  }
}

export async function generateSuratResmiAction(input: AiSuratResmiForSecretariesInput) {
    try {
      const result = await aiSuratResmiForSecretaries(input);
      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to generate official letter.' };
    }
  }
