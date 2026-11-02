import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { MonthlyResourceBreakdown } from '../../types';

interface CarbonTrendChartProps {
  data: MonthlyResourceBreakdown[];
}

export const CarbonTrendChart: React.FC<CarbonTrendChartProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            {t('dashboard.trend_title')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="electricity_co2"
              name={t('resources.ELECTRICITY')}
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorElec)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="gas_co2"
              name={t('resources.NATURAL_GAS')}
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorGas)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="water_co2"
              name={t('resources.WATER')}
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorWater)"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
