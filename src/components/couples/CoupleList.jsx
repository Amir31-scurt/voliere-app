import { useState } from 'react';
import { useGetCouplesQuery, useSeparerCoupleMutation } from '../../store/api/coupleApi';
import { motion, AnimatePresence } from 'framer-motion';
import CoupleCard from './CoupleCard';
import CoupleForm from './CoupleForm';
import CoupleDetailModal from './CoupleDetailModal';
import ConfirmDialog from '../common/ConfirmDialog';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { Heart, Plus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoupleList() {
  const [showForm, setShowForm]         = useState(false);
  const [separerTarget, setSeparerTarget] = useState(null);
  const [viewingCouple, setViewingCouple] = useState(null);
  const [statusFilter, setStatusFilter]   = useState('actif');

  const { data, isLoading } = useGetCouplesQuery({ statut: statusFilter || undefined });
  const [separerCouple, { isLoading: isSeparing }] = useSeparerCoupleMutation();
  const couples = Array.isArray(data) ? data : (data?.data || []);

  const handleSeparer = async () => {
    try {
      await separerCouple(separerTarget.id).unwrap();
      toast.success('Couple séparé');
      setSeparerTarget(null);
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
          <select
            className="input w-48 pl-9 pr-8 text-sm font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les couples</option>
            <option value="actif">❤️ Actifs</option>
            <option value="separé">💔 Séparés</option>
          </select>
        </div>

        <Button variant="warning" onClick={() => setShowForm(true)} className="shrink-0">
          <Plus size={16} /> Former un couple
        </Button>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-sm font-semibold text-slate-400">
          {couples.length} couple{couples.length !== 1 ? 's' : ''} trouvé{couples.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <Loader text="Chargement des couples…" />
      ) : couples.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aucun couple trouvé"
          description="Ajustez vos filtres ou formez un nouveau couple."
          color="rose"
          action={
            <Button variant="warning" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Former un couple
            </Button>
          }
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {couples.map((c) => (
              <CoupleCard key={c.id} couple={c} onSeparer={setSeparerTarget} onView={setViewingCouple} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <CoupleForm isOpen={showForm} onClose={() => setShowForm(false)} />
      <CoupleDetailModal isOpen={!!viewingCouple} onClose={() => setViewingCouple(null)} couple={viewingCouple} />
      <ConfirmDialog
        isOpen={!!separerTarget}
        onClose={() => setSeparerTarget(null)}
        onConfirm={handleSeparer}
        loading={isSeparing}
        title="Séparer le couple"
        message={`Voulez-vous séparer le ${separerTarget?.identifiant || 'couple'} (♂ ${separerTarget?.male?.bague} & ♀ ${separerTarget?.femelle?.bague}) ?`}
        confirmLabel="Séparer"
        variant="danger"
      />
    </div>
  );
}
