// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing contextual AI responses to student queries.
 *
 * - provideContextualAiResponse - A function that handles the generation of contextual AI responses.
 * - ProvideContextualAiResponseInput - The input type for the provideContextualAiResponse function.
 * - ProvideContextualAiResponseOutput - The return type for the provideContextualAiResponse function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideContextualAiResponseInputSchema = z.object({
  query: z.string().describe('The query from the student.'),
  queryType: z
    .enum(['text', 'voice', 'image'])
    .describe('The type of query (text, voice, or image).'),
  visualAidsRequested: z
    .boolean()
    .describe('Whether visual aids are requested in the response.'),
  studentEngagementLevel: z
    .number()
    .optional()
    .describe('The current engagement level of the student (optional).'),
  studentHistory: z
    .array(z.string())
    .optional()
    .describe('The history of past interactions with the student (optional).'),
});

export type ProvideContextualAiResponseInput = z.infer<
  typeof ProvideContextualAiResponseInputSchema
>;

const ProvideContextualAiResponseOutputSchema = z.object({
  response: z.string().describe('The contextual AI response.'),
  visualAids: z
    .array(z.string())
    .optional()
    .describe('Optional visual aids (e.g., image URLs, chart data).'),
  suggestedIntervention: z
    .string()
    .optional()
    .describe('Optional suggested intervention based on engagement level.'),
});

export type ProvideContextualAiResponseOutput = z.infer<
  typeof ProvideContextualAiResponseOutputSchema
>;

export async function provideContextualAiResponse(
  input: ProvideContextualAiResponseInput
): Promise<ProvideContextualAiResponseOutput> {
  return provideContextualAiResponseFlow(input);
}

const provideContextualAiResponsePrompt = ai.definePrompt({
  name: 'provideContextualAiResponsePrompt',
  input: {schema: ProvideContextualAiResponseInputSchema},
  output: {schema: ProvideContextualAiResponseOutputSchema},
  prompt: `You are an AI assistant for students. Your job is to provide
  contextual responses to student queries, including textual explanations,
  charts, and visual aids when appropriate.

  The student has asked the following query:
  Query: {{{query}}}
  Query Type: {{{queryType}}}

  The student has requested visual aids: {{#if visualAidsRequested}}Yes{{else}}No{{/if}}

  {{#if studentEngagementLevel}}
  The student's current engagement level is: {{{studentEngagementLevel}}}
  {{/if}}

  {{#if studentHistory}}
  Here is the student's past interaction history:
  {{#each studentHistory}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  Provide a response that is tailored to the context of the query. If the student
  has requested visual aids, include them in the response.
  If the student's engagement level is low, suggest an intervention to improve
  their engagement.
  Consider the past interaction history to provide a personalized response.
  Make sure that the response answers the query properly. Ensure the response is
  appropriate for the students.

  Output the repsonse, any visual aids, and any suggested intervention, as a JSON blob:
  {{outputSchema}}
  `,
});

const provideContextualAiResponseFlow = ai.defineFlow(
  {
    name: 'provideContextualAiResponseFlow',
    inputSchema: ProvideContextualAiResponseInputSchema,
    outputSchema: ProvideContextualAiResponseOutputSchema,
  },
  async input => {
    const {output} = await provideContextualAiResponsePrompt(input);
    return output!;
  }
);
