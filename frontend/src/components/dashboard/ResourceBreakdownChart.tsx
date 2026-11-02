import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ResourceSummaryItem } from '../../types';

interface ResourceBreakdownChartProps {
  data: ResourceSummaryItem[];
}

const COLORS = ['#22c55e', '#0ea5e9', '#a855f7', '#f59e0b'];

export const ResourceBreakdownChart: React.FC<ResourceBreakdownChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formattedData = data.map((item) => ({
    name: t(`resources.${item.type}`),
    value: item.total_co2_kg,
    raw: `${item.total_raw.toLocaleString()} ${item.unit}`,
    percentage: item.percentage_of_total,
  }));

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {t('dashboard.breakdown_title')}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="h-64 w-full my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {formattedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(val: number) => [`${val.toLocaleString()} kg CO2e`, 'Emissions']}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        {data.map((item, idx) => (
          <div key={item.type} className="text-xs bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block truncate">{t(`resources.${item.type}`)}</span>
            <span className="font-bold text-white text-sm">{item.percentage_of_total}%</span>
            <span className="text-[10px] text-slate-500 block">({item.total_co2_kg.toLocaleString()} kg)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
