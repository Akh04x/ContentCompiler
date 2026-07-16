const fs = require('fs');
let code = fs.readFileSync('tests/integration/pipeline_orchestrator.test.ts', 'utf8');

const importReplacement = `import { DecisionValidator, DecisionGraphValidator } from '../../src/validators/EntityValidators';`;
code = code.replace(/import { DecisionValidator } from '\.\.\/\.\.\/src\/validators\/EntityValidators';/, importReplacement);

const graphCreation = `const decisionFactory = new DecisionFactory(mockClock);
    const decisionValidator = new DecisionValidator();
    const bgValidator = new DecisionGraphValidator(); // Added line`;

code = code.replace(/const decisionFactory = new DecisionFactory\(mockClock\);\s*const decisionValidator = new DecisionValidator\(\);/, graphCreation);

const decisionServiceArgs = `    const decisionService = new DecisionService(
      decisionFactory,
      decisionFactory as any /* graphFactory */,
      mockRepo,
      mockRepo,
      decisionValidator,
      bgValidator,
      conclusionValidator,
      mockClock
    );`;

code = code.replace(/const decisionService = new DecisionService\([\s\S]+? mockClock\n    \);/, decisionServiceArgs);

fs.writeFileSync('tests/integration/pipeline_orchestrator.test.ts', code);
