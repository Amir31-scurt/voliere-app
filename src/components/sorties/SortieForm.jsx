import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGetPigeonsQuery } from '../../store/api/pigeonApi';
import { useCreateSortieMutation } from '../../store/api/sortieApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

export default function SortieForm({ isOpen, onClose }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ defaultValues: { type: 'vente' } });
  const [createSortie, { isLoading }] = useCreateSortieMutation();
  const type = watch('type');

  const { data: pigeonsData, isLoading: loadingPigeons } = useGetPigeonsQuery(
    { statut: 'actif' }, { skip: !isOpen }
  );
  const pigeons = pigeonsData?.data || [];

  const onSubmit = async (data) => {
    try {
      await createSortie(data).unwrap();
      toast.success('Sortie enregistrée');
      reset();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une sortie" size="md">
      {loadingPigeons ? <Loader size="sm" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div>
            <label className="label">Type de sortie *</label>
            <div className="flex gap-2">
              {[
                { val: 'vente', label: '💰 Vente', cls: 'border-blue-400 bg-blue-50 text-blue-700' },
                { val: 'deces', label: '🕊️ Décès', cls: 'border-gray-400 bg-gray-50 text-gray-700' },
                { val: 'perte', label: '❓ Perte',  cls: 'border-orange-400 bg-orange-50 text-orange-700' },
              ].map(({ val, label, cls }) => (
                <label key={val} className={`flex-1 text-center py-2 rounded-lg text-sm font-medium border cursor-pointer transition ${type === val ? cls : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" value={val} className="sr-only" {...register('type')} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Pigeon */}
          <div>
            <label className="label">Pigeon *</label>
            <select className="input" {...register('pigeon_id', { required: 'Requis' })}>
              <option value="">— Sélectionner —</option>
              {pigeons.map(p => (
                <option key={p.id} value={p.id}>{p.bague} {p.nom ? `(${p.nom})` : ''}</option>
              ))}
            </select>
            {errors.pigeon_id && <p className="text-xs text-red-500 mt-1">{errors.pigeon_id.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input" {...register('date', { required: 'Requis' })} />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          {/* Vente fields */}
          {type === 'vente' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prix (FCFA)</label>
                <input type="number" step="0.01" className="input" placeholder="0" {...register('prix')} />
              </div>
              <div>
                <label className="label">Acheteur</label>
                <input className="input" placeholder="Nom de l'acheteur" {...register('acheteur')} />
              </div>
            </div>
          )}

          {/* Décès */}
          {type === 'deces' && (
            <div>
              <label className="label">Cause probable</label>
              <input className="input" placeholder="ex: Maladie, accident…" {...register('cause_probable')} />
            </div>
          )}

          {/* Perte */}
          {type === 'perte' && (
            <div>
              <label className="label">Circonstance</label>
              <input className="input" placeholder="ex: Perdu en vol…" {...register('circonstance')} />
            </div>
          )}

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} {...register('notes')} />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
