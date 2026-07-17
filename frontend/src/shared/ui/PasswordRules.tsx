import { getPasswordChecks } from '../lib/password';

interface PasswordRulesProps {
  password: string;
}

export function PasswordRules({ password }: PasswordRulesProps) {
  const checks = getPasswordChecks(password);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-300">
        Требования backend к паролю:
      </p>
      <div className="flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              check.passed
                ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25'
                : 'bg-white/5 text-slate-400 ring-1 ring-white/10'
            }`}
          >
            {check.passed ? '✓' : '•'} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
