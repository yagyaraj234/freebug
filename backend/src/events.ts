import type { RunRequested } from './domain.js'

export type PipelineEvent = RunRequested
export type EventHandler = (event: PipelineEvent) => Promise<void>

export interface EventBus {
  publish(event: PipelineEvent): Promise<void>
  subscribe(handler: EventHandler): () => void
}

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Set<EventHandler>()
  async publish(event: PipelineEvent) {
    await Promise.all([...this.handlers].map((handler) => handler(event)))
  }
  subscribe(handler: EventHandler) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }
}
