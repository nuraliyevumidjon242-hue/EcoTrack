import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp, TrendingDown, Minus, Zap, Flame, ShieldAlert } from 'lucide-react';
import { PredictionResult } from '../../types';

interface PredictionCardProps {
  prediction: PredictionResult | null;
  isLoading: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, isLoading }) => {
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-1/2 mb-3"></div>
        <div className="h-16 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (!prediction) return null;

  const isDe = i18n.language === 'de';
  const advice = isDe ? prediction.reduction_advice_de : prediction.reduction_advice_en;

  const getTrendIcon = () => {
    switch (prediction.trend_direction) {
      case 'UPWARD':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'DOWNWARD':
        return <TrendingDown className="w-5 h-5 text-emerald-400" />;
      default:
        return <Minus className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTrendLabel = () => {
    switch (prediction.trend_direction) {
      case 'UPWARD':
        return t('dashboard.trend_up');
      case 'DOWNWARD':
        return t('dashboard.trend_down');
      default:
        return t('dashboard.trend_stable');
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-eco-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-eco-950/40">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-eco-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-eco-600 to-emerald-400 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {t('dashboard.prediction_title')}
            </h3>
            <span className="text-xs text-eco-400 font-medium">
              Target Month: {prediction.next_month}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/80">
          {getTrendIcon()}
          <span className="font-semibold text-slate-200">{getTrendLabel()}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">{t('dashboard.predicted_co2')}</span>
          <span className="text-xl font-bold text-eco-400 mt-1 block">
            {prediction.predicted_co2_kg.toLocaleString()} kg
          </span>
          <span className="text-[11px] text-slate-500">
            {t('dashboard.confidence')} {(prediction.confidence_score * 100).toFixed(0)}%
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('resources.ELECTRICITY')}</span>
          </div>
          <span className="text-lg font-bold text-slate-200 mt-1 block">
            {prediction.predicted_electricity_kwh.toLocaleString()} kWh
          </span>
          <span className="text-[11px] text-slate-500">
            ~{(prediction.predicted_electricity_kwh * 0.38).toFixed(1)} kg CO2
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{t('resources.NATURAL_GAS')}</span>
          </div>
          <span className="text-lg font-bold text-slate-200 mt-1 block">
            {prediction.predicted_gas_kwh.toLocaleString()} kWh
          </span>
          <span className="text-[11px] text-slate-500">
            ~{(prediction.predicted_gas_kwh * 0.201).toFixed(1)} kg CO2
          </span>
        </div>
      </div>

      {/* AI Advice Box */}
      <div className="mt-4 p-3.5 rounded-xl bg-eco-950/30 border border-eco-500/20 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-eco-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          {advice}
        </p>
      </div>
    </div>
  );
};
