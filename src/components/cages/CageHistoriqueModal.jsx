import { useGetCageHistoriqueQuery } from '../../store/api/cageApi';
import { formatDateTime } from '../../utils/helpers';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { Clock } from 'lucide-react';

export default function CageHistoriqueModal({ cage, isOpen, onClose }) {
  const { data: historique = [], isLoading } = useGetCageHistoriqueQuery(cage.id, { skip: !isOpen });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historique - Cage ${cage.numero}`} size="md">
      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader /></div>
      ) : historique.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center opacity-60">
          <Clock size={32} className="mb-3 text-slate-400" />
          <p className="text-slate-500 font-medium">Aucun événement enregistré pour cette cage.</p>
        </div>
      ) : (
        <div className="relative pl-6 py-2">
          {/* Ligne verticale de la timeline */}
          <div className="absolute left-2 top-4 bottom-4 w-px bg-slate-200"></div>
          
          <div className="space-y-6">
            {historique.map((h) => (
              <div key={h.id} className="relative">
                {/* Point de la timeline */}
                <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-400 shadow-sm shadow-emerald-400/30"></div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{h.action}</p>
                      
                      {/* Affichage détaillé si c'est un pigeon ou un couple */}
                      {h.pigeon && (
                        <p className="text-xs font-semibold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                          Pigeon: {h.pigeon.nom || h.pigeon.bague}
                        </p>
                      )}
                      {h.couple && (
                        <p className="text-xs font-semibold text-rose-600 mt-1 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                          Couple affecté (ID: {h.couple.id.split('-')[0]})
                        </p>
                      )}
                    </div>
                    
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                      {formatDateTime(h.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
