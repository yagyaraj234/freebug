import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CircleCheck, ExternalLink, Github, Lock } from 'lucide-react';
import {
  githubInstallUrl,
  listRepos,
  listRuns,
  logout,
  me,
  saveInstallation,
  type AuthUser,
  type Repo,
  type Run,
} from '../lib/auth';

export const Route = createFileRoute('/dashboard')({
  validateSearch: (search: Record<string, unknown>): { installation_id?: string } =>
    typeof search.installation_id === 'string' || typeof search.installation_id === 'number'
      ? { installation_id: String(search.installation_id) }
      : {},
  component: DashboardPage,
});

const STATUS_COLORS: Record<string, string> = {
  passed: '#2F8F5B',
  failed: '#C23B4B',
  running: '#2B4BF2',
  queued: '#8A92C0',
};

function DashboardPage() {
  const navigate = useNavigate();
  const { installation_id } = Route.useSearch();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [installUrl, setInstallUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [githubError, setGithubError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let current = await me();
      if (!current) {
        navigate({ to: '/login' });
        return;
      }
      if (installation_id) {
        await saveInstallation(installation_id).catch(() => {});
        current = (await me()) ?? current;
        navigate({ to: '/dashboard', replace: true });
      }
      if (cancelled) return;
      setUser(current);
      if (current.githubInstallationId) {
        const [repoList, runList] = await Promise.all([
          listRepos().catch(() => {
            setGithubError('Could not load repositories from GitHub.');
            return [];
          }),
          listRuns().catch(() => []),
        ]);
        if (cancelled) return;
        setRepos(repoList);
        setRuns(runList);
      } else {
        const url = await githubInstallUrl().catch(() => {
          setGithubError('GitHub App is not configured on the server.');
          return '';
        });
        if (cancelled) return;
        setInstallUrl(url);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [installation_id, navigate]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="fb-mono text-[11px] tracking-[2px] text-[#8A92C0] uppercase">
          Loading…
        </p>
      </main>
    );
  }

  const connected = Boolean(user.githubInstallationId);

  return (
    <main className="px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="fb-mono mb-2 text-[11px] tracking-[2px] text-[#8A92C0] uppercase">
              Dashboard
            </p>
            <h1 className="fb-serif m-0 text-[2rem] leading-[1.15] text-[#131B4D]">
              Welcome, {user.name.split(' ')[0]}.
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: '/login' });
            }}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-[#131B4D] transition hover:bg-black/5">
            Log out
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* GitHub connection */}
          <section className="fb-bento-card bg-[#EEF2FE] p-8">
            <div className="flex items-center gap-3">
              <Github size={20} className="text-[#131B4D]" />
              <h2 className="fb-serif m-0 text-xl text-[#131B4D]">GitHub</h2>
              {connected && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2F8F5B]">
                  <CircleCheck size={14} /> Connected
                </span>
              )}
            </div>

            {connected ? (
              <>
                <p className="mt-3 text-sm leading-relaxed text-[#545C8C]">
                  Every pull request in these repositories gets tested
                  automatically.
                </p>
                {githubError && (
                  <p className="mt-3 text-[13px] text-[#C23B4B]" role="alert">
                    {githubError}
                  </p>
                )}
                <ul className="mt-4 space-y-2 p-0">
                  {repos.map(repo => (
                    <li
                      key={repo.fullName}
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-[#131B4D]">
                      <span className="font-medium">{repo.fullName}</span>
                      {repo.private && (
                        <Lock size={13} className="text-[#8A92C0]" />
                      )}
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-[#8A92C0] transition hover:text-[#2B4BF2]"
                        aria-label={`Open ${repo.fullName} on GitHub`}>
                        <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                  {repos.length === 0 && !githubError && (
                    <li className="rounded-xl bg-white px-4 py-3 text-sm text-[#545C8C]">
                      No repositories in this installation yet.
                    </li>
                  )}
                </ul>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-[#545C8C]">
                  Install the GitHub App on your repositories. Once connected,
                  every PR triggers a test run with video evidence.
                </p>
                {githubError ? (
                  <p className="mt-4 text-[13px] text-[#C23B4B]" role="alert">
                    {githubError}
                  </p>
                ) : (
                  <a
                    href={installUrl}
                    className="fb-cta-glow fb-press mt-5 inline-flex items-center gap-2 rounded-full bg-[#2B4BF2] px-6 py-3 text-sm font-semibold text-white no-underline transition hover:brightness-95">
                    <Github size={15} /> Connect GitHub
                  </a>
                )}
              </>
            )}
          </section>

          {/* Runs */}
          <section className="fb-bento-card bg-white p-8">
            <h2 className="fb-serif m-0 text-xl text-[#131B4D]">Recent runs</h2>
            {runs.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-[#545C8C]">
                No runs yet.{' '}
                {connected
                  ? 'Open a pull request in a connected repository to start one.'
                  : 'Connect GitHub to start testing your pull requests.'}
              </p>
            ) : (
              <ul className="mt-4 space-y-2 p-0">
                {runs.map(run => (
                  <li
                    key={run.id}
                    className="flex items-center gap-3 rounded-xl border border-black/5 px-4 py-3 text-sm">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background: STATUS_COLORS[run.status] ?? '#8A92C0',
                      }}
                    />
                    <span className="font-medium text-[#131B4D]">
                      {run.repository ?? run.targetUrl}
                      {run.pullRequest ? ` #${run.pullRequest}` : ''}
                    </span>
                    <span className="fb-mono ml-auto text-[11px] uppercase text-[#8A92C0]">
                      {run.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
