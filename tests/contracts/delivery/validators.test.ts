import { DeliveryArtifactFactory } from '../../../src/runtime/delivery/Factories';
import { DeliveryArtifactValidator } from '../../../src/validators/EntityValidators';
import { ContentPackageId, PlatformId } from '../../../src/value_objects/Identity';

const clock = { now: () => 1000 };

describe('Delivery validators', () => {
  it('validates a valid DeliveryArtifact', () => {
    const factory = new DeliveryArtifactFactory(clock);
    const artifact = factory.create(
      new ContentPackageId('cp-1'), 
      new PlatformId('plat-1'), 
      'ext-ref-1', 
      'exec-1'
    );
    const result = new DeliveryArtifactValidator().validate(artifact);
    expect(result.isValid).toBe(true);
  });
});
