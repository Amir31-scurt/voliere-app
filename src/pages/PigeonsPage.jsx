import { motion } from 'framer-motion';
import { Bird } from 'lucide-react';
import PigeonList from '../components/pigeons/PigeonList';

export default function PigeonsPage() {
  return (
    <div className="h-full overflow-y-auto panel-scroll">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bird size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Pigeons
            </h1>
            <p className="text-sm text-slate-400 font-medium">Gérez votre inventaire de pigeons</p>
          </div>
        </motion.div>
        <PigeonList />
      </div>
    </div>
  );
}
