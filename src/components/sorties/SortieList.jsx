import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSortiesQuery } from '../../store/api/sortieApi';
import SortieForm from './SortieForm';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { Activity, Plus, TrendingUp, DollarSign, Skull, HelpCircle, CalendarDays, ChevronDown } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const TYPE_CONFIG = {
  vente: {
    label: 'Vente',     emoji: '💰',
    bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', stripe: 'from-emerald-400 to-teal-500',
    icon: DollarSign,
  },
  deces: {
    label: 'Décès',     emoji: '🕊️',
    bg: 'bg-slate-50',  text: 'text-slate-600',    ring: 'ring-slate-200',   stripe: 'from-slate-400 to-slate-500',
    icon: Skull,
  },
  perte: {
    label: 'Perte',     emoji: '❓',
    bg: 'bg-amber-50',  text: 'text-amber-700',    ring: 'ring-amber-200',   stripe: 'from-amber-400 to-orange-500',
    icon: HelpCircle,
  },
};

/* ─── Summary bar ─────────────────────────────────────────────────── */
function SummaryBar({ sorties }) {
  const total  = sorties.length;
  const ventes = sorties.filter(s => s.type === 'vente').length;
  const deces  = sorties.filter(s => s.type === 'deces').length;
  const pertes = sorties.filter(s => s.type === 'perte').length;
  const revenue= sorties.filter(s => s.type === 'vente').reduce((sum, s) => sum + (s.prix || 0), 0);

  const items = [
    { label: 'Total sorties', value: total,   emoji: '📋', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Ventes',        value: ventes,  emoji: '💰', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Décès',         value: deces,   emoji: '🕊️', color: 'bg-slate-100 text-slate-600' },
    { label: 'Revenus',       value: revenue ? `${revenue.toLocaleString()} F` : '—', emoji: '💵', color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {items.map(({ label, value, emoji, color }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl ${color} border border-white/60 shadow-sm`}
        >
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-lg font-extrabold leading-tight">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Single sortie card ──────────────────────────────────────────── */
function SortieCard({ sortie, index }) {
  const cfg = TYPE_CONFIG[sortie.type] || TYPE_CONFIG.perte;
  const Icon = cfg.icon;

  const detail =
    sortie.type === 'vente' ? [sortie.prix ? `${sortie.prix.toLocaleString()} FCFA` : null, sortie.acheteur].filter(Boolean).join(' · ')
    : sortie.type === 'deces' ? sortie.cause_probable
    : sortie.circonstance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className={`h-1 bg-gradient-to-r ${cfg.stripe}`} />
      <div className="p-4 flex items-start gap-3">
        {/* Icon avatar */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ring-1 ${cfg.ring}`}>
          <Icon size={18} className={cfg.text} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-extrabold text-slate-800 truncate" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {sortie.pigeon?.bague || '—'}
                {sortie.pigeon?.nom ? ` · ${sortie.pigeon.nom}` : ''}
              </p>
              {sortie.pigeon?.race && (
                <p className="text-[11px] text-slate-400">{sortie.pigeon.race}</p>
              )}
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mt-1.5">
            <CalendarDays size={10} />
            {formatDate(sortie.date)}
          </div>

          {detail && (
            <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100">
              {detail}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main list ──────────────────────────────────────────────────── */
export default function SortieList() {
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useGetSortiesQuery({ type: typeFilter || undefined }, { pollingInterval: 5000 });
  const sorties = data?.data || [];

  if (isLoading) return <Loader text="Chargement des sorties…" />;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <select
            className="input w-40 pr-8 font-semibold"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tous types</option>
            <option value="vente">💰 Ventes</option>
            <option value="deces">🕊️ Décès</option>
            <option value="perte">❓ Pertes</option>
          </select>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Nouvelle sortie
        </Button>
      </div>

      {sorties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mb-2">
            <Activity size={36} className="text-amber-400" />
          </div>
          <p className="text-lg font-extrabold text-slate-700" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            Aucune sortie enregistrée
          </p>
          <p className="text-sm text-slate-400 max-w-xs">
            Enregistrez ventes, décès ou pertes de vos pigeons.
          </p>
          <Button variant="primary" className="mt-2" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Enregistrer une sortie
          </Button>
        </motion.div>
      ) : (
        <>
          <SummaryBar sorties={sorties} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {sorties.map((s, i) => (
                <SortieCard key={s.id} sortie={s} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <SortieForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
