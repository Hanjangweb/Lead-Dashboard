import { Bell, Search, Settings, X, BarChart2, Users, TrendingUp, UserCircle, Eye, EyeOff, Save, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../services/api";
import toast from "react-hot-toast";

export default function Header({ toggleSidebar }) {
  const [searchVal, setSearchVal] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, newP: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info"); // "info" | "password"
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("readNotifs");
    const readIds = saved ? JSON.parse(saved) : [];
    return [
      { id: 1, icon: <Users size={16} />, color: "bg-indigo-100 text-indigo-600", text: "New lead added from Mumbai", time: "2m ago", read: readIds.includes(1) },
      { id: 2, icon: <TrendingUp size={16} />, color: "bg-emerald-100 text-emerald-600", text: "Conversion rate improved to 22%", time: "1h ago", read: readIds.includes(2) },
      { id: 3, icon: <BarChart2 size={16} />, color: "bg-amber-100 text-amber-600", text: "Monthly report is ready to export", time: "3h ago", read: readIds.includes(3) },
    ];
  });

  const navigate = useNavigate();

  // Load profile from localStorage on mount, then sync from API
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch { }
    }
    // Fetch fresh from backend
    API.get("/auth/profile")
      .then(({ data }) => {
        setProfile({ name: data.name, email: data.email });
        localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
      })
      .catch(() => { }); // silently fail if not logged in
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/leads?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
    }
  };

  const closeAll = () => {
    setNotifOpen(false);
    setSettingsOpen(false);
  };

  // ── Save profile info (name + email) ────────────────────────────────────────
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Ensure the URL matches your backend route exactly
      const { data } = await API.put("/auth/profile", {
        name: (profile.name || "").trim(),
        email: (profile.email || "").trim()
      });
      console.log("Profile Update Success:", data);

      // Update LocalStorage with the NEW token and user info
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        // Update the local React state
        setProfile({ name: data.user.name, email: data.user.email });
      }

      toast.success("Profile updated in database!");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) return toast.error("Enter your current password");
    if (pwForm.newPassword.length < 3) return toast.error("New password must be at least 3 characters");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords don't match");
    setSaving(true);
    try {
      const { data } = await API.put("/auth/profile", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      localStorage.setItem("token", data.token);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleMarkAllRead = () => {
    setNotifs(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("readNotifs", JSON.stringify(updated.map(n => n.id)));
      return updated;
    });
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all";

  return (
    <>
      <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
          <div className="w-1 h-6 bg-indigo-600 rounded-full hidden sm:block" />
          <h2 className="text-slate-900 font-black text-base md:text-xl tracking-tight truncate max-w-[140px] sm:max-w-none">
            Admin Console
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group focus-within:border-indigo-400 transition-all">
            <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search leads…"
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-600 placeholder:text-slate-400 w-44"
            />
            {searchVal && (
              <button type="button" onClick={() => setSearchVal("")} className="text-slate-300 hover:text-slate-500 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </form>

          <div className="flex items-center gap-1 text-slate-400">
            {/* Settings */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.1, y: -1 }} onClick={() => { setSettingsOpen(o => !o); setNotifOpen(false); }} className="p-2.5 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all cursor-pointer">
                <Settings size={20} />
              </motion.button>
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Settings</p>
                    </div>
                    {[
                      { label: "Dashboard", action: () => { navigate("/"); closeAll(); } },
                      { label: "Manage Leads", action: () => { navigate("/leads"); closeAll(); } },
                      { label: "Reports & Analytics", action: () => { navigate("/reports"); closeAll(); } },
                      { label: "Edit Profile", action: () => { setProfileOpen(true); closeAll(); } },
                      { label: "Logout", action: handleLogout },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer">
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.1, y: -1 }} onClick={() => { setNotifOpen(o => !o); setSettingsOpen(false); }} className="p-2.5 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all relative cursor-pointer">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>}
              </motion.button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-12 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="flex justify-between items-center px-5 py-4 border-b border-slate-50">
                      <p className="font-black text-slate-900 text-sm">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                      {notifs.map(n => (
                        <div key={n.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${n.read ? 'opacity-50' : ''}`} onClick={() => setNotifs(prev => {
                          const updated = prev.map(item => item.id === n.id ? { ...item, read: true } : item);
                          localStorage.setItem("readNotifs", JSON.stringify(updated.filter(item => item.read).map(item => item.id)));
                          return updated;
                        })}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>{n.icon}</div>
                          <div>
                            <p className={`text-sm font-semibold leading-snug ${n.read ? 'text-slate-500' : 'text-slate-700'}`}>{n.text}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{n.time}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />}
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-slate-50">
                      <button onClick={handleMarkAllRead} className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1">
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile avatar — click to open edit modal */}
          <motion.div
            whileHover={{ x: 2 }}
            onClick={() => { setProfileOpen(true); closeAll(); }}
            className="flex items-center gap-3 pl-5 border-l border-slate-100 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-slate-900 leading-none">{profile.name || "Admin"}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm group-hover:bg-indigo-100 group-hover:shadow-indigo-100 transition-all">
              <UserCircle size={24} />
            </div>
          </motion.div>
        </div>

        {/* Click-outside overlay for dropdowns */}
        {(notifOpen || settingsOpen) && (
          <div className="fixed inset-0 z-40" onClick={closeAll} />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Profile Edit Modal                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-7 text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                      <UserCircle size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black leading-none">{profile.name || "Your Profile"}</h2>
                      <p className="text-indigo-200 text-xs font-semibold mt-1">{profile.email}</p>

                    </div>
                  </div>
                  <button onClick={() => setProfileOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                {[
                  { key: "info", label: "Personal Info" },
                  { key: "password", label: "Change Password" },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 py-3.5 text-sm font-bold transition-all cursor-pointer ${tab === t.key
                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                        : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {tab === "info" ? (
                    <motion.form
                      key="info"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      onSubmit={handleSaveInfo}
                      className="space-y-5"
                    >
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                          placeholder="Enter your name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                          placeholder="Enter your email"
                          className={inputCls}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {saving ? "Saving…" : "Save Changes"}
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="password"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      onSubmit={handleSavePassword}
                      className="space-y-5"
                    >
                      {[
                        { label: "Current Password", key: "current", field: "currentPassword", showKey: "current" },
                        { label: "New Password", key: "newP", field: "newPassword", showKey: "newP" },
                        { label: "Confirm Password", key: "confirm", field: "confirmPassword", showKey: "confirm" },
                      ].map(({ label, key, field, showKey }) => (
                        <div key={key}>
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">{label}</label>
                          <div className="relative">
                            <input
                              type={showPw[showKey] ? "text" : "password"}
                              value={pwForm[field]}
                              onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              className={inputCls + " pr-12"}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                            >
                              {showPw[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        {saving ? "Updating…" : "Update Password"}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Logout at bottom */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout from this account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}