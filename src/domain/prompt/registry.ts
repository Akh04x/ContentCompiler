import { PromptRegistry, PromptTemplate } from './types';

export class InMemoryPromptRegistry implements PromptRegistry {
  // Map of id -> map of version -> PromptTemplate
  private templates: Map<string, Map<string, PromptTemplate>> = new Map();

  public registerTemplate(template: PromptTemplate): void {
    let versionMap = this.templates.get(template.id);
    if (!versionMap) {
      versionMap = new Map();
      this.templates.set(template.id, versionMap);
    }
    
    if (versionMap.has(template.version)) {
      throw new Error(`Template ${template.id} version ${template.version} is already registered`);
    }

    versionMap.set(template.version, template);
  }

  public getTemplate(id: string, version?: string): PromptTemplate | undefined {
    const versionMap = this.templates.get(id);
    if (!versionMap) {
      return undefined;
    }

    if (version) {
      return versionMap.get(version);
    }

    // Return the latest version (lexicographically or by tracking max semver. for now taking the "last" one inserted or simple sort)
    // In a real semver system we'd use a semver library to pick the highest.
    // For this minimal setup, we just sort them string-wise or take the last
    const sortedVersions = Array.from(versionMap.keys()).sort();
    const latestVersion = sortedVersions[sortedVersions.length - 1];
    
    if (!latestVersion) {
        return undefined;
    }
    return versionMap.get(latestVersion);
  }
}
