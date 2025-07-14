// src/ai/flows/detect-student-disengagement.ts
'use server';

/**
 * @fileOverview Detects student disengagement using facial expression analysis and suggests interventions.
 *
 * - detectStudentDisengagement - A function that analyzes facial expressions to detect disengagement and suggests interventions.
 * - DetectStudentDisengagementInput - The input type for the detectStudentDisengagement function.
 * - DetectStudentDisengagementOutput - The return type for the detectStudentDisengagement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectStudentDisengagementInputSchema = z.object({
  faceDataUri: z
    .string()
    .describe(
      "A photo of the student's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  learningModule: z.string().describe('The name or description of the current learning module.'),
});
export type DetectStudentDisengagementInput = z.infer<typeof DetectStudentDisengagementInputSchema>;

const DetectStudentDisengagementOutputSchema = z.object({
  isDisengaged: z.boolean().describe('Whether or not the student is disengaged.'),
  boredomLevel: z.number().describe('A numeric value (0-100) indicating the level of boredom detected.'),
  suggestedIntervention: z.string().describe('A suggestion for an intervention, such as an alternative learning module or explanation.'),
});
export type DetectStudentDisengagementOutput = z.infer<typeof DetectStudentDisengagementOutputSchema>;

export async function detectStudentDisengagement(input: DetectStudentDisengagementInput): Promise<DetectStudentDisengagementOutput> {
  return detectStudentDisengagementFlow(input);
}

const detectStudentDisengagementPrompt = ai.definePrompt({
  name: 'detectStudentDisengagementPrompt',
  input: {schema: DetectStudentDisengagementInputSchema},
  output: {schema: DetectStudentDisengagementOutputSchema},
  prompt: `You are an AI assistant that analyzes student facial expressions to detect disengagement and suggests interventions.

You will receive an image of the student's face and the name of the current learning module.

Based on the facial expression, determine if the student is disengaged. Provide a boredom level from 0-100 (0 being not bored at all, 100 being extremely bored).

If the student is disengaged, suggest an intervention such as an alternative learning module or explanation.

Face Image: {{media url=faceDataUri}}
Learning Module: {{{learningModule}}}`,
});

const detectStudentDisengagementFlow = ai.defineFlow(
  {
    name: 'detectStudentDisengagementFlow',
    inputSchema: DetectStudentDisengagementInputSchema,
    outputSchema: DetectStudentDisengagementOutputSchema,
  },
  async input => {
    const {output} = await detectStudentDisengagementPrompt(input);
    return output!;
  }
);
