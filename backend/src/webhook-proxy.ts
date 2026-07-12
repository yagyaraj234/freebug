import 'dotenv/config';
import SmeeClient from 'smee-client';
import { loadConfig } from './config.js';

const config = loadConfig();

if (!config.GITHUB_WEBHOOK_PROXY_URL) {
  throw new Error('GITHUB_WEBHOOK_PROXY_URL is required');
}

const relay = new SmeeClient({
  source: config.GITHUB_WEBHOOK_PROXY_URL,
  target: `http://127.0.0.1:${config.PORT}/v1/github/webhook`,
});

await relay.start();
console.log('RunzaAI GitHub webhook relay connected');

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    await relay.stop();
    process.exit(0);
  });
}
