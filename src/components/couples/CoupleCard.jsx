import { motion } from 'framer-motion';
import { formatDate } from '../../utils/helpers';
import { HeartCrack, CalendarDays, Home } from 'lucide-react';

export default function CoupleCard({ couple, onSeparer, onView }) {
  const isActif = couple.statut === 'actif';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
        !isActif ? 'opacity-70' : ''
      }`}
      onClick={() => onView(couple)}
    >
      {/* Status stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${
        isActif ? 'from-rose-400 to-pink-500' : 'from-slate-300 to-slate-400'
      }`} />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ring-1 ${
            isActif
              ? 'bg-rose-100 text-rose-700 ring-rose-200'
              : 'bg-slate-100 text-slate-500 ring-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActif ? 'bg-rose-500' : 'bg-slate-400'}`} />
            {couple.identifiant || (isActif ? 'En couple' : 'Séparé')}
          </span>
          {couple.date_formation && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
              <CalendarDays size={10} />
              {formatDate(couple.date_formation)}
            </div>
          )}
        </div>

        {/* Pigeons pair */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
          {/* Male */}
          <div className="flex-1 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-xl">🕊️</span>
            </div>
            <p className="text-[10px] font-extrabold uppercase text-blue-500 tracking-widest">Mâle</p>
            <p className="text-xs font-bold text-slate-700 truncate">{couple.male?.bague || '?'}</p>
            {couple.male?.race && (
              <p className="text-[10px] text-slate-400">{couple.male.race}</p>
            )}
          </div>

          {/* Heart */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xl">❤️</span>
          </div>

          {/* Female */}
          <div className="flex-1 text-center">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-xl">🐦</span>
            </div>
            <p className="text-[10px] font-extrabold uppercase text-pink-500 tracking-widest">Femelle</p>
            <p className="text-xs font-bold text-slate-700 truncate">{couple.femelle?.bague || '?'}</p>
            {couple.femelle?.race && (
              <p className="text-[10px] text-slate-400">{couple.femelle.race}</p>
            )}
          </div>
        </div>

        {/* Cage badge */}
        {couple.cage && (
          <div className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl py-1.5 text-xs font-bold">
            <Home size={12} />
            {couple.cage.voliere} — {couple.cage.numero}
          </div>
        )}
      </div>

      {/* Separer button */}
      {isActif && (
        <button
          onClick={(e) => { e.stopPropagation(); onSeparer(couple); }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-xl shadow border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
          title="Séparer"
        >
          <HeartCrack size={13} />
        </button>
      )}
    </motion.div>
  );
}
