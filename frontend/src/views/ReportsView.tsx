import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { FileText, Download, CheckCircle2, Shield, Table, ExternalLink } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (url: string, filename: string) => {
    const token = localStorage.getItem('ecotrack_token');
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => {
        alert('Failed to download report: ' + err.message);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {t('reports.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('reports.subtitle')}
        </p>
      </div>

      {/* Compliance Standard Banner */}
      <div className="glass-card p-5 rounded-2xl border-eco-500/30 bg-gradient-to-r from-eco-950/40 via-slate-900 to-slate-900 flex items-start space-x-4">
        <div className="p-2.5 rounded-xl bg-eco-600/20 text-eco-400 border border-eco-500/30 shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">
            EU Green Taxonomy (Verordnung EU 2020/852) & CSRD Audit-Ready
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            All generated reports apply the official conversion coefficients of the German Federal Environment Agency (Umweltbundesamt UBA) for Scope 1 & Scope 2 energy emissions.
          </p>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Audit Report */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t('reports.pdf_title')}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('reports.pdf_desc')}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-eco-400" />
                <span>Commercial register (HRB) certification metadata</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-eco-400" />
                <span>Summary tables with official UBA grid factors</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-eco-400" />
                <span>Formatted for German Wirtschaftsprüfer (Auditors)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
            <button
              onClick={() => downloadFile(ApiService.getPdfUrl('de'), 'EcoTrack_Audit_Bericht_DE.pdf')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 text-white text-xs font-semibold shadow-lg shadow-eco-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('reports.download_pdf_de')}</span>
            </button>
            <button
              onClick={() => downloadFile(ApiService.getPdfUrl('en'), 'EcoTrack_Audit_Report_EN.pdf')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4 text-eco-400" />
              <span>{t('reports.download_pdf_en')}</span>
            </button>
          </div>
        </div>

        {/* CSV Data Matrix */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Table className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t('reports.csv_title')}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('reports.csv_desc')}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Compatible with SAP S/4HANA & DATEV format</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Raw kWh/m³ and verified CO2 conversions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Standardized ISO 8601 timestamps</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => downloadFile(ApiService.getCsvUrl(), 'EcoTrack_Metrics_Export.csv')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('reports.download_csv')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
