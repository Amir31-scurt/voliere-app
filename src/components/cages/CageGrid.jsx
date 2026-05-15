import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetCagesQuery } from '../../store/api/cageApi';
import CageCard from './CageCard';
import CageDetailPanel from './CageDetailPanel';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { Inbox } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045 } },
};

const PANEL_WIDTH = 360;

export default function CageGrid({ voliere, view, filterStatut = 'all', selectedCage, setSelectedCage }) {
  const { data: cages = [], isLoading } = useGetCagesQuery(voliere, { pollingInterval: 5000 });

  if (isLoading) return <Loader text={`Chargement de ${voliere}…`} />;
  if (cages.length === 0) return (
    <EmptyState
      icon={Inbox}
      title="Aucune cage"
      description={`Aucune cage dans ${voliere}. Ajoutez-en une !`}
    />
  );

  const filteredCages = cages.filter(cage => {
    if (filterStatut === 'all') return true;
    return cage.statut === filterStatut;
  });

  if (filteredCages.length === 0) return (
    <EmptyState
      icon={Inbox}
      title="Aucune cage trouvée"
      description={`Aucune cage ne correspond au filtre "${filterStatut}" dans ${voliere}.`}
    />
  );

  const handleSelect = (cage) => {
    setSelectedCage(cage.id === selectedCage?.id ? null : cage);
  };

  return (
    <div className="relative flex h-full overflow-hidden">

      <motion.div
        className="flex-1 overflow-y-auto panel-scroll py-5 transition-all duration-300 ease-out"
        animate={{ paddingRight: selectedCage ? PANEL_WIDTH + 32 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          layout
          className={`grid gap-4 px-2 pb-4 ${
            view === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence>
            {filteredCages.map((cage) => (
              <CageCard
                key={cage.id}
                cage={cage}
                view={view}
                isSelected={selectedCage?.id === cage.id}
                onClick={handleSelect}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ── Slide-in detail panel ── */}
      <AnimatePresence>
        {selectedCage && (
          <motion.aside
            key="detail-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed top-16 right-0 bottom-0 z-40 overflow-hidden"
            style={{ width: PANEL_WIDTH }}
          >
            <div className="h-full bg-white/98 backdrop-blur-2xl border-l border-slate-100/80 shadow-[−4px_0_32px_rgba(0,0,0,0.08)] relative flex flex-col">
              <CageDetailPanel
                cage={selectedCage}
                onClose={() => setSelectedCage(null)}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
