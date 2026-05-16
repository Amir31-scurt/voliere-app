import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, UserPlus, Users, DoorOpen, Bird, ChevronRight,
  Heart, Feather, CalendarDays, Egg, CheckCircle2,
  AlertCircle, Flame, Wind, CircleDot,
} from 'lucide-react';
import { differenceInDays, parseISO, isFuture } from 'date-fns';
import { useGetCageHistoriqueQuery, useLibererCageMutation, useDeleteCageMutation } from '../../store/api/cageApi';
import { formatDate, formatDateTime, getSexeLabel } from '../../utils/helpers';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ConfirmDialog from '../common/ConfirmDialog';
import CageAffectModal from './CageAffectModal';
import CageForm from './CageForm';
import CageHistoriqueModal from './CageHistoriqueModal';
import ReproductionUpdateModal from '../reproductions/ReproductionUpdateModal';
import toast from 'react-hot-toast';

/* ─── Status stripe config ────────────────────────────────────────── */
const STATUS_STYLE = {
  libre:  { dot: 'bg-emerald-400', gradient: 'from-emerald-400 to-teal-500',   text: 'Disponible' },
  pigeon: { dot: 'bg-red-400',     gradient: 'from-red-500 to-rose-600',       text: 'Occupée (1 Pigeon)' },
  couple: { dot: 'bg-orange-400',  gradient: 'from-orange-400 to-amber-500',   text: 'Occupée (Couple)' },
};

