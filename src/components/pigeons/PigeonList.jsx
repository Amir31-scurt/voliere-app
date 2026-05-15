import { useState } from 'react';
import { useGetPigeonsQuery } from '../../store/api/pigeonApi';
import { motion, AnimatePresence } from 'framer-motion';
import PigeonCard from './PigeonCard';
import PigeonForm from './PigeonForm';
import PigeonDetailModal from './PigeonDetailModal';
import PigeonFilters from './PigeonFilters';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { Bird, Plus } from 'lucide-react';

export default function PigeonList() {
  const [filters, setFilters]           = useState({ statut: 'actif', sexe: '', search: '' });
  const [showForm, setShowForm]         = useState(false);
  const [editingPigeon, setEditingPigeon] = useState(null);
  const [viewingPigeon, setViewingPigeon] = useState(null);

  const { data, isLoading } = useGetPigeonsQuery(filters);
  const pigeons = data?.data || [];

  const handleEdit = (pigeon) => { setEditingPigeon(pigeon); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditingPigeon(null); };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PigeonFilters filters={filters} onChange={setFilters} />
        <Button variant="info" onClick={() => setShowForm(true)} className="shrink-0">
          <Plus size={16} /> Ajouter un pigeon
        </Button>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-sm font-semibold text-slate-400">
          {pigeons.length} pigeon{pigeons.length !== 1 ? 's' : ''} trouvé{pigeons.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <Loader text="Chargement du colombier…" />
      ) : pigeons.length === 0 ? (
        <EmptyState
          icon={Bird}
          title="Aucun pigeon trouvé"
          description="Essayez de modifier vos filtres ou ajoutez un nouveau pigeon."
          color="blue"
          action={
            <Button variant="info" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Ajouter un pigeon
            </Button>
          }
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.045 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {pigeons.map((p) => (
              <PigeonCard key={p.id} pigeon={p} onEdit={handleEdit} onView={setViewingPigeon} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <PigeonForm isOpen={showForm} onClose={closeForm} pigeon={editingPigeon} />
      <PigeonDetailModal
        isOpen={!!viewingPigeon}
        onClose={() => setViewingPigeon(null)}
        pigeon={viewingPigeon}
        onEdit={handleEdit}
      />
    </div>
  );
}
