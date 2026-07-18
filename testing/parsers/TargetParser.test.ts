import { TargetParser } from '../../src/providers/parsers/TargetParser';

describe('TargetParser', () => {
  it('parses valid output according to schema directly', () => {
    const data = {
      title: 'target 1',
      formats: ['video'],
      channels: ['tiktok']
    };
    const result = TargetParser.parse(data);
    expect(result.title).toBe('target 1');
    expect(result.formats).toEqual(['video']);
  });

  it('maps aliases correctly', () => {
    const data = {
      intent_title: 'alias target',
      target_formats: 'video',
      channel: 'youtube'
    };
    const result = TargetParser.parse(data);
    expect(result.title).toBe('alias target');
    expect(result.formats).toEqual(['video']);
    expect(result.channels).toEqual(['youtube']);
  });
});