/* ─── Phase detection (same logic as ReproductionList) ───────────── */
function getPhase(repro) {
  const { statut, date_ponte, date_eclosion, nombre_nes, nb_oeufs, nombre_oeufs } = repro;
  const oeufs = nb_oeufs || nombre_oeufs || 0;
  if (statut === 'terminee') return { label: 'Terminée', detail: `${nombre_nes ?? 0} né(s)`, bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', icon: CheckCircle2, action: null };
  if (statut === 'echouee')  return { label: 'Échouée',  detail: "Aucun œuf n'a éclos",       bg: 'bg-red-100',     text: 'text-red-700',     ring: 'ring-red-200',     icon: AlertCircle,  action: null };
  if (!date_ponte) return { label: 'En attente', detail: 'Pas encore de ponte', bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200', icon: Clock, action: null };
  
  const hasEclosionReel = nombre_nes !== null && nombre_nes !== undefined;
  if (hasEclosionReel && nombre_nes > 0) return { label: 'Élevage 🕊️', detail: `${nombre_nes}/${oeufs} né(s)`, bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200', icon: Wind, action: 'cloture' };

  const daysSince = differenceInDays(new Date(), parseISO(date_ponte));
  const eclosion  = date_eclosion ? parseISO(date_eclosion) : null;
  if (!eclosion || isFuture(eclosion)) {
    if (daysSince < 17) return { label: 'Incubation 🥚', detail: `${daysSince}j · ~${17 - daysSince}j restants`, bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200', icon: Flame, action: null };
    if (eclosion && isFuture(eclosion)) { const d = differenceInDays(eclosion, new Date()); return { label: 'Éclosion prévue 🐣', detail: `Dans ${d} jour${d > 1 ? 's' : ''}`, bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200', icon: CalendarDays, action: 'eclosion' }; }
    return { label: 'Éclosion imminente 🐣', detail: `Vérifiez les œufs (${daysSince}j)`, bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', icon: CircleDot, action: 'eclosion' };
  }
  return { label: 'Éclosion à enregistrer 🐣', detail: `Date prévue dépassée`, bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', icon: CircleDot, action: 'eclosion' };
}

/* ─── Reproduction card ───────────────────────────────────────────── */
function ReproCard({ repro, index, onUpdate }) {
  const phase = getPhase(repro);
  const Icon  = phase.icon;

  const oeufs = repro.nb_oeufs || repro.nombre_oeufs || 0;
  const eclos = repro.nb_eclos || repro.nombre_nes    || 0;
  const pct   = oeufs > 0 ? Math.round((eclos / oeufs) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
    >
      {/* header row */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
            <Egg size={14} className="text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-700 leading-tight">
              Ponte {repro.date_ponte ? `du ${formatDate(repro.date_ponte)}` : ''}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">{phase.detail}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${phase.bg} ${phase.text} ${phase.ring}`}>
          <Icon size={9} />
          {phase.label}
        </span>
      </div>

      {/* stats row */}
      <div className="px-4 py-3 space-y-2.5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatPill icon="🥚" value={oeufs} label="Œufs" color="violet" />
          <StatPill icon="🐣" value={eclos} label="Éclos" color="amber" />
          <StatPill icon="🕊️" value={repro.nb_envolees ?? repro.nombre_nes ?? '—'} label="Envolés" color="emerald" />
        </div>

        {/* progress bar */}
        {oeufs > 0 && (
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Taux d'éclosion</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 + 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500"
              />
            </div>
          </div>
        )}

        {repro.notes && (
          <p className="text-[11px] text-slate-400 italic leading-snug border-t border-slate-50 pt-2">
            {repro.notes}
          </p>
        )}

        {/* Action button */}
        {phase.action && (
          <div className="mt-2 pt-2 border-t border-slate-50">
            {phase.action === 'eclosion' && (
              <Button variant="info" className="w-full justify-center text-xs" onClick={() => onUpdate(repro)}>
                <Egg size={13} /> Enregistrer l'éclosion
              </Button>
            )}
            {phase.action === 'cloture' && (
              <Button variant="success" className="w-full justify-center text-xs" onClick={() => onUpdate(repro)}>
                <Wind size={13} /> Clôturer l'élevage
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatPill({ icon, value, label, color }) {
  const colors = {
    violet:  'bg-violet-50 text-violet-700',
    amber:   'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className={`flex flex-col items-center py-2 px-1 rounded-xl ${colors[color]}`}>
      <span className="text-base leading-tight">{icon}</span>
      <span className="text-sm font-extrabold leading-tight">{value ?? '—'}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide opacity-60">{label}</span>
    </div>
  );
}

/* ─── Pigeon card ─────────────────────────────────────────────────── */
function PigeonCard({ pigeon, role }) {
  if (!pigeon) return null;
  const isMale = pigeon.sexe === 'male';
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border ${
        isMale ? 'bg-blue-50/60 border-blue-100' : 'bg-pink-50/60 border-pink-100'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
        isMale ? 'bg-blue-100' : 'bg-pink-100'
      }`}>
        {pigeon.photo_url ? (
          <img src={pigeon.photo_url} alt={pigeon.bague} className="w-full h-full object-cover" />
        ) : (
          <img src={isMale ? "/male-placeholder.png" : "/female-placeholder.png"} alt="Placeholder" className="w-full h-full object-cover p-1 opacity-90" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">{role}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{pigeon.nom || pigeon.bague}</p>
        <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-400 mt-0.5">
          <span>🪬 {pigeon.bague}</span>
          {pigeon.race && <span>· {pigeon.race}</span>}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main panel ──────────────────────────────────────────────────── */
export default function CageDetailPanel({ cage, onClose }) {
  const [showHistory, setShowHistory] = useState(false);
  const [showAffect,  setShowAffect]  = useState(false);
  const [affectMode,  setAffectMode]  = useState('pigeon');
  const [showConfirm,       setShowConfirm]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit,          setShowEdit]           = useState(false);
  const [updatingRepro, setUpdatingRepro] = useState(null);

  const { data: historique = [], isLoading: loadingHist } = useGetCageHistoriqueQuery(cage.id);
  const [libererCage, { isLoading: isLiberating }] = useLibererCageMutation();
  const [deleteCage,  { isLoading: isDeleting }]  = useDeleteCageMutation();

  const handleLiberer = async () => {
    try {
      await libererCage(cage.id).unwrap();
      toast.success(`Cage ${cage.numero} libérée avec succès`);
      setShowConfirm(false);
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCage(cage.id).unwrap();
      toast.success(`Cage ${cage.numero} supprimée`);
      setShowDeleteConfirm(false);
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Impossible de supprimer cette cage.');
      setShowDeleteConfirm(false);
    }
  };

  const st      = STATUS_STYLE[cage.statut] || STATUS_STYLE.libre;
  const isLibre  = cage.statut === 'libre';
  const isPigeon = cage.statut === 'pigeon';
  const isCouple = cage.statut === 'couple';

  // Gather reproductions from cage data
  const reproductions = cage.couple?.reproductions || [];

  return (
    <>
      <div className="flex flex-col h-full relative">

        {/* ══ Gradient header ══ */}
        <div className={`relative bg-gradient-to-br ${st.gradient} px-5 pt-5 pb-8 text-white overflow-hidden shrink-0`}>
          {/* decorative */}
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-4 top-16 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${st.dot} shadow-sm`} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">{st.text}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight leading-none" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                Cage {cage.numero}
              </h2>
              {cage.voliere && (
                <p className="text-xs text-white/60 font-semibold mt-1 uppercase tracking-widest">
                  {cage.voliere}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors shrink-0 mt-0.5"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ══ Pull-up scrollable body ══ */}
        <div className="flex-1 -mt-2 overflow-hidden flex flex-col">
          <div className="flex-1 bg-slate-50 rounded-t-3xl panel-scroll overflow-y-auto px-5 pt-6 pb-36 space-y-5">

            {/* ── Pigeons ── */}
            {!isLibre && (
              <section>
                <SectionTitle icon={<Feather size={10} />} label="Pigeons" />
                <div className="space-y-2">
                  {isPigeon && cage.pigeon && (
                    <PigeonCard pigeon={cage.pigeon} role={getSexeLabel(cage.pigeon.sexe)} />
                  )}
                  {isCouple && cage.couple && (
                    <>
                      <PigeonCard pigeon={cage.couple.male}    role="Mâle" />
                      <PigeonCard pigeon={cage.couple.femelle} role="Femelle" />
                    </>
                  )}
                </div>
              </section>
            )}

            {/* ── Couple info ── */}
            {isCouple && cage.couple?.date_formation && (
              <section>
                <SectionTitle icon={<Heart size={10} />} label={cage.couple.identifiant || 'Couple'} />
                <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-rose-100 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <CalendarDays size={14} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Formation</p>
                    <p className="text-sm font-bold text-slate-700">{formatDate(cage.couple.date_formation)}</p>
                  </div>
                </div>
              </section>
            )}

            {/* ── Reproductions ── */}
            {isCouple && (
              <section>
                <SectionTitle icon={<Egg size={10} />} label={`Reproductions${reproductions.length ? ` (${reproductions.length})` : ''}`} />
                {reproductions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-1">
                      <Egg size={22} className="text-violet-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">Aucune reproduction enregistrée</p>
                    <p className="text-[11px] text-slate-400">Les pontes de ce couple apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reproductions.slice(0, 3).map((r, i) => (
                      <ReproCard key={r.id} repro={r} index={i} onUpdate={setUpdatingRepro} />
                    ))}
                    {reproductions.length > 3 && (
                      <p className="text-center text-xs text-slate-400 font-semibold">
                        +{reproductions.length - 3} reproduction(s) supplémentaire(s)
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* ── Historique ── */}
            <section>
              <SectionTitle icon={<Clock size={10} />} label="Historique récent" />
              {loadingHist ? (
                <div className="py-4"><Loader size="sm" /></div>
              ) : (
                <div className="space-y-3 pt-1 mb-3">
                  {historique.length === 0 && (
                    <p className="text-xs text-slate-400 italic pl-6">Aucun événement enregistré.</p>
                  )}
                  {historique.slice(0, 3).map((h) => (
                    <div key={h.id} className="timeline-item pb-3">
                      <p className="text-xs font-bold text-slate-700 leading-snug">{h.action}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(h.date)}</p>
                    </div>
                  ))}
                </div>
              )}

              {historique.length > 3 && (
                <button
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 mt-1 pl-6 flex items-center gap-1 transition-colors"
                  onClick={() => setShowHistory(true)}
                >
                  Voir tout l'historique <ChevronRight size={10} />
                </button>
              )}
            </section>
          </div>
        </div>

        {/* ══ Pinned action footer ══ */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-5 py-4 space-y-2.5 shrink-0">
          {/* ── Modifier / Supprimer la cage ── */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-center"
              onClick={() => setShowEdit(true)}
            >
              ✏️ Modifier
            </Button>
            <Button
              variant="danger"
              className="flex-1 justify-center"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!isLibre}
              title={!isLibre ? 'Libérez la cage avant de la supprimer' : ''}
            >
              🗑️ Supprimer
            </Button>
          </div>

          {isLibre && (
            <>
              <Button
                variant="success"
                className="w-full justify-center"
                onClick={() => { setAffectMode('pigeon'); setShowAffect(true); }}
              >
                <UserPlus size={15} /> Affecter un pigeon
              </Button>
              <Button
                variant="warning"
                className="w-full justify-center"
                onClick={() => { setAffectMode('couple'); setShowAffect(true); }}
              >
                <Users size={15} /> Affecter un couple
              </Button>
            </>
          )}
          {!isLibre && (
            <Button
              variant="danger"
              className="w-full justify-center"
              onClick={() => setShowConfirm(true)}
            >
              <DoorOpen size={15} /> Libérer la cage
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-center text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
            onClick={() => setShowHistory(true)}
          >
            <Clock size={14} className="text-emerald-500 mr-1" /> Voir l'historique complet
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showAffect && (
        <CageAffectModal
          cage={cage}
          isOpen={showAffect}
          defaultMode={affectMode}
          onClose={() => setShowAffect(false)}
        />
      )}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLiberer}
        title="Libérer la cage"
        message={`Êtes-vous sûr de vouloir libérer la cage ${cage.numero} ? Le pigeon ou le couple actuel perdra son assignation.`}
        confirmLabel="Oui, libérer"
        loading={isLiberating}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la cage"
        message={`Voulez-vous vraiment supprimer la cage ${cage.numero} ? Cette action est irréversible.`}
        confirmLabel="Oui, supprimer"
        variant="danger"
        loading={isDeleting}
      />
      <CageForm
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        cage={cage}
      />
      <ReproductionUpdateModal
        isOpen={!!updatingRepro}
        onClose={() => setUpdatingRepro(null)}
        repro={updatingRepro}
        onSuccess={() => setUpdatingRepro(null)}
      />
      <CageHistoriqueModal
        cage={cage}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
}

/* ── Reusable section title ── */
function SectionTitle({ icon, label }) {
  return (
    <p className="section-title flex items-center gap-1.5 mb-3">
      {icon} {label}
    </p>
  );
}
