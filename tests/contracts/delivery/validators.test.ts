import { PlatformFactory, DeliveryArtifactFactory } from '../../../src/runtime/delivery/Factories';
import { PlatformValidator } from '../../../src/validators/EntityValidators';

const clock = { now: () => 1000 };

describe('Delivery validators', () => {
  it('requires a platform name', () => {
    const platform = new PlatformFactory(clock).create('exec-1', '');
    const result = new PlatformValidator().validate(platform);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Platform name cannot be empty');
  });
});
