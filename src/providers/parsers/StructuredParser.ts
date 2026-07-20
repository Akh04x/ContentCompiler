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
  factsUsed: z.union([z.string(), z.array(z.string())]).transform(v => Array.isArray(v) ? v : [v]),
});

export const DecisionGraphSchema = z.object({
  decisionId: z.string(),
  status: z.string(),
  conclusionsEmployed: z.union([z.string(), z.array(z.string())]).transform(v => Array.isArray(v) ? v : [v]),
});

export const TargetIntentSchema = z.object({
  title: z.string(),
  formats: z.union([z.string(), z.array(z.string())]).transform(v => Array.isArray(v) ? v : [v]),
  channels: z.union([z.string(), z.array(z.string())]).transform(v => Array.isArray(v) ? v : [v]),
});

export const CompilationStructureSchema = z.object({
  content: z.string(),
  format: z.string(),
  metadata: z.record(z.string(), z.any()),
});
