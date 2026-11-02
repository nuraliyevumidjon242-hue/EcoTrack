import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { ShieldCheck, User as UserIcon, Building2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, companyName } = useAuth();
  const { t } = useTranslation();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <span className="bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full text-xs font-semibold">Admin</span>;
      case 'COMPANY_MANAGER':
        return <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full text-xs font-semibold">Manager</span>;
      default:
        return <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full text-xs font-semibold">Auditor</span>;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 glass-card sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {companyName && (
          <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Building2 className="w-4 h-4 text-eco-400" />
            <span className="font-medium text-slate-200">{companyName}</span>
          </div>
        )}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-eco-400 bg-eco-950/40 px-2.5 py-1 rounded-full border border-eco-800/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('app.compliance')}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <LanguageSelector />
        
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-eco-600 to-emerald-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || 'N'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              {getRoleBadge(user?.role)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
