'use server';

import {
  generateAdministrativeBrief,
  type AdministrativeBriefsInput,
} from '@/ai/flows/ai-administrative-briefs-flow';

export async function getAiBrief(input: AdministrativeBriefsInput) {
  try {
    const brief = await generateAdministrativeBrief(input);
    return { success: true, brief };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate brief: ${errorMessage}` };
  }
}
