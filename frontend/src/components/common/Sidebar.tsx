import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  History, 
  LogOut, 
  Leaf,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'metrics', label: t('nav.metrics'), icon: Activity },
    { id: 'reports', label: t('nav.reports'), icon: FileText },
    { id: 'audit', label: t('nav.audit_logs'), icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 space-x-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-eco-600 to-emerald-400 shadow-lg shadow-eco-500/20 text-white">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {t('app.title')}
            </span>
            <span className="block text-[10px] text-eco-400 font-medium tracking-wide uppercase">
              SME SaaS
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-eco-600/15 text-eco-400 border border-eco-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-eco-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 mb-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs">
          <p className="text-slate-400">
            🇩🇪 <span className="font-semibold text-slate-300">UBA Emission Mix</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">380g CO₂/kWh (Grid Factor)</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};
