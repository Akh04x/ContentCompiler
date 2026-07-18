import { DecisionStatus, DecisionStatusEnum, ApprovalStatus, ApprovalStatusEnum, PublicationStatus, PublicationStatusEnum, DecisionVersion, DecisionContext, ApprovalRecord, DecisionReason, DecisionOutcome } from '../../../src/value_objects/DecisionVOs';

describe('Decision Value Objects', () => {
  it('should validate DecisionStatus', () => {
    const status = new DecisionStatus(DecisionStatusEnum.Draft);
    expect(status.status).toBe(DecisionStatusEnum.Draft);
    expect(() => new DecisionStatus('Invalid' as any)).toThrow();
  });

  it('should validate ApprovalStatus', () => {
    const status = new ApprovalStatus(ApprovalStatusEnum.Pending);
    expect(status.status).toBe(ApprovalStatusEnum.Pending);
    expect(() => new ApprovalStatus('Invalid' as any)).toThrow();
  });

  it('should validate PublicationStatus', () => {
    const status = new PublicationStatus(PublicationStatusEnum.Published);
    expect(status.status).toBe(PublicationStatusEnum.Published);
    expect(() => new PublicationStatus('Invalid' as any)).toThrow();
  });

  it('should validate DecisionVersion', () => {
    const v1 = new DecisionVersion(1, 0, 0);
    const v2 = new DecisionVersion(1, 0, 0);
    expect(v1.equals(v2)).toBe(true);
    expect(() => new DecisionVersion(-1, 0, 0)).toThrow();
  });

  it('should validate DecisionContext', () => {
    const ctx = new DecisionContext('exec-1', { env: 'prod' });
    expect(ctx.executionId).toBe('exec-1');
    expect(() => new DecisionContext('', {})).toThrow();
  });

  it('should validate ApprovalRecord', () => {
    const status = new ApprovalStatus(ApprovalStatusEnum.Approved);
    const record = new ApprovalRecord('user-1', 12345, status, 'LGTM');
    expect(record.approverId).toBe('user-1');
    expect(() => new ApprovalRecord('', 12345, status, '')).toThrow();
  });
});
