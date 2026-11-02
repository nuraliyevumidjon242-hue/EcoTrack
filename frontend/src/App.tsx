import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MetricsView } from './views/MetricsView';
import { ReportsView } from './views/ReportsView';
import { AuditLogsView } from './views/AuditLogsView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-eco-500/20 border-t-eco-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            Loading EcoTrack Platform...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateToMetrics={() => setCurrentTab('metrics')}
            onNavigateToReports={() => setCurrentTab('reports')}
          />
        );
      case 'metrics':
        return <MetricsView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return (
          <DashboardView
            onNavigateToMetrics={() => setCurrentTab('metrics')}
            onNavigateToReports={() => setCurrentTab('reports')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
