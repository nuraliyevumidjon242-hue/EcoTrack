import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calculator, AlertCircle } from 'lucide-react';
import { EnergyMetric, ResourceType } from '../../types';

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: EnergyMetric | null;
}

const UBA_FACTORS: Record<ResourceType, number> = {
  ELECTRICITY: 0.380,
  NATURAL_GAS: 0.201,
  WATER: 0.344,
  WASTE: 0.450,
};

const UNIT_MAP: Record<ResourceType, string> = {
  ELECTRICITY: 'kWh',
  NATURAL_GAS: 'kWh',
  WATER: 'm³',
  WASTE: 'kg',
};

export const MetricModal: React.FC<MetricModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { t } = useTranslation();
  const [type, setType] = useState<ResourceType>('ELECTRICITY');
  const [value, setValue] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setValue(initialData.value_kwh_or_m3.toString());
      setStartDate(initialData.billing_period_start);
      setEndDate(initialData.billing_period_end);
    } else {
      setType('ELECTRICITY');
      setValue('');
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const numericValue = parseFloat(value) || 0;
  const calculatedCo2 = (numericValue * (UBA_FACTORS[type] || 0)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numericValue <= 0) {
      setError('Please enter a positive numeric consumption value.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        type,
        value_kwh_or_m3: numericValue,
        billing_period_start: startDate,
        billing_period_end: endDate,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save metric.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border-slate-700/80 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          {initialData ? t('metrics.modal_edit_title') : t('metrics.modal_add_title')}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {t('metrics.subtitle')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('metrics.resource_type')}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-eco-500"
            >
              <option value="ELECTRICITY">{t('resources.ELECTRICITY')} (kWh)</option>
              <option value="NATURAL_GAS">{t('resources.NATURAL_GAS')} (kWh)</option>
              <option value="WATER">{t('resources.WATER')} (m³)</option>
              <option value="WASTE">{t('resources.WASTE')} (kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('metrics.raw_value')} ({UNIT_MAP[type]})
            </label>
            <input
              type="number"
              step="any"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`e.g. 5400 ${UNIT_MAP[type]}`}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-eco-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('metrics.period_start')}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('metrics.period_end')}
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
              />
            </div>
          </div>

          {/* Real-time UBA Calculation Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-eco-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-eco-400" />
              <span className="text-xs text-slate-300 font-medium">
                {t('metrics.calculated_co2_preview')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-eco-400">{calculatedCo2} kg CO2e</span>
              <span className="block text-[10px] text-slate-400">
                (Factor: {UBA_FACTORS[type]} kg/unit)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t('metrics.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-eco-600 hover:bg-eco-500 text-white shadow-lg shadow-eco-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : t('metrics.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
