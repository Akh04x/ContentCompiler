import * as fs from 'fs';
import * as path from 'path';

describe('Architecture Dependency Rules', () => {
  const srcDir = path.resolve(__dirname, '../../src');

  function getFiles(dir: string, files: string[] = []): string[] {
    if (!fs.existsSync(dir)) return files;
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
      const name = path.join(dir, file);
      if (fs.statSync(name).isDirectory()) {
        getFiles(name, files);
      } else if (name.endsWith('.ts')) {
        files.push(name);
      }
    }
    return files;
  }

  function getImports(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Support multi-line imports and exports by matching across newlines
    // \s refers to any whitespace including newlines
    const importRegex = /import\s+(?:type\s+)?[\s\S]*?from\s+['"]([^'"]+)['"]/g;
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const exportFromRegex = /export\s+(?:type\s+)?[\s\S]*?from\s+['"]([^'"]+)['"]/g;
    const importSideEffectRegex = /import\s+['"]([^'"]+)['"]/g; // e.g. import "polyfills"
    
    const imports: string[] = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) imports.push(match[1]);
    while ((match = dynamicImportRegex.exec(content)) !== null) imports.push(match[1]);
    while ((match = exportFromRegex.exec(content)) !== null) imports.push(match[1]);
    while ((match = importSideEffectRegex.exec(content)) !== null) imports.push(match[1]);
    return imports;
  }

  function getResolvedImportParts(filePath: string, importPath: string): string[] | null {
    if (!importPath.startsWith('.')) return null; 
    const resolved = path.resolve(path.dirname(filePath), importPath);
    const relativeToSrc = path.relative(srcDir, resolved);
    // Return early if the import resolves outside of `src`
    if (relativeToSrc.startsWith('..')) return null;

    return relativeToSrc.split(path.sep);
  }

  it('domain/ MUST NOT depend on runtime/, validators/, or pipelines/', () => {
    const domainFiles = getFiles(path.join(srcDir, 'domain'));
    for (const file of domainFiles) {
      const imports = getImports(file);
      for (const imp of imports) {
        const parts = getResolvedImportParts(file, imp);
        if (parts) {
          const topLevel = parts[0];
          if (['runtime', 'validators', 'pipelines'].includes(topLevel)) {
            throw new Error(`Architectural Violation in ${file}: Domain layer cannot depend on ${topLevel} (importing '${imp}')`);
          }
        }
      }
    }
  });

  it('contracts/ MUST NOT depend on runtime/ or pipelines/', () => {
    const contractFiles = getFiles(path.join(srcDir, 'contracts'));
    for (const file of contractFiles) {
      const imports = getImports(file);
      for (const imp of imports) {
        const parts = getResolvedImportParts(file, imp);
        if (parts) {
          const topLevel = parts[0];
          if (['runtime', 'pipelines'].includes(topLevel)) {
            throw new Error(`Architectural Violation in ${file}: Contracts layer cannot depend on ${topLevel} (importing '${imp}')`);
          }
        }
      }
    }
  });

  it('A layer within runtime/ MUST NOT directly depend on another layer within runtime/', () => {
    const runtimeDir = path.join(srcDir, 'runtime');
    const runtimeLayers = fs.existsSync(runtimeDir) ? fs.readdirSync(runtimeDir).filter(f => fs.statSync(path.join(runtimeDir, f)).isDirectory()) : [];

    for (const layer of runtimeLayers) {
      const layerFiles = getFiles(path.join(runtimeDir, layer));
      for (const file of layerFiles) {
        const imports = getImports(file);
        for (const imp of imports) {
          const parts = getResolvedImportParts(file, imp);
          if (parts && parts[0] === 'runtime') {
            const importedLayer = parts[1];
            if (importedLayer && importedLayer !== layer && runtimeLayers.includes(importedLayer)) {
              throw new Error(`Architectural Violation in ${file}: Runtime layer '${layer}' cannot directly depend on another runtime layer '${importedLayer}' (importing '${imp}')`);
            }
          }
        }
      }
    }
  });
  
  it('validators/ MUST NOT depend on runtime/ or pipelines/', () => {
    const validatorFiles = getFiles(path.join(srcDir, 'validators'));
    for (const file of validatorFiles) {
      const imports = getImports(file);
      for (const imp of imports) {
        const parts = getResolvedImportParts(file, imp);
        if (parts) {
          const topLevel = parts[0];
          if (['runtime', 'pipelines'].includes(topLevel)) {
            throw new Error(`Architectural Violation in ${file}: Validators layer cannot depend on ${topLevel} (importing '${imp}')`);
          }
        }
      }
    }
  });
});
