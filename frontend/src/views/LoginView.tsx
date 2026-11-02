import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { Leaf, ShieldCheck, Lock, Mail, Building2, User, MapPin } from 'lucide-react';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { t } = useTranslation();
  const { login, register, loginAsDemo } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [city, setCity] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({
        company_name: companyName,
        registration_number: registrationNumber,
        city,
        country: 'Germany',
        industry_type: 'Manufacturing',
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: UserRole) => {
    setError(null);
    setIsLoading(true);
    try {
      await loginAsDemo(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden p-4 sm:p-6">
      {/* Background glow & mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-eco-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-eco-600 to-emerald-400 text-white shadow-lg shadow-eco-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            {t('app.title')}
          </span>
        </div>
        <LanguageSelector />
      </div>

      {/* Main Login / Register Card */}
      <div className="w-full max-w-md mx-auto my-8 z-10">
        <div className="glass-card p-8 rounded-3xl border-slate-800/80 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 text-xs text-eco-400 bg-eco-950/60 px-3 py-1 rounded-full border border-eco-800/60 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('app.compliance')}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isRegisterMode ? t('auth.register_title') : t('auth.login_title')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegisterMode ? 'EU Green Taxonomy Compliant Onboarding' : t('auth.login_subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@mueller-tech.de"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-eco-600 hover:bg-eco-500 text-white shadow-lg shadow-eco-600/25 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : t('auth.sign_in')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('auth.company_name')}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Schmidt & Partner GmbH"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('auth.registration_number')}
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="HRB-123456"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('auth.city')}
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="München"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('auth.first_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Max"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('auth.last_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mustermann"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@schmidt-partner.de"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-eco-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-eco-600 hover:bg-eco-500 text-white shadow-lg shadow-eco-600/25 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : t('auth.submit_register')}
              </button>
            </form>
          )}

          {/* Toggle between Register / Login */}
          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="text-xs text-eco-400 hover:text-eco-300 font-medium transition-colors"
            >
              {isRegisterMode ? t('auth.back_to_login') : t('auth.register')}
            </button>
          </div>

          {/* Quick Demo Logins for Interviewers / Reviewers */}
          {!isRegisterMode && (
            <div className="mt-6 pt-5 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                {t('auth.quick_demo')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoClick('COMPANY_MANAGER')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-[11px] font-medium text-slate-300 transition-all text-center"
                >
                  <span className="block font-bold text-blue-400">Manager</span>
                  <span className="text-[9px] text-slate-500">Müller GmbH</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('DATA_AUDITOR')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-medium text-slate-300 transition-all text-center"
                >
                  <span className="block font-bold text-emerald-400">Auditor</span>
                  <span className="text-[9px] text-slate-500">Data Entry</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('SYSTEM_ADMIN')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] font-medium text-slate-300 transition-all text-center"
                >
                  <span className="block font-bold text-purple-400">Admin</span>
                  <span className="text-[9px] text-slate-500">System</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 z-10">
        <p>EcoTrack SaaS • Designed for German Mittelstand & SME Compliance</p>
      </div>
    </div>
  );
};
