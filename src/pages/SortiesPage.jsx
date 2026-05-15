import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import SortieList from '../components/sorties/SortieList';

export default function SortiesPage() {
  return (
    <div className="h-full overflow-y-auto panel-scroll">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Sorties
            </h1>
            <p className="text-sm text-slate-400 font-medium">Ventes, décès et pertes de pigeons</p>
          </div>
        </motion.div>
        <SortieList />
      </div>
    </div>
  );
}
