import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatAge } from '../../utils/helpers';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useSeparerCoupleMutation, useGetCoupleByIdQuery } from '../../store/api/coupleApi';
import { HeartCrack, Home, CalendarDays, Egg, Info, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Pigeon info card ────────────────────────────────────────────── */
function PigeonCard({ pigeon, role, isMale }) {
  if (!pigeon) return null;
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
      isMale ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'
    }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
        isMale ? 'bg-blue-100' : 'bg-pink-100'
      }`}>
        {pigeon.photo_url ? (
          <img src={pigeon.photo_url} alt={pigeon.bague} className="w-full h-full object-cover" />
        ) : (
          <img src={isMale ? "/male-placeholder.png" : "/female-placeholder.png"} alt="Placeholder" className="w-full h-full object-cover p-1 opacity-90" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-0.5 ${
          isMale ? 'text-blue-500' : 'text-pink-500'
        }`}>{role}</p>
        <p className="text-sm font-extrabold text-slate-800 truncate"
           style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {pigeon.nom || pigeon.bague}
        </p>
        <div className="flex gap-2 text-[11px] text-slate-400 mt-0.5">
          <span>🪬 {pigeon.bague}</span>
          {pigeon.race && <span>· {pigeon.race}</span>}
          {pigeon.date_naissance && <span>· {formatAge(pigeon.date_naissance)}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Main modal ──────────────────────────────────────────────────── */
export default function CoupleDetailModal({ isOpen, onClose, couple: initialCouple, onNouvelleRepro }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [separerCouple, { isLoading }] = useSeparerCoupleMutation();
  
  // Récupérer les détails complets (incluant les reproductions)
  const { data: fullCouple } = useGetCoupleByIdQuery(initialCouple?.id, { skip: !initialCouple?.id });
  const couple = fullCouple || initialCouple;

  if (!couple) return null;

  const isActif = couple.statut === 'actif';

  const handleSeparer = async () => {
    try {
      await separerCouple(couple.id).unwrap();
      toast.success('Couple séparé avec succès');
      setShowConfirm(false);
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Détails du couple" size="lg">
        <div className="space-y-4">

          {/* ── Hero banner ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-5 px-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100"
          >
            {/* Male ❤️ Female */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow border-2 border-blue-100 flex items-center justify-center text-3xl overflow-hidden">
                {couple.male?.photo_url ? (
                  <img src={couple.male.photo_url} alt="Male" className="w-full h-full object-cover" />
                ) : (
                  <img src="/male-placeholder.png" alt="Male Placeholder" className="w-full h-full object-cover p-1 opacity-90" />
                )}
              </div>
              <span className="text-2xl">❤️</span>
              <div className="w-16 h-16 rounded-2xl bg-white shadow border-2 border-pink-100 flex items-center justify-center text-3xl overflow-hidden">
                {couple.femelle?.photo_url ? (
                  <img src={couple.femelle.photo_url} alt="Femelle" className="w-full h-full object-cover" />
                ) : (
                  <img src="/female-placeholder.png" alt="Femelle Placeholder" className="w-full h-full object-cover p-1 opacity-90" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {couple.identifiant || 'Couple'}
              </h3>
              <p className="text-sm font-bold text-slate-500">
                <span className="text-blue-500">♂</span> {couple.male?.bague} &nbsp;&nbsp;
                <span className="text-slate-300">×</span> &nbsp;&nbsp;
                <span className="text-pink-500">♀</span> {couple.femelle?.bague}
              </p>

              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isActif ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isActif ? '❤️ En couple' : '💔 Séparés'}
                </span>
                {couple.date_formation && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-slate-600 border border-rose-100">
                    <CalendarDays size={11} /> Formé le {formatDate(couple.date_formation)}
                  </span>
                )}
                {couple.date_separation && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Séparé le {formatDate(couple.date_separation)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Pigeon details ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PigeonCard pigeon={couple.male}    role="Mâle"    isMale={true}  />
            <PigeonCard pigeon={couple.femelle} role="Femelle" isMale={false} />
          </div>

          {/* ── Cage & Reproductions stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Cage */}
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Home size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 mb-0.5">Cage actuelle</p>
                <p className="text-sm font-bold text-emerald-900">
                  {couple.cage
                    ? `${couple.cage.voliere} — Cage ${couple.cage.numero}`
                    : 'Non assigné à une cage'}
                </p>
              </div>
            </div>

            {/* Reproductions count */}
            <div className="flex items-center gap-3 p-3.5 bg-violet-50 rounded-2xl border border-violet-100">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Egg size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600 mb-0.5">Reproductions</p>
                <p className="text-sm font-bold text-violet-900">
                  {couple.reproductions?.length
                    ? `${couple.reproductions.length} reproduction(s) enregistrée(s)`
                    : 'Aucune reproduction encore'}
                </p>
              </div>
            </div>

            {/* List of reproductions */}
            {couple.reproductions && couple.reproductions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Historique des pontes</p>
                {couple.reproductions.map((repro) => (
                  <div key={repro.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Egg size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{formatDate(repro.date_ponte)}</p>
                        <p className="text-[10px] text-slate-500">
                          {repro.statut} · {repro.nombre_oeufs || 0} œuf(s)
                          {repro.nombre_nes ? ` · ${repro.nombre_nes} né(s)` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {couple.notes && (
            <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">{couple.notes}</p>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <p className="section-title mb-3">Actions</p>
            <div className="flex flex-wrap gap-2">
              {isActif && onNouvelleRepro && (
                <Button
                  variant="secondary"
                  onClick={() => { onNouvelleRepro(couple); onClose(); }}
                >
                  <Egg size={14} /> Enregistrer une ponte
                </Button>
              )}
              {isActif && (
                <Button variant="danger" onClick={() => setShowConfirm(true)}>
                  <HeartCrack size={14} /> Séparer ce couple
                </Button>
              )}
            </div>
          </div>

        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSeparer}
        loading={isLoading}
        title="Séparer le couple"
        message={`Voulez-vous vraiment séparer le ${couple.identifiant || 'couple'} (♂ ${couple.male?.bague} & ♀ ${couple.femelle?.bague}) ? Cette action est définitive.`}
        confirmLabel="Oui, séparer"
        variant="danger"
      />
    </>
  );
}
