import React, { useState, useEffect } from 'react';
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
  Eye, 
  Sparkles, 
  Barcode, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { InspectionReportModal } from '../components/InspectionReportModal';
import { useAuth } from '../context/AuthContext';

export const ReportsDashboardPage = () => {
  const { selectedLocation, selectedDateRange } = useAuth();
  const [downloadMsg, setDownloadMsg] = useState('');
  const [scansList, setScansList] = useState([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [activeReportData, setActiveReportData] = useState(null);

  useEffect(() => {
    fetchRecentScans();
  }, [selectedLocation, selectedDateRange]);

  const fetchRecentScans = async () => {
    setLoadingScans(true);
    try {
      const locId = selectedLocation?.label || selectedLocation?.id || '';
      const dateId = selectedDateRange?.id || 'all';
      const res = await fetch(`/api/v1/scans/?location=${encodeURIComponent(locId)}&date_range=${encodeURIComponent(dateId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setScansList(data);
      }
    } catch (e) {
      console.warn('Error loading scans for reports:', e);
    } finally {
      setLoadingScans(false);
    }
  };

  const handleDownload = (reportName) => {
    setDownloadMsg(`Generated & prepared official dossier: ${reportName}`);
    setTimeout(() => setDownloadMsg(''), 4000);
    window.print();
  };

  const reportsList = [
    {
      title: 'National Legal Metrology Monthly Summary (August 2026)',
      type: 'Executive PDF Report',
      cases: '24 Scans • 69 Violations Flagged',
      date: '2026-08-30',
      size: '2.4 MB'
    },
    {
      title: 'Repeat FMCG Offender Penalty Assessment (Q2/Q3 2026)',
      type: 'Adjudication Spreadsheet (XLSX)',
      cases: '14 Active Notice Dockets • ₹15.5 Lakh Liabilities',
      date: '2026-08-29',
      size: '840 KB'
    },
    {
      title: 'E-Commerce Marketplace Rule 6(10) Digital Audit',
      type: 'Compliance Dossier (PDF)',
      cases: '120 Digital Listings Screened across Blinkit & Amazon',
      date: '2026-08-28',
      size: '1.8 MB'
    },
    {
      title: 'Tamper-Proof Cryptographic Chain of Custody Package',
      type: 'Courtroom Evidence ZIP (SHA-256 Hashes)',
      cases: 'Multi-Face Packaging Bounding Boxes & Calibration Logs',
      date: '2026-08-27',
      size: '14.2 MB'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-sky-200 dark:bg-sky-500/10 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20 px-2 py-0.5 rounded-lg">
              Statutory Documentation Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Court-Admissible Export Engine</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Inspection Reports & Exportable PDF Certificates
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Generate formal Form IV-C Compliance Certificates, Form I Statutory Penalty Notices, and cryptographically signed inspection dossiers.
          </p>
        </div>
      </div>

      {/* Download Alert */}
      {downloadMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* 1. INDIVIDUAL SCAN INSPECTION REPORTS TABLE */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Printer className="w-5 h-5 text-sky-600 dark:text-amber-400" />
              Live Commodity Inspection Dossiers (Print / PDF Export)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any inspected commodity from the active database to generate its official Form IV-C Compliance Certificate or Form I Breach Dossier.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-sky-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-slate-700">
            {scansList.length} Commodities Available
          </span>
        </div>

        <div className="overflow-x-auto border border-sky-200/80 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-100/70 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-sky-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Case Docket / ID</th>
                <th className="py-3 px-4">Commodity Name</th>
                <th className="py-3 px-4">Brand / Manufacturer</th>
                <th className="py-3 px-4">Inspecting Officer</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Statutory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
              {scansList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-slate-400">
                    No inspected packaging scans found for {selectedLocation?.label || 'active circle'}.
                  </td>
                </tr>
              ) : (
                scansList.map((item) => {
                  const isComp = item.overall_compliance === 'COMPLIANT' || item.compliance_status === 'COMPLIANT' || (item.violations && item.violations.length === 0);

                  return (
                    <tr key={item.id} className="hover:bg-sky-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-800 dark:text-amber-400">
                        {item.case_number || `DOCA-CASE-2026-${String(item.id).padStart(4, '0')}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item.product_name || item.name || 'Packaged Commodity'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.brand_name || item.brand || 'Registered Packer'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.inspector_name || 'Insp. Aniket Kumar'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isComp
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {isComp ? 'COMPLIANT' : 'BREACH FLAGGED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setActiveReportData(item)}
                          className="px-3 py-1.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto shadow-xs transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Generate PDF Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. DIRECTORATE EXECUTIVE SUMMARY PACKAGES */}
      <div className="space-y-4">
        <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Directorate Executive Dossiers & Adjudication Sheets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportsList.map((r, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-400 transition-all">
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
                    className="px-3.5 py-1.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Inspection & Compliance Report Modal */}
      {activeReportData && (
        <InspectionReportModal
          isOpen={Boolean(activeReportData)}
          scanData={activeReportData}
          onClose={() => setActiveReportData(null)}
        />
      )}
    </div>
  );
};

