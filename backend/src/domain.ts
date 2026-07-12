export type RunMode = 'pr' | 'discovery'
export type RunStatus = 'queued' | 'planning' | 'running' | 'reporting' | 'completed' | 'failed'

export interface Run {
  id: string
  mode: RunMode
  status: RunStatus
  targetUrl: string
  repository?: string
  pullRequest?: number
  email?: string
  model: { baseUrl: string; model: string }
  createdAt: string
  updatedAt: string
  error?: string
}

export interface RunRequested {
  type: 'run.requested'
  runId: string
}
