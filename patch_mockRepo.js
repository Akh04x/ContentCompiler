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

// It might be that the last args is mockClock, wait it looks like in my replace:
// Wait, I replaced it before but maybe the constructor order is different. Let's see:
// constructor(decisionFactory, graphFactory, decisionRepo, graphRepo, decisionValidator, graphValidator, candidateConclusionValidator, clock)
// Let's re-do the replacement just to be sure
