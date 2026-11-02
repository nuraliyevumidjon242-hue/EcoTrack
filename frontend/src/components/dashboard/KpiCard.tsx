import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  badge?: {
    text: string;
    variant: 'optimal' | 'warning' | 'critical' | 'neutral';
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon: Icon, badge }) => {
  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case 'optimal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2.5 rounded-xl bg-eco-500/10 text-eco-400 border border-eco-500/20">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</span>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getBadgeStyle()}`}>
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
