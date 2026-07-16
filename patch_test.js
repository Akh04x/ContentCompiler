const fs = require('fs');
let code = fs.readFileSync('tests/integration/pipeline_orchestrator.test.ts', 'utf8');

const decisionServiceArgs = `decisionFactory,
      decisionFactory as any /* graphFactory */,
      mockRepo,
      mockRepo,
      decisionValidator,
      decisionValidator as any /* graphValidator */,
      conclusionValidator,
      mockClock`;

const outputServiceArgs = `outputFactory,
      mockRepo,
      compValidator,
      componentValidator,
      outputValidator,
      mockClock`;

const compilationServiceArgs = `componentFactory, compFactory, mockRepo, mockRepo, componentValidator, compValidator, targetValidator`;

code = code.replace(
  'const decisionService = new DecisionService(decisionFactory, mockRepo, decisionValidator);',
  `const decisionService = new DecisionService(${decisionServiceArgs});`
);

code = code.replace(
  'const outputService = new OutputService(outputFactory, mockRepo, outputValidator);',
  `const outputService = new OutputService(${outputServiceArgs});`
);

fs.writeFileSync('tests/integration/pipeline_orchestrator.test.ts', code);
