import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileSearch, Fingerprint, LayoutDashboard, LogOut, Menu, ScanSearch, Settings2, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useResume } from "../hooks/useResume";
import { BrandMark } from "./BrandMark";

const navigation = [
  { label: "Dashboard", path: "/app", icon: LayoutDashboard, end: true },
  { label: "Resume analyzer", path: "/app/analyzer", icon: FileSearch },
  { label: "Job matcher", path: "/app/matcher", icon: ScanSearch },
  { label: "Integrity check", path: "/app/integrity", icon: Fingerprint },
  { label: "Bias-blind analysis", path: "/app/bias-blind", icon: Fingerprint },
];

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/analyzer": "Resume analysis",
  "/app/matcher": "Job matching",
  "/app/integrity": "Integrity check",
  "/app/bias-blind": "Bias-blind analysis",
  "/app/settings": "Profile",
};

export function AppShell() {
  const { user, logout } = useAuth();
  const { setFile } = useResume();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();
  function signOut() { logout(); setFile(null); navigate("/", { replace: true }); }
  const closeMobile = () => setMobileOpen(false);
  return <div className="app-frame">
    <aside className={`app-sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand"><BrandMark compact to="/app" /><span className="sidebar-wordmark">SkillSync <b>AI</b></span><button className="icon-button mobile-close" onClick={closeMobile} aria-label="Close navigation"><X size={18} /></button></div>
      <p className="nav-label">WORKSPACE</p>
      <nav className="side-nav" aria-label="Workspace navigation">
        {navigation.map(({ label, path, icon: Icon, end }) => <NavLink key={path} to={path} end={end} onClick={closeMobile} className={({ isActive }) => `side-link ${isActive ? "side-link-active" : ""}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
      <NavLink to="/app/settings" onClick={closeMobile} className={({ isActive }) => `side-link ${isActive ? "side-link-active" : ""}`}><Settings2 size={18} strokeWidth={1.8} /><span>Profile</span></NavLink>
        <div className="sidebar-profile"><span className="avatar">{user?.email.slice(0, 1).toUpperCase()}</span><span className="profile-email"><strong>{user?.email.split("@")[0]}</strong><small>{user?.email}</small></span><button className="icon-button" aria-label="Sign out" onClick={signOut}><LogOut size={17} /></button></div>
      </div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation overlay" onClick={closeMobile} />}
    <main className="app-main">
      <header className="app-topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="topbar-heading"><span className="breadcrumb">WORKSPACE</span><strong>{pageTitles[location.pathname] || "SkillSync AI"}</strong></div><div className="topbar-right"><span className="privacy-chip"><span /> Local and private</span><div className="topbar-account"><span className="avatar avatar-small">{user?.email.slice(0, 1).toUpperCase()}</span><span>{user?.email}</span></div></div></header>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} className="page-content" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reduced ? 0 : 0.22 }}><Outlet /></motion.div>
      </AnimatePresence>
      <footer className="app-footer"><span>SkillSync AI <span>·</span> Understand skills. Reveal potential.</span><span>Local analysis workspace <ArrowUpRight size={13} /></span></footer>
    </main>
  </div>;
}
