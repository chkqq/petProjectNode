interface EmptyStateProps {
  text: string;
}

export function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-400">
      {text}
    </div>
  );
}
