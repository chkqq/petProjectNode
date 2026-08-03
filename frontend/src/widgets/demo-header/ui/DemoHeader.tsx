import { Card } from '../../../shared/ui/Card';
import { StatusLine } from '../../../shared/ui/StatusLine';

interface DemoHeaderProps {
  accessTokenStatus: string;
  refreshTokenStatus: string;
  securityStatus: string;
}

export function DemoHeader({
  accessTokenStatus,
  refreshTokenStatus,
  securityStatus,
}: DemoHeaderProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
          Pet Project Node
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
          Demo frontend for NestJS REST API
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Show register, login, access token refresh, profile CRUD, avatars,
          cached users, balance transfer, soft-delete and background jobs.
        </p>
      </div>

      <Card>
        <div className="space-y-3">
          <StatusLine label="Access token" value={accessTokenStatus} />
          <StatusLine label="Refresh token" value={refreshTokenStatus} />
          <StatusLine label="Security" value={securityStatus} />
        </div>
      </Card>
    </section>
  );
}
