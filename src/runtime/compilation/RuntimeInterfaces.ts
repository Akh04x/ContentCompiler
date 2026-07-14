import { Component } from '../../domain/CompilationDomain';

export interface IComponentFactory { create(...args: any[]): Component; }
export interface IComponentSerializer { serialize(entity: Component): string; deserialize(data: string): Component; }
