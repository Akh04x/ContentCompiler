import { ContentPackageFactory } from '../../../src/runtime/output/Factories';
import { ContentPackageValidator } from '../../../src/validators/EntityValidators';
import { ComponentFactory, OutputStructureFactory } from '../../../src/runtime/compilation/Factories';
import { GoalFactory, TargetIntentFactory } from '../../../src/runtime/target/Factories';
import { GoalPriority, GoalPriorityEnum, TargetFormat, TargetFormatEnum } from '../../../src/value_objects/TargetVOs';
import { ContentPackageStatus, ContentPackageStatusEnum } from '../../../src/value_objects/OutputVOs';

const clock = { now: () => 1000 };
function parts() {
  const goal = new GoalFactory(clock).create('exec-1', 'test', 'Awareness', new GoalPriority(GoalPriorityEnum.High));
  const intent = new TargetIntentFactory(clock).create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), [{ value: 'dec-1' } as any]);
  const component = new ComponentFactory(clock).create('exec-1', 'test', 'Goal', 'Awareness');
  return { component, structure: new OutputStructureFactory(clock).create(intent, [component]) };
}

describe('ContentPackage validators', () => {
  it('requires every structure component to be present', () => {
    const { structure } = parts();
    const contentPackage = new ContentPackageFactory(clock).create(structure, [], new ContentPackageStatus(ContentPackageStatusEnum.Draft));
    expect(new ContentPackageValidator().validate(contentPackage).isValid).toBe(false);
  });

  it('enforces package lifecycle order', () => {
    const { component, structure } = parts();
    const factory = new ContentPackageFactory(clock);
    const draft = factory.create(structure, [component], new ContentPackageStatus(ContentPackageStatusEnum.Draft));
    const invalid = factory.transitionTo(draft, new ContentPackageStatus(ContentPackageStatusEnum.Validated), null, null);
    expect(new ContentPackageValidator().validateTransition(draft, invalid).isValid).toBe(false);
  });
});
