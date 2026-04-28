'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating AI-powered administrative briefs.
 *
 * - generateAdministrativeBrief - A function that generates a concise, human-readable summary
 *   from dashboard statistics and audit logs.
 * - AdministrativeBriefsInput - The input type for the generateAdministrativeBrief function.
 * - AdministrativeBriefsOutput - The return type for the generateAdministrativeBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AdministrativeBriefsInputSchema = z.object({
  dashboardStatistics: z.object({
    totalHouses: z.number().describe('Total number of registered houses.'),
    housesBySubcity: z.record(z.string(), z.number()).describe('Number of houses per sub-city.'),
    housesByWoreda: z.record(z.string(), z.number()).describe('Number of houses per woreda.'),
    housesByKebele: z.record(z.string(), z.number()).describe('Number of houses per kebele.'),
    recentlyAddedHouses: z.array(z.object({
      houseNumber: z.string(),
      householderName: z.string(),
      createdAt: z.string(), // ISO date string
    })).describe('List of recently added house records.'),
    recentlyUpdatedHouses: z.array(z.object({
      houseNumber: z.string(),
      householderName: z.string(),
      updatedAt: z.string(), // ISO date string
    })).describe('List of recently updated house records.'),
  }).describe('Dashboard statistics for housing management.'),
  auditLogs: z.array(z.object({
    timestamp: z.string(), // ISO date string
    user: z.string(),
    action: z.string(),
    entityType: z.string(),
    entityId: z.string().optional(),
    description: z.string().optional(),
  })).describe('Recent audit log entries detailing system activity.'),
});
export type AdministrativeBriefsInput = z.infer<typeof AdministrativeBriefsInputSchema>;

// Output Schema
const AdministrativeBriefsOutputSchema = z.string().describe('A concise, human-readable summary of housing trends and system activity.');
export type AdministrativeBriefsOutput = z.infer<typeof AdministrativeBriefsOutputSchema>;

// Wrapper function
export async function generateAdministrativeBrief(input: AdministrativeBriefsInput): Promise<AdministrativeBriefsOutput> {
  return administrativeBriefsFlow(input);
}

// Genkit Prompt definition
const administrativeBriefsPrompt = ai.definePrompt({
  name: 'administrativeBriefsPrompt',
  input: {schema: AdministrativeBriefsInputSchema},
  output: {schema: AdministrativeBriefsOutputSchema},
  prompt: `You are an AI assistant tasked with generating concise, human-readable administrative briefs for high-level officials.
Your goal is to summarize key housing trends and system activity insights from the provided dashboard statistics and audit logs.
Focus on extracting the most important information, identifying trends, and highlighting any significant changes or activities.
The summary should be professional, easy to understand, and actionable.

Dashboard Statistics:
Total Houses: {{{dashboardStatistics.totalHouses}}}
Houses by Sub-city: {{json dashboardStatistics.housesBySubcity}}
Houses by Woreda: {{json dashboardStatistics.housesByWoreda}}
Houses by Kebele: {{json dashboardStatistics.housesByKebele}}

Recently Added Houses:
{{#each dashboardStatistics.recentlyAddedHouses}}
  - House Number: {{{this.houseNumber}}}, Householder: {{{this.householderName}}}, Added On: {{{this.createdAt}}}
{{else}}
  No recently added houses.
{{/each}}

Recently Updated Houses:
{{#each dashboardStatistics.recentlyUpdatedHouses}}
  - House Number: {{{this.houseNumber}}}, Householder: {{{this.householderName}}}, Updated On: {{{this.updatedAt}}}
{{else}}
  No recently updated houses.
{{/each}}

Recent Audit Log Activities:
{{#each auditLogs}}
  - Timestamp: {{{this.timestamp}}}, User: {{{this.user}}}, Action: {{{this.action}}} on {{{this.entityType}}} (ID: {{{this.entityId}}}) - {{{this.description}}}
{{else}}
  No recent audit log activities.
{{/each}}

Based on the above data, provide a concise summary covering:
1. Overall housing registration status and trends.
2. Distribution of houses across administrative divisions.
3. Significant recent additions or updates.
4. Key system activities from the audit logs, noting any unusual or important actions.
5. Any notable insights or recommendations.

Ensure the brief is less than 500 words and directly addresses the needs of a high-level official.
`,
});

// Genkit Flow definition
const administrativeBriefsFlow = ai.defineFlow(
  {
    name: 'administrativeBriefsFlow',
    inputSchema: AdministrativeBriefsInputSchema,
    outputSchema: AdministrativeBriefsOutputSchema,
  },
  async (input) => {
    const {output} = await administrativeBriefsPrompt(input);
    return output!;
  }
);
