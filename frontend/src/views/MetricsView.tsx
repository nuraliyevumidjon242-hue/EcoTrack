import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EnergyMetric, ResourceType } from '../types';
import { MetricModal } from '../components/metrics/MetricModal';
import { 
  PlusCircle, 
  Filter, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Flame, 
  Droplet, 
  Trash, 
  Calendar 
} from 'lucide-react';

export const MetricsView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<EnergyMetric[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<EnergyMetric | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getMetrics({
        page,
        size: 10,
        resource_type: selectedType || undefined,
      });
      setMetrics(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [page, selectedType]);

  const handleSaveMetric = async (data: any) => {
    if (editingMetric) {
      await ApiService.updateMetric(editingMetric.id, data);
    } else {
      await ApiService.createMetric(data);
    }
    await fetchMetrics();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('metrics.confirm_delete'))) {
      try {
        await ApiService.deleteMetric(id);
        await fetchMetrics();
      } catch (err: any) {
        alert(err.message || 'Delete failed.');
      }
    }
  };

  const openAddModal = () => {
    setEditingMetric(null);
    setIsModalOpen(true);
  };

  const openEditModal = (metric: EnergyMetric) => {
    setEditingMetric(metric);
    setIsModalOpen(true);
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'ELECTRICITY':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'NATURAL_GAS':
        return <Flame className="w-4 h-4 text-sky-400" />;
      case 'WATER':
        return <Droplet className="w-4 h-4 text-purple-400" />;
      case 'WASTE':
        return <Trash className="w-4 h-4 text-amber-400" />;
    }
  };

  const canEdit = user?.role === 'COMPANY_MANAGER' || user?.role === 'SYSTEM_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('metrics.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('metrics.subtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 text-white text-xs font-semibold shadow-lg shadow-eco-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('metrics.add_new')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter:</span>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
          >
            <option value="">{t('metrics.filter_type')}</option>
            <option value="ELECTRICITY">{t('metrics.filter_electricity')}</option>
            <option value="NATURAL_GAS">{t('metrics.filter_gas')}</option>
            <option value="WATER">{t('metrics.filter_water')}</option>
            <option value="WASTE">{t('metrics.filter_waste')}</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Total Records: <span className="font-semibold text-white">{total}</span>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">{t('metrics.col_type')}</th>
                <th className="py-3.5 px-4">{t('metrics.col_value')}</th>
                <th className="py-3.5 px-4">{t('metrics.col_co2')}</th>
                <th className="py-3.5 px-4">{t('metrics.col_period')}</th>
                <th className="py-3.5 px-4">{t('metrics.col_date')}</th>
                {canEdit && <th className="py-3.5 px-4 text-right">{t('metrics.col_actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No consumption logs found for this filter.
                  </td>
                </tr>
              ) : (
                metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                          {getResourceIcon(metric.type)}
                        </div>
                        <span className="font-semibold text-white">
                          {t(`resources.${metric.type}`)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-200">
                        {metric.value_kwh_or_m3.toLocaleString()} {metric.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-eco-400 bg-eco-950/40 px-2 py-0.5 rounded border border-eco-800/40">
                        {metric.co2_emissions_kg.toLocaleString()} kg
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{metric.billing_period_start} → {metric.billing_period_end}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(metric.created_at).toLocaleDateString()}
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(metric)}
                            title={t('metrics.edit')}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(metric.id)}
                            title={t('metrics.delete')}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <MetricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMetric}
        initialData={editingMetric}
      />
    </div>
  );
};
