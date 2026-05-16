import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatAge } from '../../utils/helpers';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useDeletePigeonMutation } from '../../store/api/pigeonApi';
import { Edit2, MapPin, Trash2, Heart, CalendarDays, Home, Info, Feather } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Info row ────────────────────────────────────────────────────── */
function InfoRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${muted ? 'text-slate-400 italic' : 'text-slate-800'}`}>
        {value || <span className="text-slate-300 italic">—</span>}
      </span>
    </div>
  );
}

/* ─── Section block ───────────────────────────────────────────────── */
function Section({ icon: Icon, title, iconBg = 'bg-emerald-100', iconColor = 'text-emerald-600', children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <h4 className="text-sm font-extrabold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {title}
        </h4>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

/* ─── Main modal ──────────────────────────────────────────────────── */
export default function PigeonDetailModal({ isOpen, onClose, pigeon, onEdit }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletePigeon, { isLoading: isDeleting }] = useDeletePigeonMutation();

  if (!pigeon) return null;
  const isMale = pigeon.sexe === 'male';

  const handleDelete = async () => {
    try {
      const res = await deletePigeon(pigeon.id).unwrap();
      toast.success(res.message || 'Pigeon supprimé/archivé');
      setShowConfirm(false);
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const statusColors = {
    actif:  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Actif' },
    vendu:  { bg: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-400',  label: 'Vendu' },
    mort:   { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',   label: 'Mort'  },
    perdu:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Perdu' },
  };
  const st = statusColors[pigeon.statut] || statusColors.actif;

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={`🪬 ${pigeon.bague}`} size="lg">
      <div className="space-y-4">

        {/* ── Profile hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-5 p-5 rounded-2xl border ${
            isMale ? 'bg-blue-50/60 border-blue-100' : 'bg-pink-50/60 border-pink-100'
          }`}
        >
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${
            isMale ? 'bg-blue-100' : 'bg-pink-100'
          }`}>
            {pigeon.photo_url ? (
              <img src={pigeon.photo_url} alt="Pigeon" className="w-full h-full object-cover" />
            ) : (
              <img src={isMale ? "/male-placeholder.png" : "/female-placeholder.png"} alt="Pigeon Placeholder" className="w-full h-full object-cover p-1 opacity-90" />
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className="text-xl font-extrabold text-slate-800 truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {pigeon.nom || pigeon.bague}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 shrink-0 ${st.bg} ${st.text} ring-transparent`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className={`badge ${isMale ? 'badge-pigeon' : 'badge-warning'}`}>
                {isMale ? '♂ Mâle' : '♀ Femelle'}
              </span>
              {pigeon.race && <span className="badge badge-libre">{pigeon.race}</span>}
              {pigeon.date_naissance && (
                <span className="badge bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                  {formatAge(pigeon.date_naissance)}
                </span>
              )}
              {pigeon.couple_actif_id && (
                <span className="badge badge-couple">💕 En couple</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Info grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Identité */}
          <Section icon={Feather} title="Identité" iconBg="bg-blue-100" iconColor="text-blue-600">
            <InfoRow label="Bague"    value={pigeon.bague} />
            <InfoRow label="Nom"      value={pigeon.nom} />
            <InfoRow label="Race"     value={pigeon.race} />
            <InfoRow label="Couleur"  value={pigeon.couleur} />
            <InfoRow label="Naissance" value={formatDate(pigeon.date_naissance)} />
            <InfoRow label="Origine"  value={pigeon.origine} />
          </Section>

          {/* Généalogie */}
          <Section icon={Heart} title="Généalogie" iconBg="bg-rose-100" iconColor="text-rose-500">
            <InfoRow label="Père" value={pigeon.pere?.bague} />
            <InfoRow label="Mère" value={pigeon.mere?.bague} />
            {/* Localisation */}
            <div className="mt-3 pt-3 border-t border-slate-50">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <Home size={14} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Cage actuelle</p>
                  <p className="text-sm font-bold text-emerald-900">
                    {pigeon.cage
                      ? `${pigeon.cage.voliere} — ${pigeon.cage.numero}`
                      : 'Non affecté à une cage'}
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Notes */}
        {pigeon.notes && (
          <Section icon={Info} title="Notes" iconBg="bg-amber-100" iconColor="text-amber-600">
            <p className="text-sm text-slate-600 leading-relaxed py-1 whitespace-pre-line">
              {pigeon.notes}
            </p>
          </Section>
        )}

        {/* ── Actions ── */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
          <p className="section-title mb-3">Actions</p>
          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <Button
                variant="info"
                onClick={() => { onEdit(pigeon); onClose(); }}
              >
                <Edit2 size={14} /> Modifier le pigeon
              </Button>
            )}
            {pigeon.cage && (
              <Button variant="outline">
                <MapPin size={14} /> Voir la cage
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 size={14} /> Supprimer
            </Button>
          </div>
        </div>

      </div>
    </Modal>

    <ConfirmDialog
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={handleDelete}
      loading={isDeleting}
      title="Supprimer le pigeon"
      message={`Voulez-vous vraiment supprimer le pigeon "${pigeon.nom || pigeon.bague}" ? S'il a des descendants, il sera simplement archivé (soft delete) au lieu d'être effacé.`}
      confirmLabel="Oui, supprimer"
      variant="danger"
    />
    </>
  );
}
