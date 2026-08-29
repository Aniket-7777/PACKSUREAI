import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  CheckCircle2, 
  Scale, 
  Calendar, 
  Building2,
  FileCheck,
  Eye
} from 'lucide-react';

export const ReportsDashboardPage = () => {
  const [downloadMsg, setDownloadMsg] = useState('');

  const handleDownload = (reportName) => {
    setDownloadMsg(`Generated & downloaded: ${reportName}`);
    setTimeout(() => setDownloadMsg(''), 4000);
  };

  const reportsList = [
    {
      title: 'National Legal Metrology Monthly Summary (August 2026)',
      type: 'Executive PDF Report',
      cases: '248 Scans • 42 Violations Flagged',
      date: '2026-08-26',
      size: '2.4 MB'
    },
    {
      title: 'Repeat FMCG Offender Penalty Assessment (Q2 2026)',
      type: 'Adjudication Spreadsheet (XLSX)',
      cases: '14 Active Notice Dockets • ₹10.5 Lakh Liabilities',
      date: '2026-08-25',
      size: '840 KB'
    },
    {
      title: 'E-Commerce Marketplace Rule 6(10) Digital Audit',
      type: 'Compliance Dossier (PDF)',
      cases: '120 Digital Listings Screened',
      date: '2026-08-23',
      size: '1.8 MB'
    },
    {
      title: 'Tamper-Proof Cryptographic Chain of Custody Package',
      type: 'Courtroom Evidence ZIP (SHA-256 Hashes)',
      cases: 'Full Multi-Face Photo Bounding Boxes & Calibration Logs',
      date: '2026-08-22',
      size: '14.2 MB'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-sky-200 dark:bg-sky-500/10 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20 px-2 py-0.5 rounded-lg">
              Statutory Documentation Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Court-Admissible Export Engine</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Inspection Reports & Evidence Packages
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Generate formal Section 36 penalty notices, periodic compliance reports, and cryptographically signed inspection dossiers.
          </p>
        </div>
      </div>

      {/* Download Alert */}
      {downloadMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((r, i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-400 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-slate-300 border border-sky-200 dark:border-slate-700">
                  {r.type}
                </span>
                <span className="text-xs font-mono text-slate-500">{r.size}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">{r.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{r.cases}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-sky-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {r.date}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(r.title)}
                  className="px-3 py-1.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
