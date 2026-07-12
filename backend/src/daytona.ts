import { Daytona } from '@daytona/sdk'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { tmpdir } from 'node:os'
import type { ArtifactStore } from './artifacts.js'
import type { Config } from './config.js'
import type { Artifact, Finding, Run, TestResult } from './domain.js'
import { generatePlaywrightScript } from './generated-script.js'
import type { Executor } from './runner.js'

interface SandboxResult {
  results: TestResult[]
  findings: Finding[]
  artifacts: Array<{ kind: 'video' | 'screenshot' | 'trace'; path: string }>
}

export class DaytonaExecutor implements Executor {
  constructor(private readonly config: Config, private readonly store: ArtifactStore) {}
  async execute(run: Run) {
    if (!this.config.DAYTONA_API_KEY) throw new Error('DAYTONA_API_KEY is required for PR runs')
    const dir = await mkdtemp(join(tmpdir(), 'freebug-daytona-'))
    const script = generatePlaywrightScript(run)
    const localScript = join(dir, 'generated.spec.mjs')
    await writeFile(localScript, script)
    const artifacts: Artifact[] = [await this.store.saveFile(run.id, 'script', localScript)]
    const daytona = new Daytona({ apiKey: this.config.DAYTONA_API_KEY, apiUrl: this.config.DAYTONA_API_URL, target: this.config.DAYTONA_TARGET })
    const sandbox = await daytona.create(this.config.DAYTONA_SNAPSHOT
      ? { snapshot: this.config.DAYTONA_SNAPSHOT, ephemeral: true, labels: { freebugRun: run.id } }
      : { image: 'mcr.microsoft.com/playwright:v1.61.1-noble', ephemeral: true, labels: { freebugRun: run.id } }, { timeout: 300, onSnapshotCreateLogs: () => undefined })
    try {
      await sandbox.fs.createFolder('workspace/freebug', '755')
      await sandbox.fs.uploadFiles([
        { source: Buffer.from(script), destination: 'workspace/freebug/generated.spec.mjs' },
        { source: Buffer.from(JSON.stringify({ type: 'module', dependencies: { playwright: '1.61.1', '@axe-core/playwright': '4.12.1' } })), destination: 'workspace/freebug/package.json' },
      ])
      const install = await sandbox.process.executeCommand('npm install --omit=dev --no-audit --no-fund', 'workspace/freebug', undefined, 300)
      if (install.exitCode !== 0) throw new Error(`Sandbox dependency install failed: ${install.result}`)
      const execution = await sandbox.process.executeCommand('node generated.spec.mjs', 'workspace/freebug', undefined, 900)
      if (execution.exitCode !== 0) throw new Error(`Sandbox test process failed: ${execution.result}`)
      const result = JSON.parse((await sandbox.fs.downloadFile('workspace/freebug/results.json')).toString()) as SandboxResult
      for (const remote of result.artifacts) {
        const local = join(dir, basename(remote.path))
        await sandbox.fs.downloadFile(`workspace/freebug/${remote.path}`, local)
        artifacts.push(await this.store.saveFile(run.id, remote.kind, local))
      }
      return { results: result.results, findings: result.findings, artifacts }
    } finally {
      await daytona.delete(sandbox, 120).catch(() => undefined)
      await rm(dir, { recursive: true, force: true })
    }
  }
}

export class PrSandboxExecutor implements Executor {
  constructor(private readonly local: Executor, private readonly sandbox: Executor) {}
  execute(run: Run) { return run.mode === 'pr' ? this.sandbox.execute(run) : this.local.execute(run) }
}
