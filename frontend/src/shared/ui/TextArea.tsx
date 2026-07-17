interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>
      <textarea
        className="min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300"
        value={value}
        maxLength={1000}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
