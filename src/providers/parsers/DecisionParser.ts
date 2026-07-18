import { z } from 'zod';
import { DecisionGraphSchema } from './StructuredParser';

export class DecisionParser {
  public static parse(data: unknown): z.infer<typeof DecisionGraphSchema> {
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
      decisionId: raw.decisionId ?? raw.decision_id ?? raw.id ?? `dec-${Date.now()}`,
      status: raw.status ?? raw.state ?? raw.decision_status ?? 'Draft',
      conclusionsEmployed: raw.conclusionsEmployed ?? raw.conclusions_employed ?? raw.conclusions ?? raw.used_conclusions ?? [],
    };

    return DecisionGraphSchema.parse(normalized);
  }
}
