import { Component } from '../../domain/CompilationDomain';
import { OutputStructure, TargetIntent } from '../../domain/TargetDomain';
import { ComponentId, OutputStructureId } from '../../value_objects/Identity';
import { IClock } from '../../shared/Infrastructure';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';

function id(prefix: string): string { return `${prefix}-${Math.random().toString(36).substring(2, 9)}`; }
function version(): VersionMetadata { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(executionId: string, origin: string, clock: IClock): TraceRecord {
  return { executionId, origin, correlationId: executionId, timestamp: clock.now() };
}

export class ComponentFactory {
  constructor(private readonly clock: IClock) {}
  create(executionId: string, origin: string, type: string, content: string): Component {
    const now = this.clock.now();
    return new Component(new ComponentId(id('component')), version(), trace(executionId, origin, this.clock), now, now, type, content);
  }
}

export class OutputStructureFactory {
  constructor(private readonly clock: IClock) {}
  create(intent: TargetIntent, components: Component[]): OutputStructure {
    const now = this.clock.now();
    return new OutputStructure(
      new OutputStructureId(id('structure')), version(), trace(intent.executionId, 'CompilationService.compile', this.clock), now, now,
      intent.id, components.map(component => component.id)
    );
  }
}
