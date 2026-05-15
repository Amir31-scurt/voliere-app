import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react';
import CageGrid from '../components/cages/CageGrid';
import CageLegend from '../components/cages/CageLegend';
import ViewToggle from '../components/cages/ViewToggle';
import CageForm from '../components/cages/CageForm';
import Button from '../components/common/Button';
import { VOLIERES } from '../utils/constants';

export default function VolierePage() {
  const [voliere, setVoliere]           = useState(VOLIERES[0]);
  const [view, setView]                 = useState('grid');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showCageForm, setShowCageForm] = useState(false);
  const [selectedCage, setSelectedCage] = useState(null);

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* ══ Header — identical structure to Pigeons/Couples/Sorties ══ */}
      <div className="shrink-0 px-6 pt-6 pb-0">
        <motion.div 
          className="max-w-screen-xl mx-auto space-y-4"
          animate={{ paddingRight: selectedCage ? 360 + 32 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >

          {/* Row 1 — Icon + Title (same as all other pages) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
                            flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <LayoutGrid size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Volières
              </h1>
              <p className="text-sm text-slate-400 font-medium">Gestion des cages par volière</p>
            </div>
          </motion.div>

          {/* Row 2 — Toolbar (selector + view toggle + actions) */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200/60"
          >
            {/* Left: volière selector + legend */}
            <div className="flex items-center gap-4 flex-wrap">
                <select
                  value={voliere}
                  onChange={(e) => setVoliere(e.target.value)}
                  className="input font-bold text-slate-700 min-w-[140px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {VOLIERES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              <CageLegend />
            </div>

            {/* Right: view toggle + filter + new cage */}
            <div className="flex items-center gap-2">
              <ViewToggle view={view} onChange={setView} />
              <div className="h-5 w-px bg-slate-200" />
              <div className="relative flex items-center">
                <SlidersHorizontal
                  size={13}
                  className="absolute left-3 text-slate-400 pointer-events-none"
                />
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="input pl-8 text-slate-500 font-semibold h-9 text-xs py-0"
                >
                  <option value="all">Toutes les cages</option>
                  <option value="libre">Libres</option>
                  <option value="pigeon">1 Pigeon</option>
                  <option value="couple">Couples</option>
                </select>
              </div>
              <Button variant="primary" onClick={() => setShowCageForm(true)}>
                <Plus size={15} /> Nouvelle cage
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ══ Cage grid ══ */}
      <div className="flex-1 min-h-0 overflow-hidden max-w-screen-xl w-full mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={voliere}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="h-full"
          >
            <CageGrid 
              voliere={voliere} 
              view={view} 
              filterStatut={filterStatut}
              selectedCage={selectedCage}
              setSelectedCage={setSelectedCage}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <CageForm isOpen={showCageForm} onClose={() => setShowCageForm(false)} />
    </div>
  );
}
