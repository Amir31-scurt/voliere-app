import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateReproductionMutation } from '../../store/api/reproductionApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Egg, CheckCircle2, XCircle, AlertTriangle, Wind, CalendarDays } from 'lucide-react';

/* ─── Stage 1: Enregistrer l'éclosion ─────────────────────────────
   Shown when:  statut === 'en_cours' && !date_eclosion_reelle
   (date_eclosion is the "prévue" date from creation)
──────────────────────────────────────────────────────────────────── */
function EclosionStage({ repro, onClose, onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { date_eclosion: format(new Date(), 'yyyy-MM-dd') },
  });
  const [updateReproduction, { isLoading }] = useUpdateReproductionMutation();
  const nombreOeufs = repro.nombre_oeufs ?? 0;
  const nombreNes   = Number(watch('nombre_nes') ?? 0);

  const onSubmit = async (data) => {
    const nb = Number(data.nombre_nes) || 0;
    try {
      await updateReproduction({
        id: repro.id,
        date_eclosion: data.date_eclosion,
        nombre_nes:    nb,
        // If 0 hatched, mark as échouée; otherwise still en_cours (élevage phase)
        statut: nb === 0 ? 'echouee' : 'en_cours',
      }).unwrap();
      toast.success(nb === 0 ? '❌ Reproduction marquée échouée' : '🐣 Éclosion enregistrée');
      onSuccess();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  const hatched   = Math.min(nombreNes, nombreOeufs);
  const failedPct = nombreOeufs > 0 ? Math.round((1 - hatched / nombreOeufs) * 100) : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Context */}
      <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
          <Egg size={18} className="text-sky-600" />
        </div>
        <div>
          <p className="text-xs font-extrabold text-sky-700 uppercase tracking-wider">Ponte du {format(parseISO(repro.date_ponte), 'd MMM yyyy', { locale: fr })}</p>
          <p className="text-sm text-sky-600">{nombreOeufs} œuf{nombreOeufs > 1 ? 's' : ''} incubé{nombreOeufs > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Date d'éclosion réelle */}
      <div>
        <label className="label">Date d'éclosion réelle *</label>
        <input
          type="date"
          className="input"
          max={format(new Date(), 'yyyy-MM-dd')}
          {...register('date_eclosion', { required: 'Requis' })}
        />
        {errors.date_eclosion && <p className="text-xs text-red-500 mt-1">{errors.date_eclosion.message}</p>}
      </div>

      {/* Nombre d'œufs éclos */}
      <div>
        <label className="label">Nombre d'œufs éclos</label>
        <div className="flex gap-2 items-center">
          {Array.from({ length: nombreOeufs + 1 }, (_, i) => i).map(n => (
            <label key={n} className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
              String(watch('nombre_nes')) === String(n)
                ? n === 0 ? 'border-red-400 bg-red-50' : 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input type="radio" value={n} {...register('nombre_nes')} className="sr-only" />
              <span className="text-xl">{n === 0 ? '💔' : '🐣'.repeat(n)}</span>
              <span className="text-xs font-extrabold text-slate-600">{n}</span>
            </label>
          ))}
        </div>

        {/* Visual feedback */}
        <AnimatePresence>
          {watch('nombre_nes') !== undefined && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              {Number(watch('nombre_nes')) === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-red-700 text-sm">
                  <XCircle size={15} />
                  <span className="font-semibold">Aucun éclos — la reproduction sera marquée <strong>Échouée</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-sm">
                  <CheckCircle2 size={15} />
                  <span className="font-semibold">
                    {watch('nombre_nes')}/{nombreOeufs} éclos — phase d'<strong>élevage</strong> commence
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 justify-end pt-1 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        <Button type="submit" variant="success" disabled={isLoading}>
          {isLoading ? 'Enregistrement…' : <><CheckCircle2 size={14} /> Confirmer l'éclosion</>}
        </Button>
      </div>
    </form>
  );
}

/* ─── Stage 2: Clôturer la reproduction ──────────────────────────
   Shown when: statut === 'en_cours' && nombre_nes > 0
──────────────────────────────────────────────────────────────────── */
function ClotureStage({ repro, onClose, onSuccess }) {
  const [updateReproduction, { isLoading }] = useUpdateReproductionMutation();
  const maxNes       = repro.nombre_nes ?? 2;
  const [nbSurvivants, setNbSurvivants] = useState(maxNes);

  // Per-pigeonneau fields
  const [pigeonneaux, setPigeonneaux] = useState(
    Array.from({ length: maxNes }, (_, i) => ({ bague: '', nom: '', sexe: 'inconnu' }))
  );

  const updateField = (i, field, value) => {
    setPigeonneaux(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  // When nbSurvivants changes, resize the array
  const handleSetNb = (n) => {
    setNbSurvivants(n);
    setPigeonneaux(prev => {
      if (n > prev.length) {
        return [...prev, ...Array.from({ length: n - prev.length }, () => ({ bague: '', nom: '', sexe: 'inconnu' }))];
      }
      return prev.slice(0, n);
    });
  };

  const handleCloture = async () => {
    try {
      await updateReproduction({
        id:                    repro.id,
        statut:                'terminee',
        nombre_nes:            nbSurvivants,
        bagues_pigeonneaux:    pigeonneaux.slice(0, nbSurvivants).map(p => p.bague),
        noms_pigeonneaux:      pigeonneaux.slice(0, nbSurvivants).map(p => p.nom),
        sexes_pigeonneaux:     pigeonneaux.slice(0, nbSurvivants).map(p => p.sexe),
      }).unwrap();
      toast.success('🕊️ Reproduction clôturée — pigeonneaux créés !');
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  const handleEchouee = async () => {
    try {
      await updateReproduction({ id: repro.id, statut: 'echouee' }).unwrap();
      toast.success('Reproduction marquée échouée');
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  const elevageDays = repro.date_eclosion
    ? differenceInDays(new Date(), parseISO(repro.date_eclosion))
    : '?';

  const SEXE_OPTIONS = [
    { val: 'inconnu', label: '?', icon: '❓' },
    { val: 'male',    label: 'Mâle',   icon: '♂' },
    { val: 'femelle', label: 'Femelle', icon: '♀' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
          <Wind size={10} /> Phase d'élevage
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded-xl p-2.5 border border-emerald-100">
            <span className="text-xl">🥚</span>
            <p className="text-base font-extrabold text-slate-800">{repro.nombre_oeufs ?? '—'}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Pondus</p>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-emerald-100">
            <span className="text-xl">🐣</span>
            <p className="text-base font-extrabold text-slate-800">{repro.nombre_nes ?? '—'}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Éclos</p>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-emerald-100">
            <span className="text-xl">📅</span>
            <p className="text-base font-extrabold text-slate-800">{elevageDays}j</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">D'élevage</p>
          </div>
        </div>
      </div>

      {/* Nombre de survivants */}
      <div>
        <label className="label">Pigeonnets envolés (survivants)</label>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: maxNes + 1 }, (_, i) => i).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => handleSetNb(n)}
              className={`flex-1 min-w-[56px] flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                nbSurvivants === n
                  ? n === 0 ? 'border-red-400 bg-red-50' : 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-lg">{n === 0 ? '😔' : '🕊️'}</span>
              <span className="text-xs font-extrabold text-slate-600">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Per-pigeonneau details */}
      <AnimatePresence>
        {nbSurvivants > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <p className="label">Détails des pigeonneaux</p>
            {pigeonneaux.map((p, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-3.5 space-y-2.5">
                {/* Pigeonneau header */}
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  🕊️ Pigeonneau {i + 1}
                </p>

                {/* Bague */}
                <input
                  type="text"
                  className="input"
                  placeholder={`Numéro de bague (ex: BAKU-${String(i + 1).padStart(3, '0')})`}
                  value={p.bague}
                  onChange={e => updateField(i, 'bague', e.target.value)}
                />

                {/* Nom (optionnel) */}
                <input
                  type="text"
                  className="input"
                  placeholder="Nom (optionnel)"
                  value={p.nom}
                  onChange={e => updateField(i, 'nom', e.target.value)}
                />

                {/* Sexe */}
                <div className="flex gap-2">
                  {SEXE_OPTIONS.map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => updateField(i, 'sexe', opt.val)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        p.sexe === opt.val
                          ? opt.val === 'male'    ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : opt.val === 'femelle' ? 'border-pink-400 bg-pink-50 text-pink-700'
                          :                        'border-slate-400 bg-slate-100 text-slate-700'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-slate-400 italic">
              La bague sera auto-générée si laissée vide. La race sera calculée à partir des parents.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 justify-end pt-1 border-t border-slate-100">
        <Button type="button" variant="danger" onClick={handleEchouee} disabled={isLoading}>
          <XCircle size={14} /> Marquer échouée
        </Button>
        <Button type="button" variant="success" onClick={handleCloture} disabled={isLoading}>
          {isLoading ? 'Clôture…' : <><Wind size={14} /> Clôturer l'élevage</>}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main update modal ───────────────────────────────────────────── */
export default function ReproductionUpdateModal({ isOpen, onClose, repro, onSuccess }) {
  if (!repro) return null;

  // Determine which stage to show
  // Si statut = en_cours et (nombre_nes = null/undefined ou 0), c'est qu'on n'a pas encore enregistré l'éclosion
  // (Car si on enregistre 0 éclos, le statut passe directement à 'echouee')
  const showEclosion    = repro.statut === 'en_cours' && (!repro.nombre_nes || repro.nombre_nes === 0);
  const showCloture     = repro.statut === 'en_cours' && repro.nombre_nes > 0;

  const title = showEclosion ? '🐣 Enregistrer l\'éclosion' : '🕊️ Clôturer l\'élevage';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {showEclosion && <EclosionStage repro={repro} onClose={onClose} onSuccess={onSuccess} />}
      {showCloture  && <ClotureStage  repro={repro} onClose={onClose} onSuccess={onSuccess} />}
      {!showEclosion && !showCloture && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertTriangle size={32} className="text-amber-400" />
          <p className="text-sm text-slate-500">Cette reproduction ne peut pas être mise à jour.</p>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      )}
    </Modal>
  );
}
