import { config } from 'dotenv';
config();

import '@/ai/flows/process-multimodal-query.ts';
import '@/ai/flows/provide-contextual-ai-response.ts';
import '@/ai/flows/detect-student-disengagement.ts';