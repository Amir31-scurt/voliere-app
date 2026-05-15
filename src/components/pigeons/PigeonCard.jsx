import { motion } from 'framer-motion';
import { formatAge } from '../../utils/helpers';
import { Edit2 } from 'lucide-react';

const STATUT_STYLE = {
  actif:  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  vendu:  { bg: 'bg-violet-100',  text: 'text-violet-700',  ring: 'ring-violet-200',  dot: 'bg-violet-500'  },
  mort:   { bg: 'bg-slate-100',   text: 'text-slate-600',   ring: 'ring-slate-200',   dot: 'bg-slate-400'   },
  perdu:  { bg: 'bg-amber-100',   text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-500'   },
};

export default function PigeonCard({ pigeon, onEdit, onView }) {
  const isMale = pigeon.sexe === 'male';
  const st = STATUT_STYLE[pigeon.statut] || STATUT_STYLE.actif;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => onView(pigeon)}
    >
      {/* Top colour stripe */}
      <div
        className="h-1.5 w-full"
        style={{
          background: isMale
            ? 'linear-gradient(90deg,#3b82f6,#818cf8)'
            : 'linear-gradient(90deg,#f59e0b,#fb7185)',
        }}
      />

      <div className="p-4">
        {/* Avatar + name row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner ${
            isMale ? 'bg-blue-100' : 'bg-amber-100'
          }`}>
            {pigeon.photo_url
              ? <img src={pigeon.photo_url} alt="Pigeon" className="w-full h-full object-cover" />
              : <span className="text-3xl">{isMale ? '🕊️' : '🐦'}</span>
            }
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-extrabold text-slate-800 truncate leading-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {pigeon.nom || pigeon.bague}
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
              🪬 {pigeon.bague}{pigeon.race ? ` · ${pigeon.race}` : ''}
            </p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          {/* Sexe */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ${
            isMale
              ? 'bg-blue-100 text-blue-700 ring-blue-200'
              : 'bg-amber-100 text-amber-700 ring-amber-200'
          }`}>
            {isMale ? '♂ Mâle' : '♀ Femelle'}
          </span>

          {/* Age */}
          {pigeon.date_naissance && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              {formatAge(pigeon.date_naissance)}
            </span>
          )}

          {/* En couple */}
          {pigeon.couple_actif_id && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 ring-1 ring-rose-200">
              💕 En couple
            </span>
          )}

          {/* Statut */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ml-auto ${st.bg} ${st.text} ${st.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {pigeon.statut}
          </span>
        </div>
      </div>

      {/* Edit button on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(pigeon); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-xl shadow border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
        title="Modifier"
      >
        <Edit2 size={13} />
      </button>
    </motion.div>
  );
}
