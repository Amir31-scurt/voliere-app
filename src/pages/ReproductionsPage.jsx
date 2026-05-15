import { motion } from 'framer-motion';
import { Egg } from 'lucide-react';
import ReproductionList from '../components/reproductions/ReproductionList';

export default function ReproductionsPage() {
  return (
    <div className="h-full overflow-y-auto panel-scroll">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Egg size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Reproductions
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Suivi des pontes, éclosions et naissances
            </p>
          </div>
        </motion.div>

        <ReproductionList />
      </div>
    </div>
  );
}
