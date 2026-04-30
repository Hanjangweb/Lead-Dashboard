import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { API } from "../services/api";
import { Download, Filter, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const STATUSES = ["New", "Interested", "Converted", "Rejected"];
const SERVICES = [
  "Web Development", "Mobile App", "SEO", "UI/UX Design", "Cloud Services",
  "Digital Marketing", "Content Writing", "Graphic Design", "IT Consulting", "Data Analytics"
];
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Ludhiana", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Surat", "Chandigarh", "Indore"
];

const STATUS_BADGE = {
  New: "bg-blue-50   text-blue-700",
  Interested: "bg-amber-50  text-amber-700",
  Converted: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50    text-red-600",
};

const fmtBudget = (n) => "₹" + Number(n).toLocaleString("en-IN");

const emptyFilters = { city: "", status: "", service: "", startDate: "", endDate: "" };

export default function Reports() {
  const [filters, setFilters] = useState(emptyFilters);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getParams = (f) => {
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ""));
    if (params.startDate) {
      // Create a Date object assuming UTC if YYYY-MM-DD
      const d = new Date(params.startDate);
      // We want local start of day. new Date("2026-04-30") creates UTC midnight.
      // d.getUTCFullYear() gives the year, etc.
      // Actually simpler: we can just construct local date using the string parts.
      const [y, m, day] = params.startDate.split('-');
      params.startDate = new Date(y, m - 1, day, 0, 0, 0).toISOString();
    }
    if (params.endDate) {
      const [y, m, day] = params.endDate.split('-');
      params.endDate = new Date(y, m - 1, day, 23, 59, 59, 999).toISOString();
    }
    return { ...params, limit: 99999 };
  };

  const fetchData = async (f = filters) => {
    setIsLoading(true);
    try {
      const params = getParams(f);
      const res = await API.get("/leads", { params });
      setData(res.data.data ?? res.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const handleReset = () => {
    setFilters(emptyFilters);
    fetchData(emptyFilters);
  };

  // ── CSV export (calls backend /leads/export with same filters) ─────────────
  const handleExport = async () => {
    try {
      const params = getParams(filters);
      const res = await API.get("/leads/export", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = Object.assign(document.createElement("a"), { href: url, download: "leads_report.csv" });
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export successful!");
    } catch {
      toast.error("Export failed");
    }
  };

  // ── computed summary ────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const total = data.length;
    const converted = data.filter(d => d.status === "Converted").length;
    const totalBudget = data.reduce((a, d) => a + (d.budget || 0), 0);
    const convRate = total ? ((converted / total) * 100).toFixed(1) : "0.0";
    const avgBudget = total ? Math.round(totalBudget / total) : 0;
    return { total, converted, convRate, totalBudget, avgBudget };
  }, [data]);

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const inputCls = "w-full rounded-lg border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 max-w-[1500px] mx-auto space-y-8"
      >
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reporting System</h1>
            <p className="text-slate-500 mt-2 font-medium">Analyse performance trends and export detailed lead data.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white
              px-7 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-100 group cursor-pointer"
          >
            <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
            Export CSV Report
          </motion.button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Matching Leads", value: summary.total, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total Pipeline", value: fmtBudget(summary.totalBudget), color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Conversion Rate", value: `${summary.convRate}%`, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Avg Budget", value: summary.total ? fmtBudget(summary.avgBudget) : "—", color: "text-amber-600", bg: "bg-amber-50" },
          ].map(c => (
            <motion.div
              key={c.label}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{c.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-900">{c.value}</p>
                <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-xl flex items-center justify-center`}>
                  <Filter size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
          <div className="flex items-center gap-3 mb-8 text-slate-900 font-black text-xl tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Filter size={20} />
            </div>
            Refine Results
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">City</label>
              <select value={filters.city} onChange={e => setF("city", e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer">
                <option value="">All Regions</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Service</label>
              <select value={filters.service} onChange={e => setF("service", e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer">
                <option value="">All Services</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Status</label>
              <select value={filters.status} onChange={e => setF("status", e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer">
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">From Date</label>
              <input type="date" value={filters.startDate} onChange={e => setF("startDate", e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">To Date</label>
              <input type="date" value={filters.endDate} onChange={e => setF("endDate", e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer" />
            </div>
          </div>

          <div className="flex gap-4 mt-10 justify-end border-t border-slate-50 pt-8">
            <button onClick={handleReset}
              className="px-6 py-3.5 rounded-2xl text-slate-500 hover:text-slate-900
                bg-slate-50 hover:bg-slate-100 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer">
              <RefreshCcw size={16} /> Reset
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchData()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5
                rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 cursor-pointer"
            >
              Apply Analytics
            </motion.button>
          </div>
        </div>

        {/* ── Results Table ── */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              Lead Insights Table <span className="text-indigo-600 ml-2">({data.length})</span>
            </h3>
            {isLoading && (
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Refreshing...
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                  <th className="px-5 md:px-10 py-5 font-black whitespace-nowrap">Client Name</th>
                  <th className="px-5 md:px-10 py-5 font-black whitespace-nowrap">Region</th>
                  <th className="px-5 md:px-10 py-5 font-black whitespace-nowrap">Service Type</th>
                  <th className="px-5 md:px-10 py-5 font-black whitespace-nowrap">Budget</th>
                  <th className="px-5 md:px-10 py-5 font-black whitespace-nowrap">Status</th>
                  <th className="px-5 md:px-10 py-5 font-black text-right whitespace-nowrap">Acquisition Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 md:px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <Filter size={40} />
                        <p className="font-bold text-xl">No Matching Analytics</p>
                      </div>
                    </td>
                  </tr>
                ) : data.map((d, i) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={d._id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-5 md:px-10 py-5 font-bold text-slate-900 whitespace-nowrap">{d.name}</td>
                    <td className="px-5 md:px-10 py-5 text-slate-600 font-semibold whitespace-nowrap">{d.city}</td>
                    <td className="px-5 md:px-10 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black uppercase tracking-tight">
                        {d.service}
                      </span>
                    </td>
                    <td className="px-5 md:px-10 py-5 font-black text-slate-900 whitespace-nowrap">{fmtBudget(d.budget)}</td>
                    <td className="px-5 md:px-10 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-4 py-1 rounded-full
                        text-[10px] font-black uppercase tracking-tighter shadow-sm ${STATUS_BADGE[d.status] ?? ""}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 md:px-10 py-5 text-slate-400 font-medium text-right text-xs whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}