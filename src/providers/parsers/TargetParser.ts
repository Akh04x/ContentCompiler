import { z } from 'zod';
import { TargetIntentSchema } from './StructuredParser';

export class TargetParser {
  public static parse(data: unknown): z.infer<typeof TargetIntentSchema> {
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

    let formats = raw.formats ?? raw.target_formats ?? raw.format ?? [];
    if (!Array.isArray(formats) && typeof formats === 'string') formats = [formats];

    let channels = raw.channels ?? raw.target_channels ?? raw.channel ?? [];
    if (!Array.isArray(channels) && typeof channels === 'string') channels = [channels];

    // Field normalization / aliases
    const normalized = {
      title: raw.title ?? raw.intent_title ?? raw.name ?? raw.intent ?? `Intent ${Date.now()}`,
      formats: formats,
      channels: channels,
    };

    return TargetIntentSchema.parse(normalized);
  }
}
