import { buildApplication } from '../src/runtime/container';
import { RuntimeContext } from '../src/shared/Contexts';
import { ILogger } from '../src/shared/Infrastructure';

const logger: ILogger = {
  info: (msg) => console.log(`✓ ${msg}`),
  warn: (msg) => console.warn(`⚠ ${msg}`),
  error: (msg, err) => console.error(`✗ ${msg}`, err)
};

const runtimeContext: RuntimeContext = {
  executionId: `exec-${Date.now()}`,
  mode: 'production',
  logger
};

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━\nContentCompiler Runtime Demo\n━━━━━━━━━━━━━━━━━━━━━━\n");
  
  const app = buildApplication();
  
  console.log("Triggering Application Service Pipeline...\n");
  const result = await app.runPipeline(
      runtimeContext,
      "Generate content about restaurant equipment"
  );
  
  if (result.isSuccess) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━\nPipeline Finished Successfully\n━━━━━━━━━━━━━━━━━━━━━━\n");
  } else {
    console.error("\nPipeline Failed:", result.error);
  }
}

main().catch(console.error);
