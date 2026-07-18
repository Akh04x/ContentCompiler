import { z } from 'zod';
import { KnowledgeFactSchema } from './StructuredParser';
import { ProviderParsingError } from '../errors/ProviderErrorMapper';

export class KnowledgeParser {
  public static parse(data: unknown): z.infer<typeof KnowledgeFactSchema> {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            // let zod fail below
        }
    }

    if (!data || typeof data !== 'object') {
        throw new Error('Expected JSON object');
    }

    const raw = data as Record<string, unknown>;

    // Field normalization / aliases
    const normalized = {
      fact: raw.fact ?? raw.primary_fact ?? raw.main_fact ?? raw.statement,
      confidence: raw.confidence ?? raw.confidence_score ?? raw.certainty ?? 1,
      sourceType: raw.sourceType ?? raw.source_type ?? raw.origin ?? raw.source ?? 'extracted',
      sourceRef: raw.sourceRef ?? raw.source_ref ?? raw.reference ?? raw.citation ?? 'LLM Generated',
    };

    return KnowledgeFactSchema.parse(normalized);
  }
}
