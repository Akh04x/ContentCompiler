import { z } from 'zod';
import { CandidateConclusionSchema } from './StructuredParser';

export class ReasoningParser {
  public static parse(data: unknown): z.infer<typeof CandidateConclusionSchema> {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            // drop through
        }
    }

    if (!data || typeof data !== 'object') {
        throw new Error('Expected JSON object');
    }

    const raw = data as Record<string, unknown>;

    // Field normalization / aliases
    const normalized = {
      id: raw.id ?? raw.conclusion_id ?? raw.candidate_id ?? `conclusion-${Date.now()}`,
      justification: raw.justification ?? raw.reasoning ?? raw.explanation ?? raw.rationale,
      confidence: raw.confidence ?? raw.confidence_score ?? raw.certainty ?? 1,
      factsUsed: raw.factsUsed ?? raw.facts_used ?? raw.supporting_facts ?? raw.facts ?? [],
    };

    return CandidateConclusionSchema.parse(normalized);
  }
}
