import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 shadow-soft">
      {children}
    </div>
  );
}
