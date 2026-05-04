import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { API } from "../services/api";
import toast from "react-hot-toast";
import { Plus, X, Pencil, Trash2, Search, ArrowRight, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";

const STATUSES = ["New", "Interested", "Converted", "Rejected"];
const SERVICES = [
  "Web Development", "Mobile App", "SEO", "UI/UX Design", "Cloud Services",
  "Digital Marketing", "Content Writing", "Graphic Design", "IT Consulting", "Data Analytics"
];
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Ludhiana", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Surat", "Chandigarh", "Indore"
];

const STATUS_STYLE = {
  New: "bg-blue-50 text-blue-700",
  Interested: "bg-amber-50 text-amber-700",
  Converted: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-600",
};

const emptyForm = { name: "", mobile: "", email: "", city: "Mumbai", service: "Web Development", budget: "", status: "New" };

// ─── helpers ───────────────────────────────────────────────────────────────────
const fmtBudget = (n) => "₹" + Number(n).toLocaleString("en-IN"); // FIX: was showing "$"

export default function Leads() {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [confirmDel, setConfirmDel] = useState(null);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync URL ?q= param whenever it changes (e.g. header search)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await API.get("/leads");
      setLeads(res.data.data ?? res.data);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  // ── status quick-update (inline dropdown) ──────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leads/${id}`, { status });
      toast.success("Status updated");
      // Optimistic UI update – no full refetch needed
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
    } catch {
      toast.error("Update failed");
    }
  };

  // ── open modals ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setFormData(emptyForm);
    setEditTarget(null);
    setShowAdd(true);
    setModalMode("add");
  };

  const openEdit = (lead) => {
    setFormData({
      name: lead.name,
      mobile: lead.mobile,
      email: lead.email,
      city: lead.city,
      service: lead.service,
      budget: String(lead.budget),
      status: lead.status,
    });
    setEditTarget(lead);
    setModalMode("edit");
  };

  const handleInp = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => { setModalMode(null); setShowAdd(false); setEditTarget(null); };

  // ── submit (add or edit) ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, budget: Number(formData.budget) };
    try {
      if (modalMode === "add") {
        await API.post("/leads", payload);
        toast.success("Lead added!");
      } else {
        //  FIX: edit was completely missing — now sends PUT with existing lead id
        await API.put(`/leads/${editTarget._id}`, payload);
        toast.success("Lead updated!");
      }
      closeModal();
      fetchLeads();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Operation failed";
      toast.error(msg);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await API.delete(`/leads/${confirmDel}`);
      toast.success("Lead deleted");
      setConfirmDel(null);
      setLeads(prev => prev.filter(l => l._id !== confirmDel));
    } catch {
      toast.error("Delete failed");
    }
  };

  // ── client-side filter ─────────────────────────────────────────────────────
  const visible = leads.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.name.toLowerCase().includes(q)
      || l.email.toLowerCase().includes(q)
      || l.city.toLowerCase().includes(q);
    const matchS = !filterStatus || l.status === filterStatus;
    return matchQ && matchS;
  });

  // ── shared input style ─────────────────────────────────────────────────────
  const inputCls = "w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 max-w-[1500px] mx-auto space-y-8"
      >
        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Lead Management</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">Keep track of your prospects and their journey through the pipeline.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
              px-7 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 group"
          >
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
            Add New Lead
          </motion.button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email or city…"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm bg-white
                focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-5 py-3.5 rounded-2xl border border-slate-200 text-sm bg-white font-semibold text-slate-600
              focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-100">
                  <th className="px-6 md:px-8 py-5">Lead Name</th>
                  <th className="px-6 md:px-8 py-5">Email</th>
                  <th className="px-6 md:px-8 py-5">Mobile</th>
                  <th className="px-6 md:px-8 py-5">Location</th>
                  <th className="px-6 md:px-8 py-5">Service</th>
                  <th className="px-6 md:px-8 py-5">Budget</th>
                  <th className="px-6 md:px-8 py-5 text-center">Status</th>
                  <th className="px-6 md:px-8 py-5 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={8} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fetching leads...</span>
                    </div>
                  </td></tr>
                ) : visible.length === 0 ? (
                  <tr><td colSpan={8} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search size={40} />
                      <p className="font-bold text-lg">{leads.length === 0 ? "No Leads Found" : "No Matches Found"}</p>
                    </div>
                  </td></tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {visible.map(l => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={l._id}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5 font-bold text-slate-900 whitespace-nowrap">{l.name}</td>
                        <td className="px-8 py-5 text-slate-500 whitespace-nowrap">{l.email}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium whitespace-nowrap">{l.mobile}</td>
                        <td className="px-8 py-5 text-slate-600 font-semibold whitespace-nowrap">{l.city}</td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold">
                            {l.service}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-black text-slate-800 whitespace-nowrap">{fmtBudget(l.budget)}</td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex justify-center">
                            <select
                              value={l.status}
                              onChange={e => updateStatus(l._id, e.target.value)}
                              className={`text-[11px] font-black uppercase tracking-tighter border-0 rounded-full px-4 py-1.5 cursor-pointer
                                outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm ${STATUS_STYLE[l.status]}`}
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(l)}
                              className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm cursor-pointer"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setConfirmDel(l._id)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(showAdd || editTarget) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {editTarget ? "Edit Lead Profile" : "Create New Lead"}
                  </h2>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleInp} placeholder="e.g. John Doe" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                    <input required name="mobile" value={formData.mobile} onChange={handleInp} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInp} placeholder="john@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City</label>
                    <select name="city" value={formData.city} onChange={handleInp} className={inputCls}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Service Required</label>
                    <select name="service" value={formData.service} onChange={handleInp} className={inputCls}>
                      {SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Budget (₹)</label>
                    <input required type="number" name="budget" value={formData.budget} onChange={handleInp} placeholder="50000" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lead Status</label>
                    <select name="status" value={formData.status} onChange={handleInp} className={inputCls}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 pt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                      {editTarget ? "Update Profile" : "Confirm & Save Lead"}
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete ── */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDel(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Lead?</h3>
              <p className="text-slate-500 mb-8 text-sm font-medium">This action cannot be undone. All data associated with this lead will be removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all cursor-pointer">Confirm Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}