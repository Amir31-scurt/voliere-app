import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetReproductionsQuery } from '../../store/api/reproductionApi';
import ReproductionForm from './ReproductionForm';
import ReproductionUpdateModal from './ReproductionUpdateModal';
import Loader from '../common/Loader';
import Button from '../common/Button';
import {
  Egg, Plus, CheckCircle2, AlertCircle, Clock,
  CalendarDays, TrendingUp, Heart, Flame, Wind, CircleDot,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { differenceInDays, parseISO, isFuture } from 'date-fns';

/* ─────────────────────────────────────────────────────────────────── */
/*  Phase detection                                                     */
/* ─────────────────────────────────────────────────────────────────── */
function getPhase(repro) {
  const { statut, date_ponte, date_eclosion, nombre_oeufs, nombre_nes } = repro;

  if (statut === 'terminee') return {
    label: 'Terminée', detail: `${nombre_nes ?? 0} pigeonneau(x) envolé(s)`,
    bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200',
    barColor: 'from-emerald-400 to-teal-500', icon: CheckCircle2,
    action: null,
  };
  if (statut === 'echouee') return {
    label: 'Échouée', detail: 'Aucun œuf n\'a éclos',
    bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200',
    barColor: 'from-red-400 to-rose-500', icon: AlertCircle,
    action: null,
  };

  // en_cours sub-phases
  if (!date_ponte) return {
    label: 'En attente', detail: 'Aucune date de ponte enregistrée',
    bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200',
    barColor: 'from-slate-300 to-slate-400', icon: Clock,
    action: null,
  };

  const hasEclosionReel = nombre_nes !== null && nombre_nes !== undefined;

  // If eclosion has been recorded → élevage phase
  if (hasEclosionReel && nombre_nes > 0) return {
    label: 'Élevage 🕊️', detail: `${nombre_nes} pigeonneau(x) en croissance`,
    bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200',
    barColor: 'from-teal-400 to-emerald-500', icon: Wind,
    action: 'cloture',
  };

  const daysSince = differenceInDays(new Date(), parseISO(date_ponte));
  const eclosion  = date_eclosion ? parseISO(date_eclosion) : null;

  if (!eclosion || isFuture(eclosion)) {
    if (daysSince < 17) return {
      label: 'Incubation 🥚', detail: `${daysSince}j d'incubation · ~${17 - daysSince}j restants`,
      bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200',
      barColor: 'from-violet-400 to-indigo-500', icon: Flame,
      action: null, // Too soon to record eclosion
    };
    if (eclosion && isFuture(eclosion)) {
      const d = differenceInDays(eclosion, new Date());
      return {
        label: 'Éclosion prévue 🐣', detail: `Dans ${d} jour${d > 1 ? 's' : ''} (${formatDate(date_eclosion)})`,
        bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200',
        barColor: 'from-sky-400 to-blue-500', icon: CalendarDays,
        action: 'eclosion',
      };
    }
    return {
      label: 'Éclosion imminente 🐣', detail: `Ponte il y a ${daysSince}j — vérifiez les œufs`,
      bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200',
      barColor: 'from-amber-400 to-orange-400', icon: CircleDot,
      action: 'eclosion',
    };
  }

  // Eclosion date passed, not recorded yet
  return {
    label: 'Éclosion à enregistrer 🐣', detail: `Date prévue dépassée — enregistrez l'éclosion`,
    bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200',
    barColor: 'from-amber-400 to-orange-400', icon: CircleDot,
    action: 'eclosion',
  };
}

/* ─── Stat pill ───────────────────────────────────────────────────── */
function StatPill({ emoji, value, label, colorClass }) {
  return (
    <div className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl ${colorClass}`}>
      <span className="text-lg leading-tight">{emoji}</span>
      <span className="text-base font-extrabold leading-tight text-slate-800">{value ?? '—'}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
    </div>
  );
}

/* ─── Single card ─────────────────────────────────────────────────── */
function ReproCard({ repro, index, onUpdate }) {
  const phase = getPhase(repro);
  const Icon  = phase.icon;
  const oeufs = repro.nombre_oeufs ?? 0;
  const eclos = repro.nombre_nes   ?? 0;
  const pct   = oeufs > 0 ? Math.round((eclos / oeufs) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* Status stripe */}
      <div className={`h-1.5 bg-gradient-to-r ${phase.barColor} shrink-0`} />

      <div className="p-4 flex flex-col flex-1 gap-4">
        {/* Top: Couple + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <Heart size={16} className="text-rose-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-800 truncate" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {repro.couple?.identifiant || 'Couple'}
              </p>
              <p className="text-xs font-bold text-slate-500 truncate mt-0.5">
                <span className="text-blue-500">♂</span>{' '}
                {repro.male?.bague || '?'}
                {' '}<span className="text-slate-300">×</span>{' '}
                <span className="text-pink-500">♀</span>{' '}
                {repro.femelle?.bague || '?'}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${phase.bg} ${phase.text} ${phase.ring}`}>
              <Icon size={9} /> {phase.label}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[130px] leading-tight">{phase.detail}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap gap-1.5">
          {repro.date_ponte && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <CalendarDays size={9} /> <span className="font-semibold">Ponte :</span> {formatDate(repro.date_ponte)}
            </div>
          )}
          {repro.date_eclosion && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <CalendarDays size={9} />
              <span className="font-semibold">
                {repro.nombre_nes !== null ? 'Éclos :' : 'Éc. prévue :'}
              </span>
              {' '}{formatDate(repro.date_eclosion)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatPill emoji="🥚" value={oeufs} label="Œufs"   colorClass="bg-violet-50" />
          <StatPill emoji="🐣" value={repro.nombre_nes !== null ? eclos : '?'} label="Éclos" colorClass="bg-amber-50" />
          <StatPill emoji="🕊️" value={repro.statut === 'terminee' ? repro.nombre_nes : '—'} label="Envolés" colorClass="bg-emerald-50" />
        </div>

        {/* Progress bar (only when eclosion known) */}
        {oeufs > 0 && repro.nombre_nes !== null && (
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span className="flex items-center gap-1"><TrendingUp size={9} /> Taux d'éclosion</span>
              <span className="font-extrabold text-slate-600">{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.07 + 0.3 }}
                className={`h-full rounded-full bg-gradient-to-r ${phase.barColor}`}
              />
            </div>
          </div>
        )}

        {/* Notes */}
        {repro.notes && (
          <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            "{repro.notes}"
          </p>
        )}

        {/* ── Action button (contextual) ── */}
        {phase.action && (
          <div className="mt-auto pt-2 border-t border-slate-50">
            {phase.action === 'eclosion' && (
              <Button
                variant="info"
                className="w-full justify-center text-xs"
                onClick={() => onUpdate(repro)}
              >
                <Egg size={13} /> Enregistrer l'éclosion
              </Button>
            )}
            {phase.action === 'cloture' && (
              <Button
                variant="success"
                className="w-full justify-center text-xs"
                onClick={() => onUpdate(repro)}
              >
                <Wind size={13} /> Clôturer l'élevage
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Summary bar ─────────────────────────────────────────────────── */
function SummaryBar({ repros }) {
  const total  = repros.length;
  const oeufs  = repros.reduce((s, r) => s + (r.nombre_oeufs ?? 0), 0);
  const eclos  = repros.reduce((s, r) => s + (r.nombre_nes   ?? 0), 0);
  const active = repros.filter(r => r.statut === 'en_cours').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Reproductions', value: total,  emoji: '📋', color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Total œufs',    value: oeufs,  emoji: '🥚', color: 'bg-violet-50 text-violet-600' },
        { label: 'Total éclos',   value: eclos,  emoji: '🐣', color: 'bg-amber-50  text-amber-600'  },
        { label: 'En cours',      value: active, emoji: '⏳', color: 'bg-teal-50   text-teal-600'   },
      ].map(({ label, value, emoji, color }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl ${color} border border-white/60 shadow-sm`}
        >
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-xl font-extrabold leading-tight">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────── */
export default function ReproductionList() {
  const [showForm, setShowForm]         = useState(false);
  const [updatingRepro, setUpdatingRepro] = useState(null);

  const { data, isLoading, refetch } = useGetReproductionsQuery({});
  const repros = Array.isArray(data) ? data : (data?.data || []);

  if (isLoading) return <Loader text="Chargement des reproductions…" />;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-400">
          {repros.length} reproduction{repros.length !== 1 ? 's' : ''}
        </p>
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Enregistrer une ponte
        </Button>
      </div>

      {repros.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state"
        >
          <div className="empty-state-icon bg-violet-100">
            <Egg size={34} className="text-violet-400" />
          </div>
          <p className="text-lg font-extrabold text-slate-700"
             style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Aucune reproduction enregistrée
          </p>
          <p className="text-sm text-slate-400 mb-5 max-w-xs">
            Enregistrez la première ponte pour démarrer le suivi du cycle de reproduction.
          </p>
          <Button variant="secondary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Enregistrer une ponte
          </Button>
        </motion.div>
      ) : (
        <>
          <SummaryBar repros={repros} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {repros.map((r, i) => (
                <ReproCard
                  key={r.id}
                  repro={r}
                  index={i}
                  onUpdate={(repro) => setUpdatingRepro(repro)}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Forms */}
      <ReproductionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />
      <ReproductionUpdateModal
        isOpen={!!updatingRepro}
        onClose={() => setUpdatingRepro(null)}
        repro={updatingRepro}
        onSuccess={refetch}
      />
    </div>
  );
}
