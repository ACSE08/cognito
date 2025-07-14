'use server';
/**
 * @fileOverview A multimodal query processing AI agent.
 *
 * - processMultimodalQuery - A function that handles the multimodal query process.
 * - ProcessMultimodalQueryInput - The input type for the processMultimodalQuery function.
 * - ProcessMultimodalQueryOutput - The return type for the processMultimodalQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessMultimodalQueryInputSchema = z.object({
  textQuery: z.string().optional().describe('The text query from the student.'),
  voiceDataUri: z
    .string()
    .optional()
    .describe(
      "The voice query from the student, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "The image query from the student, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessMultimodalQueryInput = z.infer<typeof ProcessMultimodalQueryInputSchema>;

const ProcessMultimodalQueryOutputSchema = z.object({
  response: z.string().describe('The response to the student query.'),
  includesChart: z
    .boolean()
    .describe(
      'Whether or not the response includes a chart to better answer the query.'
    ),
});
export type ProcessMultimodalQueryOutput = z.infer<typeof ProcessMultimodalQueryOutputSchema>;

export async function processMultimodalQuery(
  input: ProcessMultimodalQueryInput
): Promise<ProcessMultimodalQueryOutput> {
  return processMultimodalQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processMultimodalQueryPrompt',
  input: {schema: ProcessMultimodalQueryInputSchema},
  output: {schema: ProcessMultimodalQueryOutputSchema},
  prompt: `You are an AI assistant for students.  You will answer their questions to the best of your ability.

You can receive queries in the form of text, voice, or images.  Use the appropriate information to answer the question.

Text Query: {{{textQuery}}}
Voice Query: {{#if voiceDataUri}}{{media url=voiceDataUri}}{{else}}No voice query.{{/if}}
Image Query: {{#if imageDataUri}}{{media url=imageDataUri}}{{else}}No image query.{{/if}}

Response:`,
});

const processMultimodalQueryFlow = ai.defineFlow(
  {
    name: 'processMultimodalQueryFlow',
    inputSchema: ProcessMultimodalQueryInputSchema,
    outputSchema: ProcessMultimodalQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
