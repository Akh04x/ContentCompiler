const fs = require('fs');
let code = fs.readFileSync('tests/integration/pipeline_orchestrator.test.ts', 'utf8');

const correctText = `    const decisionService = new DecisionService(
      decisionFactory,
      decisionFactory as any,
      mockRepo,
      mockRepo,
      decisionValidator,
      decisionValidator as any,
      conclusionValidator,
      mockClock
    );`;

code = code.replace(/const decisionService = new DecisionService\([^\)]+\);/g, correctText);

fs.writeFileSync('tests/integration/pipeline_orchestrator.test.ts', code);
