import { z } from 'zod';

export const KnowledgeFactSchema = z.object({
  fact: z.string(),
  confidence: z.number().min(0).max(1),
  sourceType: z.string(),
  sourceRef: z.string(),
});

export const CandidateConclusionSchema = z.object({
  id: z.string(),
  justification: z.string(),
  confidence: z.number(),
  factsUsed: z.array(z.string()),
});

export const DecisionGraphSchema = z.object({
  decisionId: z.string(),
  status: z.string(),
  conclusionsEmployed: z.array(z.string()),
});

export const TargetIntentSchema = z.object({
  title: z.string(),
  formats: z.array(z.string()),
  channels: z.array(z.string()),
});

export const CompilationStructureSchema = z.object({
  content: z.string(),
  format: z.string(),
  metadata: z.record(z.string(), z.any()),
});
