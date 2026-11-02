import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { DashboardSummary, PredictionResult } from '../types';
import { KpiCard } from '../components/dashboard/KpiCard';
import { CarbonTrendChart } from '../components/dashboard/CarbonTrendChart';
import { ResourceBreakdownChart } from '../components/dashboard/ResourceBreakdownChart';
import { PredictionCard } from '../components/dashboard/PredictionCard';
import { MetricModal } from '../components/metrics/MetricModal';
import { 
  Flame, 
  Target, 
  Activity, 
  FileDown, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon 
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToMetrics: () => void;
  onNavigateToReports: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToMetrics, onNavigateToReports }) => {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sumData, predData] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getPredictions(),
      ]);
      setSummary(sumData);
      setPrediction(predData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveMetric = async (data: any) => {
    await ApiService.createMetric(data);
    await fetchData();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return { text: t('dashboard.status_critical'), variant: 'critical' as const };
      case 'WARNING':
        return { text: t('dashboard.status_warning'), variant: 'warning' as const };
      default:
        return { text: t('dashboard.status_optimal'), variant: 'optimal' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 text-white text-xs font-semibold shadow-lg shadow-eco-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('dashboard.add_metric_btn')}</span>
          </button>
          <button
            onClick={onNavigateToReports}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all"
          >
            <FileDown className="w-4 h-4 text-eco-400" />
            <span>{t('dashboard.export_pdf_btn')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t('dashboard.total_co2')}
          value={`${(summary?.year_to_date_co2_kg || 0).toLocaleString()} kg`}
          subtitle={`~${(((summary?.year_to_date_co2_kg || 0) / 1000)).toFixed(2)} Metric Tons CO2e`}
          icon={Flame}
        />
        <KpiCard
          title={t('dashboard.carbon_budget')}
          value={`${summary?.carbon_budget_usage_percent || 0}%`}
          subtitle={`Limit: ${(summary?.carbon_budget_limit_kg || 50000).toLocaleString()} kg/year`}
          icon={Target}
          badge={getStatusBadge(summary?.current_status)}
        />
        <KpiCard
          title="EU Taxonomy Status"
          value={summary?.current_status || 'OPTIMAL'}
          subtitle="Audit-Ready & Verified"
          icon={summary?.current_status === 'CRITICAL' ? AlertOctagon : summary?.current_status === 'WARNING' ? AlertTriangle : CheckCircle2}
          badge={getStatusBadge(summary?.current_status)}
        />
        <KpiCard
          title={t('dashboard.total_logs')}
          value={summary?.total_logs_count || 0}
          subtitle="Continuous UBA tracking"
          icon={Activity}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CarbonTrendChart data={summary?.monthly_trend || []} />
        </div>
        <div>
          <ResourceBreakdownChart data={summary?.by_resource || []} />
        </div>
      </div>

      {/* AI Prediction Section */}
      <PredictionCard prediction={prediction} isLoading={isLoading} />

      {/* Modal */}
      <MetricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMetric}
      />
    </div>
  );
};
