import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title, message,
  confirmLabel = 'Confirmer',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4 mb-6">
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed pt-2">{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? 'En cours…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
