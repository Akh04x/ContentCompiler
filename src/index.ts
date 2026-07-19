import 'dotenv/config';
import { ConfigLoader } from './providers/config/ProviderConfig';
import { buildApplication } from './runtime/container';
import { RuntimeContext } from './shared/Contexts';
import { ILogger } from './shared/Infrastructure';

const logger: ILogger = {
  info: (msg) => console.log('\x1b[32m%s\x1b[0m', `  ✓ ${msg}`),
  warn: (msg) => console.warn('\x1b[33m%s\x1b[0m', `  ⚠ ${msg}`),
  error: (msg, err) => console.error('\x1b[31m%s\x1b[0m', `  ✗ ${msg}`, err || '')
};

const runtimeContext: RuntimeContext = {
  executionId: `bootstrap-${Date.now()}`,
  mode: 'production',
  logger
};

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━\n ContentCompiler Runtime\n━━━━━━━━━━━━━━━━━━━━━━\n");
  
  const config = ConfigLoader.loadFromEnv();
  console.log(`🔧 Configured Provider: ${config.provider} (Model: ${config.model})`);
  const app = buildApplication(config);
  
  const trigger = "Create a TikTok video about commercial espresso machines.";
  console.log(`Starting pipeline for target: "${trigger}"\n`);
  
  const result = await app.runPipeline(
      runtimeContext,
      trigger
  );
  
  if (result.isSuccess) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━\n Pipeline Finished Successfully\n━━━━━━━━━━━━━━━━━━━━━━\n");
  } else {
    // Check if it's the specific logic flow from testing/design
    if (result.error && typeof result.error.message === 'string' && result.error.message.includes('yielded')) {
      console.log("\nPIPELINE YIELDED\nWaiting for Human Approval...\n");
    } else {
      console.error(`\nPipeline Failed:`, result.error);
    }
  }
}

main().catch(console.error);
