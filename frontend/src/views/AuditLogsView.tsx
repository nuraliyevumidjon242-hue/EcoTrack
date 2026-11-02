import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { AuditLog } from '../types';
import { History, ShieldCheck, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getAuditLogs(page, 15);
      setLogs(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED') || action.includes('REGISTERED')) {
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
    }
    if (action.includes('UPDATED')) {
      return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
    }
    if (action.includes('DELETED')) {
      return 'bg-red-950/60 text-red-400 border-red-800/50';
    }
    return 'bg-slate-900 text-slate-300 border-slate-700/60';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {t('audit.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('audit.subtitle')}
        </p>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">{t('audit.col_timestamp')}</th>
                <th className="py-3.5 px-4">{t('audit.col_action')}</th>
                <th className="py-3.5 px-4">{t('audit.col_details')}</th>
                <th className="py-3.5 px-4">{t('audit.col_ip')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-xl">{log.details || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {pages} ({total} total audit entries)
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
    </div>
  );
};
