import { z } from 'zod';
import { CompilationStructureSchema } from './StructuredParser';

export class CompilationParser {
  public static parse(data: unknown): z.infer<typeof CompilationStructureSchema> {
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
      content: raw.content ?? raw.body ?? raw.text ?? raw.compiled_content ?? '',
      format: raw.format ?? raw.structure_format ?? raw.type ?? 'markdown',
      metadata: raw.metadata ?? raw.meta ?? raw.properties ?? {},
    };

    return CompilationStructureSchema.parse(normalized);
  }
}
