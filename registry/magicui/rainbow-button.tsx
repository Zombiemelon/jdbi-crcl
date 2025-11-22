import * as React from 'react';

type Variant = 'solid' | 'outline';

export function RainbowButton({
  children,
  variant = 'solid',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const isOutline = variant === 'outline';
  return (
    <button
      className={[
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2 text-sm font-semibold transition',
        'focus:outline-none focus:ring-2 focus:ring-emerald-200/70 disabled:cursor-not-allowed disabled:opacity-60',
        'shadow-[0_10px_40px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_46px_rgba(99,102,241,0.35)] hover:-translate-y-[1px]',
        className
      ].join(' ')}
      {...props}
    >
      <span className="absolute inset-0 bg-[conic-gradient(from_120deg,theme(colors.emerald.400),theme(colors.sky.400),theme(colors.violet.500),theme(colors.pink.400),theme(colors.emerald.400))] blur-[1px] opacity-90 animate-[spin_8s_linear_infinite]" />
      <span
        className={[
          'absolute inset-[2px] rounded-full transition',
          isOutline ? 'bg-slate-900/85 border border-white/30' : 'bg-slate-900/90'
        ].join(' ')}
      />
      <span className="relative flex items-center gap-2 text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.25)] transition group-hover:shadow-[0_0_0_8px_rgba(16,185,129,0.35)]" />
        {children}
      </span>
    </button>
  );
}
