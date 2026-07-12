import type { Run } from './domain.js'

export interface RunStore {
  create(run: Run): Promise<void>
  get(id: string): Promise<Run | undefined>
  update(id: string, patch: Partial<Run>): Promise<Run>
}

export class MemoryRunStore implements RunStore {
  private readonly runs = new Map<string, Run>()
  async create(run: Run) { this.runs.set(run.id, structuredClone(run)) }
  async get(id: string) { const run = this.runs.get(id); return run ? structuredClone(run) : undefined }
  async update(id: string, patch: Partial<Run>) {
    const current = this.runs.get(id)
    if (!current) throw new Error(`Run ${id} not found`)
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() }
    this.runs.set(id, updated)
    return structuredClone(updated)
  }
}
