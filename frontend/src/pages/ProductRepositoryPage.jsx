import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Barcode, 
  Building2, 
  Calendar, 
  ChevronRight, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  History,
  TrendingUp,
  RefreshCw,
  Camera
} from 'lucide-react';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';

export const ProductRepositoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);


  useEffect(() => {
    fetchScannedProducts();
  }, []);

  const fetchScannedProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/scans/');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          return;
        }
      }
      // Default initial baseline if database is empty
      setProducts([
        {
          id: 1,
          name: 'Tata Salt Vacuum Evaporated Iodised Salt 1kg',
          brand: 'Tata Consumer Products Ltd',
          category: 'Food & Grocery',
          barcode: '8901030383842',
          mrp: '₹ 28.00',
          net_qty: '1 kg',
          last_inspected: '2026-08-26',
          compliance_score: 100,
          grade: 'A',
          violations_count: 0,
          manufacturer: 'Tata Chemicals Limited, Mithapur, Gujarat'
        },
        {
          id: 2,
          name: 'Kurkure Masala Munch Namkeen 20g',
          brand: 'PepsiCo India Holdings Pvt. Ltd.',
          category: 'Food & Grocery',
          barcode: '8901491101837',
          mrp: '₹ 5.00',
          net_qty: '20 g (13.3 g + 6.7 g Extra)',
          last_inspected: '2026-08-25',
          compliance_score: 85,
          grade: 'B',
          violations_count: 1,
          manufacturer: 'PepsiCo India Holdings, DLF Qutab Enclave, Gurugram'
        },
        {
          id: 3,
          name: 'Parle-G Gold Glucose Biscuits 130g',
          brand: 'Parle Products Pvt. Ltd.',
          category: 'Food & Grocery',
          barcode: '8901063012016',
          mrp: '₹ 10.00',
          net_qty: '130 g',
          last_inspected: '2026-08-24',
          compliance_score: 100,
          grade: 'A',
          violations_count: 0,
          manufacturer: 'Parle Products Pvt. Ltd., Vile Parle East, Mumbai'
        },
        {
          id: 4,
          name: 'QuickBite Masala Corn Crisps 85g',
          brand: 'QuickBite Foods Pvt Ltd',
          category: 'Food & Grocery',
          barcode: '8909876543210',
          mrp: '₹ 40.00',
          net_qty: '85 gms',
          last_inspected: '2026-08-22',
          compliance_score: 42,
          grade: 'F',
          violations_count: 4,
          manufacturer: 'QuickBite Foods Pvt Ltd, Plot 14, Okhla Phase 1'
        }
      ]);
    } catch (e) {
      console.error('Error fetching live scans:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    if (!p) return false;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesCategory;
    const pName = String(p.name || '').toLowerCase();
    const bName = String(p.brand || '').toLowerCase();
    const barcode = String(p.barcode || '');
    const matchesSearch = pName.includes(q) || bName.includes(q) || barcode.includes(q);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-sky-200 dark:bg-sky-500/10 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20 px-2 py-0.5 rounded-lg">
              National Product Repository
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Historical Inspection Registry</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Searchable FMCG Commodities Ledger
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Live database of all scanned commodities, brand recidivism, historical MRP declarations, and compliance grades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchScannedProducts}
            disabled={loading}
            className="p-2 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-sky-800 dark:text-slate-300 rounded-xl transition-all"
            title="Refresh Live Scans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/scan"
            className="px-4 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            Audit New Commodity
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, brand, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl pl-9 pr-24 py-1.5 text-xs text-slate-900 dark:text-slate-100 w-72 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-amber-400 text-[10px] font-bold rounded-lg border border-sky-300 dark:border-slate-700 flex items-center gap-1 transition-all"
              title="Scan physical package barcode to filter"
            >
              <Camera className="w-3 h-3" />
              <span>Scan</span>
            </button>
          </div>


          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Food & Grocery">Food & Grocery</option>
            <option value="Dairy & Beverages">Dairy & Beverages</option>
            <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
            <option value="Packaged Commodities">Packaged Commodities</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <b>{filteredProducts.length}</b> registered commodities
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-400 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-800 dark:text-amber-400 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5" /> {p.barcode}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  p.compliance_score >= 90 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' :
                  p.compliance_score >= 70 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                }`}>
                  Grade {p.grade} ({p.compliance_score}%)
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">{p.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{p.brand}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500">Declared MRP:</span>
                  <div className="font-bold font-mono text-slate-900 dark:text-slate-100">{p.mrp}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Declared Net Qty:</span>
                  <div className="font-bold font-mono text-slate-900 dark:text-slate-100">{p.net_qty}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500">Manufacturer / Plant Address:</span>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate">{p.manufacturer}</div>
                </div>
                <div className="col-span-2 pt-1 border-t border-sky-200/40 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Audited by:</span>
                  <span className="font-semibold text-sky-800 dark:text-amber-400">
                    {p.inspector_name || 'Insp. Vikram Singh'} <span className="font-mono text-slate-400">({p.inspector_badge || 'DOCA-INSP-104'})</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-sky-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Inspected: {p.last_inspected}
              </span>
              <Link
                to={`/scan?id=${p.id}`}
                className="text-sky-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 text-xs"
              >
                Scan History & Evidence <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        initialBarcode={searchQuery}
        onBarcodeScanned={(code) => setSearchQuery(code)}
      />
    </div>
  );
};



