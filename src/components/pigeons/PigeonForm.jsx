import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePigeonMutation, useUpdatePigeonMutation } from '../../store/api/pigeonApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { RACES, COULEURS, ORIGINES } from '../../utils/constants';

export default function PigeonForm({ isOpen, onClose, pigeon = null }) {
  const isEdit = !!pigeon;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: pigeon || { sexe: 'male', statut: 'actif', origine: 'né ici' },
  });

  useEffect(() => {
    reset(pigeon || { sexe: 'male', statut: 'actif', origine: 'né ici' });
  }, [pigeon, reset]);

  const [createPigeon, { isLoading: creating }] = useCreatePigeonMutation();
  const [updatePigeon, { isLoading: updating }] = useUpdatePigeonMutation();
  const isLoading = creating || updating;

  const onSubmit = async (data) => {
    // remove empty strings
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
    try {
      if (isEdit) {
        await updatePigeon({ id: pigeon.id, ...data }).unwrap();
        toast.success('Pigeon modifié');
      } else {
        await createPigeon(data).unwrap();
        toast.success('Pigeon ajouté');
      }
      reset();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier le pigeon' : 'Nouveau pigeon'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        {/* Bague */}
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Bague / Matricule *</label>
          <input className="input" placeholder="SN-2024-001" {...register('bague', { required: 'Requis' })} />
          {errors.bague && <p className="text-xs text-red-500 mt-1">{errors.bague.message}</p>}
        </div>
        {/* Nom */}
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Nom</label>
          <input className="input" placeholder="ex: Apollo" {...register('nom')} />
        </div>
        {/* Sexe */}
        <div>
          <label className="label">Sexe *</label>
          <select className="input" {...register('sexe', { required: true })}>
            <option value="male">Mâle</option>
            <option value="femelle">Femelle</option>
          </select>
        </div>
        {/* Race */}
        <div>
          <label className="label">Race</label>
          <select className="input" {...register('race')}>
            <option value="">— Choisir —</option>
            {RACES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {/* Date naissance */}
        <div>
          <label className="label">Date de naissance</label>
          <input type="date" className="input" {...register('date_naissance')} />
        </div>
        {/* Couleur */}
        <div>
          <label className="label">Couleur</label>
          <select className="input" {...register('couleur')}>
            <option value="">— Choisir —</option>
            {COULEURS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Origine */}
        <div>
          <label className="label">Origine</label>
          <select className="input" {...register('origine')}>
            {ORIGINES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        {/* Statut */}
        <div>
          <label className="label">Statut</label>
          <select className="input" {...register('statut')}>
            <option value="actif">Actif</option>
            <option value="vendu">Vendu</option>
            <option value="mort">Mort</option>
            <option value="perdu">Perdu</option>
          </select>
        </div>
        {/* Photo URL */}
        <div className="col-span-2">
          <label className="label">Lien de la photo (URL)</label>
          <input type="url" className="input" placeholder="https://..." {...register('photo_url')} />
        </div>
        {/* Notes */}
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input resize-none" rows={2} placeholder="Remarques…" {...register('notes')} />
        </div>
        {/* Actions */}
        <div className="col-span-2 flex gap-2 justify-end pt-1">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
