import { useForm } from 'react-hook-form';
import { useGetPigeonsQuery } from '../../store/api/pigeonApi';
import { useCreateCoupleMutation } from '../../store/api/coupleApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

export default function CoupleForm({ isOpen, onClose }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [createCouple, { isLoading }] = useCreateCoupleMutation();

  const { data: malesData, isLoading: loadingMales } = useGetPigeonsQuery(
    { sexe: 'male', statut: 'actif' }, { skip: !isOpen }
  );
  const { data: femellesData, isLoading: loadingFemelles } = useGetPigeonsQuery(
    { sexe: 'femelle', statut: 'actif' }, { skip: !isOpen }
  );

  const males    = (malesData?.data    || []).filter(p => !p.couple_actif_id);
  const femelles = (femellesData?.data || []).filter(p => !p.couple_actif_id);

  const onSubmit = async (data) => {
    try {
      await createCouple(data).unwrap();
      toast.success('Couple formé avec succès');
      reset();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur lors de la formation du couple');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Former un couple" size="md">
      {(loadingMales || loadingFemelles) ? <Loader size="sm" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Mâle *</label>
            <select className="input" {...register('male_id', { required: 'Requis' })}>
              <option value="">— Sélectionner un mâle —</option>
              {males.map(p => (
                <option key={p.id} value={p.id}>{p.bague} {p.nom ? `(${p.nom})` : ''} · {p.race || '—'}</option>
              ))}
            </select>
            {errors.male_id && <p className="text-xs text-red-500 mt-1">{errors.male_id.message}</p>}
          </div>

          <div>
            <label className="label">Femelle *</label>
            <select className="input" {...register('femelle_id', { required: 'Requis' })}>
              <option value="">— Sélectionner une femelle —</option>
              {femelles.map(p => (
                <option key={p.id} value={p.id}>{p.bague} {p.nom ? `(${p.nom})` : ''} · {p.race || '—'}</option>
              ))}
            </select>
            {errors.femelle_id && <p className="text-xs text-red-500 mt-1">{errors.femelle_id.message}</p>}
          </div>

          <div>
            <label className="label">Date de formation *</label>
            <input type="date" className="input" {...register('date_formation', { required: 'Requis' })} />
            {errors.date_formation && <p className="text-xs text-red-500 mt-1">{errors.date_formation.message}</p>}
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Remarques…" {...register('notes')} />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="warning" disabled={isLoading}>
              {isLoading ? 'Formation…' : '💕 Former le couple'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
