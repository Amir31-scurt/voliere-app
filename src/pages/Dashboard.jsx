import { useGetCagesQuery } from '../store/api/cageApi';
import { useGetPigeonsQuery } from '../store/api/pigeonApi';
import { useGetCouplesQuery } from '../store/api/coupleApi';
import { useGetSortiesQuery } from '../store/api/sortieApi';
import { motion } from 'framer-motion';
import { Bird, Home, Heart, Activity } from 'lucide-react';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { data: cagesData, isLoading: lc }   = useGetCagesQuery(undefined, { pollingInterval: 5000 });
  const { data: pigeonsData, isLoading: lp } = useGetPigeonsQuery({}, { pollingInterval: 5000 });
  const { data: couplesData, isLoading: lcp } = useGetCouplesQuery({}, { pollingInterval: 5000 });
  const { data: sortiesData, isLoading: ls  } = useGetSortiesQuery({}, { pollingInterval: 5000 });

  const pigeons = pigeonsData?.data || [];
  const couples = Array.isArray(couplesData) ? couplesData : (couplesData?.data || []);
  const cages   = cagesData || [];
  const sorties = sortiesData?.data || [];

  if (lc || lp || lcp || ls) return <Loader text="Chargement de votre colombier…" />;

  const activePigeons = pigeons.filter(p => p.statut === 'actif').length;
  const activeCouples = couples.filter(c => c.statut === 'actif').length;
  const occupiedCages = cages.filter(c => c.statut !== 'libre').length;
  const occupancyRate = cages.length ? Math.round((occupiedCages / cages.length) * 100) : 0;

  const stats = [
    { title: 'Pigeons actifs', value: activePigeons, icon: Bird, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Couples formés', value: activeCouples, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Cages occupées', value: `${occupiedCages} / ${cages.length}`, icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Taux occupation', value: `${occupancyRate}%`, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto space-y-6">
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="heading-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
          Vue d'ensemble
        </h1>
        <p className="text-slate-500 font-medium mt-1">Gérez votre élevage en un clin d'œil</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card flex items-center p-5"
            >
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mr-4 shadow-inner`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Activités Récentes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel"
        >
          <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-emerald-500" /> Sorties Récentes
          </h2>
          <div className="space-y-3">
            {sorties.slice(0, 5).map(sortie => (
              <div key={sortie.id} className="flex items-center justify-between p-3 bg-white/50 border border-slate-100 rounded-xl hover:bg-white transition-colors cursor-default">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {sortie.pigeon?.bague} <span className="text-slate-400 font-normal">({sortie.pigeon?.race})</span>
                  </p>
                  <p className="text-xs font-semibold text-slate-500">{formatDate(sortie.date)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  sortie.type === 'vente' ? 'bg-emerald-100 text-emerald-700' :
                  sortie.type === 'deces' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {sortie.type.toUpperCase()}
                </span>
              </div>
            ))}
            {sorties.length === 0 && <p className="text-sm text-slate-500 italic p-4 text-center">Aucune activité récente.</p>}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
