import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileBarChart, LogOut, Hexagon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Leads", path: "/leads", icon: Users },
    { name: "Reports", path: "/reports", icon: FileBarChart },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const SidebarContent = (
    <div className="w-[280px] h-full bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl relative z-50">
      <div>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-8 mb-4">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20"
            >
              <Hexagon className="text-white" fill="currentColor" size={22} />
            </motion.div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">LeadIQ</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Dashboard</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-4 mt-6">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-4">Menu</div>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close on navigate for mobile
                className={`relative group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-white transition-colors"} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-slate-800/50">
        <motion.button 
          whileHover={{ x: 5 }}
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout System</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            {/* Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-full"
            >
              {SidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}