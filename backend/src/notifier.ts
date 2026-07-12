import nodemailer from 'nodemailer'
import type { Run } from './domain.js'
import type { GitHubApp } from './github-app.js'
export interface Notifier { sendCompleted(run: Run): Promise<void> }
export class ConsoleNotifier implements Notifier {
  async sendCompleted(run: Run) { console.log(JSON.stringify({ message: 'run completed', runId: run.id, email: run.email, reportUrl: run.reportUrl })) }
}
export class SmtpNotifier implements Notifier {
  private readonly transport
  constructor(url: string, private readonly from: string) { this.transport = nodemailer.createTransport(url) }
  async sendCompleted(run: Run) {
    if (!run.email) return
    const failed = run.results?.filter((result) => result.status === 'failed').length ?? 0
    await this.transport.sendMail({ from: this.from, to: run.email, subject: `Freebug run ${run.status}: ${failed} failed`, text: `Run: ${run.id}\nStatus: ${run.status}\nFailed tests: ${failed}\nReport: ${run.reportUrl ?? 'not available'}` })
  }
}

const buildPrComment = (run: Run) => {
  const failed = run.results?.filter(result => result.status === 'failed').length ?? 0
  const total = run.results?.length ?? 0
  const videos = run.artifacts?.filter(artifact => artifact.kind === 'video') ?? []
  const lines = [
    '## Freebug test report',
    '',
    `**Status:** ${run.status} — ${failed}/${total} tests failed`,
    run.reportUrl ? `**Full report:** ${run.reportUrl}` : '',
    ...videos.map((video, index) => `**Video${videos.length > 1 ? ` ${index + 1}` : ''}:** ${video.url}`),
  ].filter(Boolean)
  return lines.join('\n')
}

export class GitHubCommentNotifier implements Notifier {
  constructor(private readonly inner: Notifier, private readonly githubApp: GitHubApp) {}
  async sendCompleted(run: Run) {
    await this.inner.sendCompleted(run)
    if (run.mode !== 'pr' || !run.repository || !run.pullRequest || !run.installationId) return
    await this.githubApp
      .createIssueComment(run.installationId, run.repository, run.pullRequest, buildPrComment(run))
      .catch(error => console.error('github_comment_failed', { runId: run.id, error: error instanceof Error ? error.message : String(error) }))
  }
}
