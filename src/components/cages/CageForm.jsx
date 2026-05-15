import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateCageMutation, useUpdateCageMutation } from '../../store/api/cageApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { VOLIERES } from '../../utils/constants';

export default function CageForm({ isOpen, onClose, cage = null }) {
  const isEditing = !!cage;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [createCage, { isLoading: isCreating }] = useCreateCageMutation();
  const [updateCage, { isLoading: isUpdating }] = useUpdateCageMutation();
  const isLoading = isCreating || isUpdating;

  // Pre-fill form when editing
  useEffect(() => {
    if (cage) {
      reset({
        numero:     cage.numero     || '',
        voliere:    cage.voliere    || VOLIERES[0],
        nom:        cage.nom        || '',
        superficie: cage.superficie || '',
      });
    } else {
      reset({ numero: '', voliere: VOLIERES[0], nom: '', superficie: '' });
    }
  }, [cage, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateCage({ id: cage.id, ...data }).unwrap();
        toast.success('Cage modifiée avec succès');
      } else {
        await createCage(data).unwrap();
        toast.success('Cage créée avec succès');
      }
      reset();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Modifier la cage ${cage.numero}` : 'Nouvelle cage'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Numéro *</label>
          <input className="input" placeholder="ex: A01" {...register('numero', { required: 'Requis' })} />
          {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero.message}</p>}
        </div>
        <div>
          <label className="label">Volière *</label>
          <select className="input" {...register('voliere', { required: true })}>
            {VOLIERES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Nom (optionnel)</label>
          <input className="input" placeholder="ex: Grande cage" {...register('nom')} />
        </div>
        <div>
          <label className="label">Superficie (m²)</label>
          <input type="number" step="0.01" className="input" placeholder="ex: 2.5" {...register('superficie')} />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Modification…' : 'Création…') : (isEditing ? 'Enregistrer' : 'Créer la cage')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
