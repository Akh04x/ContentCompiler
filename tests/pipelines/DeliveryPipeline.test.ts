import { DeliveryPipeline } from '../../src/pipelines/DeliveryPipeline';
import { DeliveryService } from '../../src/runtime/delivery/DeliveryService';
import { ContentPackage } from '../../src/domain/CompilationDomain';
import { RuntimeContext } from '../../src/shared/Contexts';
import { ContentPackageId, PlatformId } from '../../src/value_objects/Identity';
import { Result, Success } from '../../src/shared/Result';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs to avoid real disk writes
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined)
}));

describe('DeliveryPipeline', () => {
  let mockService: any;
  let pipeline: DeliveryPipeline;
  let context: RuntimeContext;
  let mockPackage: ContentPackage;

  beforeEach(() => {
    mockService = {
      deliverPackage: jest.fn().mockResolvedValue(new Success({ id: { value: 'art-1' } }))
    };
    pipeline = new DeliveryPipeline(mockService as any);
    context = { executionId: 'exec-1', mode: 'mock', logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } };
    mockPackage = {
      id: new ContentPackageId('pkg-123'),
      version: { currentVersion: '1.0.0' },
      trace: { executionId: 'exec-1' }
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should write ContentPackage to disk and call DeliveryService', async () => {
    const result = await pipeline.deliver(context, mockPackage);
    
    expect(result.isSuccess).toBe(true);
    
    // Check if mkdir was called correctly
    expect(fs.mkdir).toHaveBeenCalledWith(path.join(process.cwd(), 'deliveries'), { recursive: true });
    
    // Check if writeFile was called correctly
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(process.cwd(), 'deliveries', 'pkg-123.json'),
      JSON.stringify(mockPackage, null, 2),
      'utf-8'
    );
    
    // Check if service was called
    expect(mockService.deliverPackage).toHaveBeenCalledWith(context, mockPackage);
  });

  it('should return Failure if disk writing fails', async () => {
    (fs.writeFile as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));

    const result = await pipeline.deliver(context, mockPackage);
    
    expect(result.isSuccess).toBe(false);
    expect((result as any).error.message).toBe('Disk full');
    
    // Ensure service is not called if writing fails
    expect(mockService.deliverPackage).not.toHaveBeenCalled();
  });
});
