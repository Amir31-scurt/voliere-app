import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import CoupleList from '../components/couples/CoupleList';

export default function CouplesPage() {
  return (
    <div className="h-full overflow-y-auto panel-scroll">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Heart size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Couples
            </h1>
            <p className="text-sm text-slate-400 font-medium">Formation et gestion des couples de pigeons</p>
          </div>
        </motion.div>
        <CoupleList />
      </div>
    </div>
  );
}
