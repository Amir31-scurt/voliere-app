import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useGetCouplesQuery } from '../../store/api/coupleApi';
import { useCreateReproductionMutation } from '../../store/api/reproductionApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Egg, CalendarDays, Info, CheckCircle2 } from 'lucide-react';

/* ─── Pigeon reproduction cycle constants ─────────────────────────
   Sources: pigeon breeding literature
   • Incubation: 17-19 days (avg 18)
   • Élevage/sevrage: ~30 days after hatching
──────────────────────────────────────────────────────────────────── */
const INCUBATION_DAYS = 18;
const ELEVAGE_DAYS    = 30;

function DatePreview({ datePonte }) {
  if (!datePonte) return null;
  try {
    const ponte    = parseISO(datePonte);
    const eclosion = addDays(ponte, INCUBATION_DAYS);
    const envol    = addDays(eclosion, ELEVAGE_DAYS);
    const fmt = (d) => format(d, 'd MMM yyyy', { locale: fr });

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mt-3 space-y-2"
      >
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-500 mb-3 flex items-center gap-1.5">
          <CalendarDays size={10} /> Calendrier automatique
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { emoji: '🥚', label: 'Ponte',        date: fmt(ponte),    color: 'bg-white border-violet-200' },
            { emoji: '🐣', label: 'Éclosion ~',   date: fmt(eclosion), color: 'bg-white border-sky-200'    },
            { emoji: '🕊️', label: 'Envol ~',      date: fmt(envol),    color: 'bg-white border-emerald-200'},
          ].map(({ emoji, label, date, color }) => (
            <div key={label} className={`flex flex-col items-center p-2.5 rounded-xl border ${color}`}>
              <span className="text-xl mb-1">{emoji}</span>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{date}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-violet-400 text-center pt-1">
          Basé sur {INCUBATION_DAYS}j d'incubation + {ELEVAGE_DAYS}j d'élevage
        </p>
      </motion.div>
    );
  } catch {
    return null;
  }
}

export default function ReproductionForm({ isOpen, onClose, defaultCoupleId = null }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      date_ponte: format(new Date(), 'yyyy-MM-dd'),
      nombre_oeufs: 2,
    },
  });

  const [createReproduction, { isLoading }] = useCreateReproductionMutation();
  const { data: couplesData, isLoading: loadingCouples } = useGetCouplesQuery(
    { statut: 'actif' }, { skip: !isOpen }
  );
  const couples    = Array.isArray(couplesData) ? couplesData : (couplesData?.data || []);
  const datePonte  = watch('date_ponte');
  const coupleId   = watch('couple_id');
  const selectedCouple = couples.find(c => c.id === coupleId);

  // Pre-select couple if provided
  useEffect(() => {
    if (defaultCoupleId) setValue('couple_id', defaultCoupleId);
  }, [defaultCoupleId, setValue]);

  const onSubmit = async (data) => {
    try {
      const couple = couples.find(c => c.id === data.couple_id);
      if (!couple) return toast.error('Veuillez sélectionner un couple valide');

      // Auto-calculate expected eclosion date
      const eclosionPrevue = datePonte
        ? format(addDays(parseISO(datePonte), INCUBATION_DAYS), 'yyyy-MM-dd')
        : null;

      await createReproduction({
        couple_id:    data.couple_id,
        male_id:      couple.male_id,
        femelle_id:   couple.femelle_id,
        date_ponte:   data.date_ponte,
        date_eclosion: eclosionPrevue,   // stored as "prévue", updated when it happens
        nombre_oeufs: Number(data.nombre_oeufs) || 2,
        statut:       'en_cours',
        notes:        data.notes || null,
      }).unwrap();

      toast.success('🥚 Ponte enregistrée avec succès');
      reset({ date_ponte: format(new Date(), 'yyyy-MM-dd'), nombre_oeufs: 2 });
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une ponte" size="md">
      {loadingCouples ? <Loader size="sm" text="Chargement des couples…" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Info banner */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
            <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Enregistrez la date de ponte et le nombre d'œufs. La date d'éclosion et d'envol
              seront calculées automatiquement selon le cycle naturel du pigeon.
            </p>
          </div>

          {/* Couple selector */}
          <div>
            <label className="label">Couple *</label>
            <select
              className="input"
              {...register('couple_id', { required: 'Veuillez sélectionner un couple' })}
            >
              <option value="">— Sélectionner un couple —</option>
              {couples.map(c => (
                <option key={c.id} value={c.id}>
                  ♂ {c.male?.bague || '?'} × ♀ {c.femelle?.bague || '?'}
                </option>
              ))}
            </select>
            {errors.couple_id && <p className="text-xs text-red-500 mt-1">{errors.couple_id.message}</p>}

            {/* Selected couple preview */}
            {selectedCouple && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100"
              >
                <span className="text-sm">❤️</span>
                <span className="text-xs font-semibold text-rose-700">
                  <span className="text-blue-600">♂ {selectedCouple.male?.bague}</span>
                  {' × '}
                  <span className="text-pink-600">♀ {selectedCouple.femelle?.bague}</span>
                </span>
                {selectedCouple.cage && (
                  <span className="ml-auto text-[10px] text-slate-400">
                    🏠 {selectedCouple.cage.voliere} — {selectedCouple.cage.numero}
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Date de ponte */}
          <div>
            <label className="label">Date de ponte *</label>
            <input
              type="date"
              className="input"
              max={format(new Date(), 'yyyy-MM-dd')}
              {...register('date_ponte', { required: 'La date de ponte est requise' })}
            />
            {errors.date_ponte && <p className="text-xs text-red-500 mt-1">{errors.date_ponte.message}</p>}
          </div>

          {/* Nombre d'œufs — visual radio */}
          <div>
            <label className="label">Nombre d'œufs pondus *</label>
            <div className="flex gap-3">
              {[1, 2].map(n => (
                <label
                  key={n}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    String(watch('nombre_oeufs')) === String(n)
                      ? 'border-violet-400 bg-violet-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input type="radio" value={n} {...register('nombre_oeufs')} className="sr-only" />
                  <span className="text-2xl">{n === 1 ? '🥚' : '🥚🥚'}</span>
                  <span className={`text-sm font-extrabold ${
                    String(watch('nombre_oeufs')) === String(n) ? 'text-violet-700' : 'text-slate-500'
                  }`}>
                    {n} œuf{n > 1 ? 's' : ''}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Auto-calculated calendar preview */}
          <DatePreview datePonte={datePonte} />

          {/* Notes */}
          <div>
            <label className="label">Notes <span className="text-slate-400 font-normal">(optionnel)</span></label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Comportement, observations particulières…"
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="secondary" disabled={isLoading}>
              {isLoading
                ? 'Enregistrement…'
                : <><Egg size={15} /> Enregistrer la ponte</>}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
