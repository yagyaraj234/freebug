import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { InMemoryEventBus } from './events.js'
import { MemoryRunStore } from './store.js'

const config = loadConfig()
const store = new MemoryRunStore()
const events = new InMemoryEventBus()
events.subscribe(async (event) => {
  if (event.type === 'run.requested') console.log(JSON.stringify({ message: 'run queued', runId: event.runId }))
})
const app = createApp({ config, store, events })
serve({ fetch: app.fetch, port: config.PORT }, (info) => console.log(`Freebug backend: http://localhost:${info.port}`))
