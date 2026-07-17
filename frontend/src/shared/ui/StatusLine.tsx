interface StatusLineProps {
  label: string;
  value: string;
}

export function StatusLine({ label, value }: StatusLineProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="truncate text-right text-sm font-semibold text-slate-100">
        {value}
      </span>
    </div>
  );
}
