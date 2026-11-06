import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'slate';
  className?: string;
}

const toneMap: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-rose-100 text-rose-700',
  blue: 'bg-sky-100 text-sky-700',
  slate: 'bg-slate-800 text-white',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return <span className={`badge ${toneMap[tone]} ${className}`}>{children}</span>;
}

export function scoreTone(score: number): BadgeProps['tone'] {
  if (score >= 85) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 50) return 'amber';
  return 'red';
}

export function statusTone(status: string): BadgeProps['tone'] {
  switch (status) {
    case 'Qualified':
    case 'Closed':
    case 'Completed':
      return 'green';
    case 'New':
    case 'In Progress':
      return 'blue';
    case 'Callback':
    case 'Scheduled':
    case 'Waiting':
    case 'Queued':
      return 'amber';
    case 'Not Interested':
    case 'Missed':
    case 'Voicemail':
      return 'red';
    default:
      return 'neutral';
  }
}
