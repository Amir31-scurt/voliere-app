import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPigeonsQuery } from '../../store/api/pigeonApi';
import { useGetCouplesQuery } from '../../store/api/coupleApi';
import { useAffecterCageMutation } from '../../store/api/cageApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { Bird, Heart, Search, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Pigeon select item ─────────────────────────────────────────── */
function PigeonOption({ pigeon, selected, onSelect }) {
  const isMale = pigeon.sexe === 'male';
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${
        selected
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50/70'
      }`}
    >
      <input
        type="radio"
        name="pigeon"
        value={pigeon.id}
        checked={selected}
        onChange={() => onSelect(pigeon.id)}
        className="sr-only"
      />
      {/* avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        isMale ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'
      }`}>
        {pigeon.photo_url
          ? <img src={pigeon.photo_url} alt={pigeon.bague} className="w-full h-full object-cover rounded-xl" />
          : <span className="text-lg leading-none">{isMale ? '♂' : '♀'}</span>
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800 truncate">{pigeon.nom || pigeon.bague}</p>
        <p className="text-xs text-slate-400 truncate">
          🪬 {pigeon.bague}{pigeon.race ? ` · ${pigeon.race}` : ''}
        </p>
      </div>
      {selected && <CheckCircle2 size={18} className="text-blue-500 shrink-0" />}
    </motion.label>
  );
}

/* ─── Couple select item ─────────────────────────────────────────── */
function CoupleOption({ couple, selected, onSelect }) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${
        selected
          ? 'border-rose-400 bg-rose-50 shadow-sm'
          : 'border-slate-100 hover:border-rose-200 hover:bg-slate-50/70'
      }`}
    >
      <input
        type="radio"
        name="couple"
        value={couple.id}
        checked={selected}
        onChange={() => onSelect(couple.id)}
        className="sr-only"
      />
      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
        <Heart size={18} className="text-rose-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          <span className="text-blue-500 font-extrabold">♂</span> {couple.male?.bague || '?'}
          {' '}<span className="text-slate-400">×</span>{' '}
          <span className="text-pink-500 font-extrabold">♀</span> {couple.femelle?.bague || '?'}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {couple.male?.race || '—'} · formé le {couple.date_formation?.slice(0, 10) || '?'}
        </p>
      </div>
      {selected && <CheckCircle2 size={18} className="text-rose-500 shrink-0" />}
    </motion.label>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────── */
export default function CageAffectModal({ cage, isOpen, onClose, defaultMode = 'pigeon' }) {
  const [mode, setMode] = useState(defaultMode);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');

  const { data: pigeonsData, isLoading: loadingPigeons } = useGetPigeonsQuery(
    { statut: 'actif' }, { skip: !isOpen }
  );
  const { data: couplesData, isLoading: loadingCouples } = useGetCouplesQuery(
    { statut: 'actif' }, { skip: !isOpen }
  );
  const [affecterCage, { isLoading }] = useAffecterCageMutation();

  const allPigeons   = (pigeonsData?.data || []).filter(p => !p.cage_actuelle_id && !p.couple_actif_id);
  const allCouples   = (Array.isArray(couplesData) ? couplesData : (couplesData?.data || [])).filter(c => !c.cage_id);

  const filteredPigeons = allPigeons.filter(p =>
    [p.bague, p.nom, p.race].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredCouples = allCouples.filter(c =>
    [c.male?.bague, c.femelle?.bague, c.male?.race].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSwitch = (m) => { setMode(m); setSelectedId(''); setSearch(''); };

  const handleSubmit = async () => {
    if (!selectedId) return;
    try {
      const body = mode === 'pigeon'
        ? { type: 'pigeon', pigeon_id: selectedId }
        : { type: 'couple', couple_id: selectedId };
      await affecterCage({ id: cage.id, ...body }).unwrap();
      toast.success(`Cage ${cage.numero} affectée avec succès`);
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur lors de l\'affectation');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Affecter la cage ${cage?.numero}`} size="md">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-2xl">
        {[
          { key: 'pigeon', label: 'Un pigeon', icon: Bird, activeColor: 'bg-white text-blue-600 shadow' },
          { key: 'couple', label: 'Un couple', icon: Heart, activeColor: 'bg-white text-rose-600 shadow' },
        ].map(({ key, label, icon: Icon, activeColor }) => (
          <button
            key={key}
            onClick={() => handleSwitch(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              mode === key ? activeColor : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={`Rechercher un ${mode === 'pigeon' ? 'pigeon' : 'couple'}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* List */}
      <div className="space-y-2 max-h-64 overflow-y-auto panel-scroll mb-5 -mx-1 px-1">
        {mode === 'pigeon' && (
          loadingPigeons ? <Loader size="sm" /> : (
            <>
              {filteredPigeons.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6 italic">Aucun pigeon disponible</p>
              )}
              {filteredPigeons.map(p => (
                <PigeonOption
                  key={p.id}
                  pigeon={p}
                  selected={selectedId === p.id}
                  onSelect={setSelectedId}
                />
              ))}
            </>
          )
        )}
        {mode === 'couple' && (
          loadingCouples ? <Loader size="sm" /> : (
            <>
              {filteredCouples.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6 italic">Aucun couple disponible</p>
              )}
              {filteredCouples.map(c => (
                <CoupleOption
                  key={c.id}
                  couple={c}
                  selected={selectedId === c.id}
                  onSelect={setSelectedId}
                />
              ))}
            </>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
        <Button
          variant={mode === 'couple' ? 'warning' : 'primary'}
          className="flex-1"
          onClick={handleSubmit}
          disabled={!selectedId || isLoading}
        >
          {isLoading ? 'Affectation…' : 'Confirmer'}
        </Button>
      </div>
    </Modal>
  );
}
