'use server';

import {
  generateAdministrativeBrief,
  type AdministrativeBriefsInput,
} from '@/ai/flows/ai-administrative-briefs-flow';
import { getDashboardStats, getAuditLogs } from '@/lib/data';

export async function getAiBrief() {
  try {
    const dashboardStatistics = getDashboardStats();
    const auditLogs = getAuditLogs({ limit: 10 });

    const input: AdministrativeBriefsInput = {
      dashboardStatistics,
      auditLogs,
    };

    const brief = await generateAdministrativeBrief(input);
    return { success: true, brief };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate brief.' };
  }
}
