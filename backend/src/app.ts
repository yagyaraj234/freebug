import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import type { Config } from './config.js'
import type { EventBus } from './events.js'
import { verifyGitHubSignature, type PullRequestWebhook } from './github.js'
import type { Run } from './domain.js'
import type { RunStore } from './store.js'

const CreateRunSchema = z.object({
  mode: z.enum(['pr', 'discovery']),
  targetUrl: z.string().url(),
  repository: z.string().optional(),
  pullRequest: z.number().int().positive().optional(),
  email: z.string().email().optional(),
  model: z.object({ baseUrl: z.string().url(), model: z.string().min(1) }).optional(),
})

export function createApp(deps: { config: Config; store: RunStore; events: EventBus }) {
  const app = new Hono()
  app.use('*', cors())
  app.get('/health', (c) => c.json({ status: 'ok' }))

  app.post('/v1/runs', async (c) => {
    const parsed = CreateRunSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) return c.json({ error: 'invalid_request', details: parsed.error.flatten() }, 400)
    const now = new Date().toISOString()
    const run: Run = {
      id: randomUUID(), mode: parsed.data.mode, status: 'queued', targetUrl: parsed.data.targetUrl,
      repository: parsed.data.repository, pullRequest: parsed.data.pullRequest, email: parsed.data.email,
      model: parsed.data.model ?? { baseUrl: deps.config.OPENAI_BASE_URL, model: deps.config.OPENAI_MODEL },
      createdAt: now, updatedAt: now,
    }
    await deps.store.create(run)
    await deps.events.publish({ type: 'run.requested', runId: run.id })
    return c.json({ run, statusUrl: `${deps.config.PUBLIC_BASE_URL}/v1/runs/${run.id}` }, 202)
  })

  app.get('/v1/runs/:id', async (c) => {
    const run = await deps.store.get(c.req.param('id'))
    return run ? c.json({ run }) : c.json({ error: 'not_found' }, 404)
  })

  app.post('/v1/github/webhook', async (c) => {
    const raw = await c.req.text()
    if (!verifyGitHubSignature(raw, c.req.header('x-hub-signature-256'), deps.config.GITHUB_WEBHOOK_SECRET)) {
      return c.json({ error: 'invalid_signature' }, 401)
    }
    if (c.req.header('x-github-event') !== 'pull_request') return c.json({ accepted: false, reason: 'ignored_event' })
    const payload = JSON.parse(raw) as PullRequestWebhook
    if (!['opened', 'reopened', 'synchronize'].includes(payload.action)) return c.json({ accepted: false, reason: 'ignored_action' })
    return c.json({ accepted: true, repository: payload.repository.full_name, pullRequest: payload.pull_request.number }, 202)
  })
  return app
}
