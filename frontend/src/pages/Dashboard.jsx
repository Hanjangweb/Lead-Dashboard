import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { API } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Activity, Users, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  PieChart, Pie, Tooltip, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// ─── custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-white border border-slate-100 rounded-lg px-4 py-3 shadow-lg text-sm">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name ?? p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  ) : null;

// ─── normalise aggregation arrays ─────────────────────────────────────────────
const norm = (arr = []) =>
  arr.map(item => ({
    name: item._id ?? item.name ?? "",
    value: item.count ?? item.value ?? 0,
  }));

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, insightRes] = await Promise.all([
          API.get("/leads/stats"),
          API.get("/insights"),
        ]);
        setStats(statsRes.data.data ?? statsRes.data);
        setInsights(insightRes.data);
      } catch (e) {
        console.error("Dashboard fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-indigo-600 font-semibold text-lg tracking-wide">Analysing Lead Data...</div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const statusData = norm(stats?.byStatus);
  const cityData = norm(stats?.byCity);
  const serviceData = norm(stats?.byService);
  const total = stats?.total ?? 0;
  const momGrowth = Number(insights?.momGrowth ?? 0);
  const growthDisplay = momGrowth > 0 ? `+${momGrowth}%` : momGrowth < 0 ? `${momGrowth}%` : "—";
  const GrowthIcon = momGrowth > 0 ? TrendingUp : momGrowth < 0 ? TrendingDown : Minus;
  const growthColor = momGrowth > 0
    ? "text-emerald-600 bg-emerald-50"
    : momGrowth < 0
      ? "text-rose-500 bg-rose-50"
      : "text-slate-400 bg-slate-100";

  const STATUS_COLORS = { New: "#2563eb", Interested: "#f59e0b", Converted: "#10b981", Rejected: "#ef4444" };
  const CITY_COLOR = "#2563eb";
  const SERVICE_COLORS = ["#2563eb", "#059669", "#f59e0b", "#db2777", "#7c3aed", "#0284c7", "#4f46e5", "#c026d3", "#dc2626", "#0891b2"];
  const mappedServiceData = serviceData.map((s, i) => ({ ...s, fill: SERVICE_COLORS[i % SERVICE_COLORS.length] }));

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  // Build action plan from real insight data
  const actionPlan = [
    insights?.thisMonthCount > 0 && {
      priority: "HIGH",
      action: `Follow up on ${insights.thisMonthCount} new leads added this month within 24 hours`,
      icon: "⚡",
    },
    insights?.topCity && insights.topCity !== "N/A" && {
      priority: "MED",
      action: `Double down on ${insights.topCity} — your top-performing region`,
      icon: "📍",
    },
    insights?.topService && insights.topService !== "N/A" && {
      priority: "MED",
      action: `Expand capacity for ${insights.topService} — your most demanded service`,
      icon: "🔧",
    },
    Number(insights?.conversionRate) < 15 && total > 0 && {
      priority: "HIGH",
      action: `Conversion rate is ${insights.conversionRate}% — set up automated follow-up sequences`,
      icon: "🎯",
    },
    momGrowth < 0 && {
      priority: "HIGH",
      action: `Lead volume dropped ${Math.abs(momGrowth)}% — run a targeted outreach campaign now`,
      icon: "📉",
    },
    {
      priority: "LOW",
      action: "Export monthly report and review pipeline health with your team",
      icon: "📊",
    },
  ].filter(Boolean);

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6 md:y-8">

        {/* ── Header & KPI ── */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <motion.div variants={item} className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] md:text-sm uppercase tracking-widest mb-1">
              <Activity size={14} className="md:w-4 md:h-4" />
              Real-time Analytics
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Performance Overview</h1>
            <p className="text-slate-500 mt-2 text-xs md:text-base leading-relaxed">
              Track the sales funnel, regional performance, and service demand with intelligent visualisations.
            </p>
          </motion.div>

          <motion.div variants={item} className="w-full xl:w-auto">
            <div className="bg-white px-6 md:px-8 py-5 rounded-3xl border border-slate-200 shadow-xl shadow-indigo-500/5 flex items-center gap-4 md:gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                <Users size={24} className="md:w-7 md:h-7" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Leads</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl md:text-4xl font-black text-slate-900 leading-none">{total}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${growthColor}`}>
                    <GrowthIcon size={10} />
                    {growthDisplay}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">{insights?.thisMonthCount ?? 0} added this month</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── AI Based Insights ── */}
        {insights?.insights && (
          <motion.div
            variants={item}
            className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
          >
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-50/50 rounded-full -mr-24 -mt-24 md:-mr-32 md:-mt-32 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                <Sparkles size={32} className="text-indigo-600 md:w-10 md:h-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 flex items-center justify-center md:justify-start gap-2 text-slate-900">
                  AI Based Insights
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</span>
                </h3>
                <div className="space-y-4">
                  {(insights.lines || [insights.insights]).slice(0, 4).map((line, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-start gap-4 text-slate-600 text-sm md:text-base font-medium leading-relaxed group"
                    >
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.3)] group-hover:scale-125 transition-transform" />
                      <span className="flex-1">{line}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActionModal(true)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 group whitespace-nowrap mt-4 md:mt-0 cursor-pointer"
              >
                Action Plan
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Doughnut */}
          <motion.div variants={item} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 md:mb-8">
              <h2 className="text-xl font-black text-slate-800">Status Breakdown</h2>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Conversion Funnel</div>
            </div>
            <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 mb-6 md:mb-8">
              {["New", "Interested", "Converted", "Rejected"].map(s => {
                const val = statusData.find(d => d.name === s)?.value ?? 0;
                return (
                  <div key={s} className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-[2px]" style={{ backgroundColor: STATUS_COLORS[s] }} />
                    <span className="text-xs md:text-sm text-slate-600 font-medium">{s} ({val})</span>
                  </div>
                );
              })}
            </div>
            <div className="h-[260px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} strokeWidth={0}>
                    {statusData.map(entry => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* City Vertical Bar */}
          <motion.div variants={item} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 md:mb-8">
              <h2 className="text-xl font-black text-slate-800">City-wise Distribution</h2>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Geographic Reach</div>
            </div>
            <div className="h-[280px] md:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} margin={{ top: 10, right: 10, left: -25, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }} angle={-25} textAnchor="end" dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={CITY_COLOR} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Service Horizontal Bar ── */}
        <motion.div variants={item} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 md:mb-8">
            <h2 className="text-xl font-black text-slate-800">Service-wise Distribution</h2>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Market Demand</div>
          </div>
          <div className="flex flex-wrap gap-x-4 md:gap-x-5 gap-y-2 mb-6 md:mb-8">
            {mappedServiceData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm" style={{ backgroundColor: s.fill }} />
                <span className="text-xs md:text-sm font-semibold text-slate-600">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="h-[280px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={mappedServiceData} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} width={80} />
                <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={18}>
                  {mappedServiceData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </motion.div>

      {/* ── Action Plan Modal ── */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActionModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black">AI Action Plan</h2>
                  <p className="text-indigo-200 text-sm mt-0.5">Prioritised steps based on your live data</p>
                </div>
                <button onClick={() => setActionModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <X size={22} />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                {actionPlan.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-2xl leading-none">{step.icon}</span>
                    <div className="flex-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${step.priority === "HIGH" ? "bg-rose-100 text-rose-600"
                          : step.priority === "MED" ? "bg-amber-100 text-amber-600"
                            : "bg-slate-200 text-slate-500"
                        }`}>{step.priority}</span>
                      <p className="text-slate-700 font-semibold mt-2 text-sm leading-relaxed">{step.action}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}