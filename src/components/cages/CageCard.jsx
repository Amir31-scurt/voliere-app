import { useState } from 'react';
import { motion } from 'framer-motion';

/* ─── Status config ───────────────────────────────────────────────── */
const STATUS = {
  libre:  { dot: 'bg-emerald-400', blobColor: '#10b981', label: 'Libre',    chipBg: null },
  pigeon: { dot: 'bg-red-400',    blobColor: '#ef4444', label: '1 pigeon', chipBg: null },
  couple: { dot: 'bg-orange-400', blobColor: '#f97316', label: 'Couple',   chipBg: null },
};

/* ─── Pigeon chip ─────────────────────────────────────────────────── */
function PigeonChip({ sexe, bague, nom }) {
  const isMale = sexe === 'male';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold backdrop-blur-sm ${
      isMale
        ? 'bg-white/70 border-blue-200 text-blue-800'
        : 'bg-white/70 border-pink-200 text-pink-800'
    }`}>
      <span className={`text-sm font-normal leading-none ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
        {isMale ? '♂' : '♀'}
      </span>
      <span className="truncate">{nom || bague}</span>
    </div>
  );
}

/* ─── CageCard ───────────────────────────────────────────────────── */
export default function CageCard({ cage, onClick, isSelected, view = 'grid' }) {
  const [hovered, setHovered] = useState(false);
  
  const isList = view === 'list';

  const status   = cage.statut || 'libre';
  const meta     = STATUS[status] || STATUS.libre;
  const isCouple = status === 'couple';
  const isPigeon = status === 'pigeon';
  const isLibre  = status === 'libre';

  const bgClass = isLibre ? 'cage-libre' : isPigeon ? 'cage-pigeon' : 'cage-couple';

  return (
    <motion.div
      layoutId={`cage-${cage.id}`}
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      whileHover={{ y: isList ? -2 : -4, scale: isList ? 1.005 : 1.02 }}
      whileTap={{ scale: isList ? 0.99 : 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(cage)}
      className={`relative cursor-pointer rounded-2xl border-2 p-4 overflow-hidden select-none
        ${isList ? 'flex flex-row items-center justify-between gap-4 h-20' : 'min-h-[148px] flex flex-col justify-between'}
        transition-shadow duration-200
        ${bgClass} ${isSelected ? 'cage-selected' : 'hover:shadow-md'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Decorative radial blob */}
      <div
        className="absolute -top-5 -right-5 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${meta.blobColor}, transparent 68%)`,
          opacity: hovered ? 0.22 : 0.12,
          transition: 'opacity 0.3s',
        }}
      />

      {/* ── Info part: numero + status badge ── */}
      <div className={`relative z-10 flex ${isList ? 'items-center gap-6 w-1/3' : 'items-start justify-between gap-2'}`}>
        <div>
          <h3
            className={`${isList ? 'text-2xl' : 'text-xl'} font-extrabold tracking-tight leading-none`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {cage.numero}
          </h3>
          {cage.voliere && !isList && (
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-0.5">
              {cage.voliere}
            </p>
          )}
        </div>

        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
          isLibre  ? 'bg-emerald-500/15 text-emerald-700' :
          isPigeon ? 'bg-red-500/15 text-red-700' :
                     'bg-orange-500/15 text-orange-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* ── Content: chips or placeholder ── */}
      <div className={`relative z-10 flex ${isList ? 'flex-row items-center flex-1 justify-end gap-2 mt-0' : 'flex-col gap-1.5 mt-3'}`}>

        {isPigeon && cage.pigeon && (
          <PigeonChip sexe={cage.pigeon.sexe} bague={cage.pigeon.bague} nom={cage.pigeon.nom} />
        )}

        {isCouple && cage.couple && (
          <div className={`flex gap-1 ${isList ? 'flex-row' : 'flex-col'}`}>
            {cage.couple.male && (
              <PigeonChip sexe="male" bague={cage.couple.male.bague} nom={cage.couple.male.nom} />
            )}
            {cage.couple.femelle && (
              <PigeonChip sexe="femelle" bague={cage.couple.femelle.bague} nom={cage.couple.femelle.nom} />
            )}
          </div>
        )}

        {isLibre && (
          <div className={`border-2 border-dashed border-emerald-300/50 rounded-xl flex items-center justify-center ${isList ? 'px-6 py-1.5' : 'py-3'}`}>
            <span className="text-xs font-semibold text-emerald-600/60">Disponible</span>
          </div>
        )}
      </div>

      {/* Selected pulse ring */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0 3px rgb(52 211 153 / 0.45)',
              '0 0 0 5px rgb(52 211 153 / 0.12)',
              '0 0 0 3px rgb(52 211 153 / 0.45)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}
