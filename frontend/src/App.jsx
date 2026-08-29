import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeDashboard } from './pages/HomeDashboard';
import { ScanProductPage } from './pages/ScanProductPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ProductRepositoryPage } from './pages/ProductRepositoryPage';
import { ViolationsDashboardPage } from './pages/ViolationsDashboardPage';
import { ReportsDashboardPage } from './pages/ReportsDashboardPage';
import { EcommerceAuditPage } from './pages/EcommerceAuditPage';
import { RuleManagementPage } from './pages/RuleManagementPage';
import { AiAccuracyDashboardPage } from './pages/AiAccuracyDashboardPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { CitizenPortal } from './pages/CitizenPortal';

import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-sky-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200">
          <Navbar />
          
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-6">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomeDashboard />} />
                  <Route path="/scan" element={<ScanProductPage />} />
                  <Route path="/review-queue" element={<ReviewQueuePage />} />
                  <Route path="/products" element={<ProductRepositoryPage />} />
                  <Route path="/violations" element={<ViolationsDashboardPage />} />
                  <Route path="/reports" element={<ReportsDashboardPage />} />
                  <Route path="/ecommerce-audit" element={<EcommerceAuditPage />} />
                  <Route path="/rules" element={<RuleManagementPage />} />
                  <Route path="/ai-accuracy" element={<AiAccuracyDashboardPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/citizen-portal" element={<CitizenPortal />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
          
          {/* Footer */}
          <footer className="border-t border-sky-200/80 dark:border-slate-800/80 bg-sky-100/50 dark:bg-slate-950/80 py-3 text-center text-xs text-slate-600 dark:text-slate-500 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <b>METROLOGY-AI</b> — Smart India Hackathon 2026 (Problem Statement ID: SIH26034)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Department of Consumer Affairs • Legal Metrology (Packaged Commodities) Rules, 2011
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
