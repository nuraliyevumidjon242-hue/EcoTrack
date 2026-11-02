import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs font-medium">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
      <button
        onClick={() => toggleLanguage('de')}
        className={`px-2 py-1 rounded transition-all ${
          i18n.language === 'de'
            ? 'bg-eco-600 text-white font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        🇩🇪 DE
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-2 py-1 rounded transition-all ${
          i18n.language === 'en'
            ? 'bg-eco-600 text-white font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
};
