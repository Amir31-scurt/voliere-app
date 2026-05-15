/* Badge variant map including info/warning/danger/success */
const VARIANTS = {
  libre:    'badge-libre',
  pigeon:   'badge-pigeon',
  couple:   'badge-couple',
  actif:    'badge-actif',
  success:  'badge-success',
  vendu:    'badge-vendu',
  mort:     'badge-mort',
  perdu:    'badge-perdu',
  info:     'badge-info',
  warning:  'badge-warning',
  danger:   'badge-danger',
  default:  'badge bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`${VARIANTS[variant] ?? VARIANTS.default} ${className}`}>
      {children}
    </span>
  );
}
