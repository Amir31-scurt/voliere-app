import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutGrid, Bird, Heart, Egg, LogOut, Activity, Menu, X, Feather,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/voliere',        label: 'Volière',        icon: LayoutGrid },
  { to: '/pigeons',        label: 'Pigeons',         icon: Bird },
  { to: '/couples',        label: 'Couples',         icon: Heart },
  { to: '/reproductions',  label: 'Reproductions',   icon: Egg },
  { to: '/sorties',        label: 'Sorties',         icon: Activity },
];

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Glass bar */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-sm">
        <div className="flex items-center justify-between px-5 h-16 max-w-screen-2xl mx-auto">

          {/* Logo */}
          <NavLink to="/voliere" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
              <Feather size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-extrabold text-slate-800 leading-tight tracking-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                Volière App
              </p>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Gestion colombier</p>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 backdrop-blur-sm px-1.5 py-1.5 rounded-2xl border border-slate-200/60">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right — user + logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow text-white text-xs font-bold">
                  {(user.nom || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                  {user.nom || user.email}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Déconnexion"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Sortir</span>
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-slate-100 px-4 pb-4 pt-3 flex flex-col gap-1 bg-white/95 backdrop-blur-xl shadow-lg"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
