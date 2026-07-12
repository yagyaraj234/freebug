export interface User {
  email: string
  name: string
  passwordHash: string
  githubInstallationId?: string
  createdAt: string
}

export interface UserStore {
  create(user: User): Promise<{ created: boolean }>
  getByEmail(email: string): Promise<User | undefined>
  setInstallation(email: string, installationId: string): Promise<void>
  getByInstallation(installationId: string): Promise<User | undefined>
}

export class MemoryUserStore implements UserStore {
  private readonly users = new Map<string, User>()
  async create(user: User) {
    if (this.users.has(user.email)) return { created: false }
    this.users.set(user.email, { ...user })
    return { created: true }
  }
  async getByEmail(email: string) {
    const user = this.users.get(email)
    return user ? { ...user } : undefined
  }
  async setInstallation(email: string, installationId: string) {
    const user = this.users.get(email)
    if (!user) throw new Error(`User ${email} not found`)
    user.githubInstallationId = installationId
  }
  async getByInstallation(installationId: string) {
    for (const user of this.users.values())
      if (user.githubInstallationId === installationId) return { ...user }
    return undefined
  }
}

export class ConvexUserStore implements UserStore {
  constructor(private readonly url: string, private readonly secret: string) {}
  private async call<T>(kind: 'query' | 'mutation', path: string, args: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.url.replace(/\/$/, '')}/api/${kind}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, args: { ...args, secret: this.secret }, format: 'json' }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`Convex returned ${response.status}`)
    const payload = await response.json() as { status: 'success' | 'error'; value?: T; errorMessage?: string }
    if (payload.status !== 'success') throw new Error(payload.errorMessage ?? 'Convex call failed')
    return payload.value as T
  }
  async create(user: User) {
    return this.call<{ created: boolean }>('mutation', 'users:create', { ...user })
  }
  async getByEmail(email: string) {
    return (await this.call<User | null>('query', 'users:getByEmail', { email })) ?? undefined
  }
  async setInstallation(email: string, installationId: string) {
    await this.call('mutation', 'users:setInstallation', { email, installationId })
  }
  async getByInstallation(installationId: string) {
    return (await this.call<User | null>('query', 'users:getByInstallation', { installationId })) ?? undefined
  }
}
