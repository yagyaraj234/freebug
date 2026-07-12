# Freebug backend

Hono control-plane API for autonomous test runs. The user may supply any OpenAI-compatible base URL and model name. The API publishes run requests behind an event-bus interface; the in-memory adapter is for local development and will be replaced by Redis/NATS in deployed workers.

## Run

```bash
cp .env.example .env
npm install
npm test
npm run build
npm run dev
```

Create a discovery run:

```bash
curl -X POST http://localhost:3001/v1/runs -H 'content-type: application/json' -d '{"mode":"discovery","targetUrl":"https://example.com","email":"owner@example.com","model":{"baseUrl":"https://your-provider.example/v1","model":"your-model"}}'
```

GitHub App webhook endpoint: `POST /v1/github/webhook`. Configure the GitHub App with Pull requests read access, Checks write access, and pull-request webhooks. Production work remains: persistent PostgreSQL run storage, Redis/NATS adapter, GitHub installation auth/check runs, isolated Playwright VM workers, S3 video/trace storage, and SMTP delivery.
