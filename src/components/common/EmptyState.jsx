import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action, color = 'slate' }) {
  const iconBg = {
    slate:   'bg-slate-100',
    emerald: 'bg-emerald-100',
    blue:    'bg-blue-100',
    rose:    'bg-rose-100',
    amber:   'bg-amber-100',
    violet:  'bg-violet-100',
  }[color] ?? 'bg-slate-100';

  const iconColor = {
    slate:   'text-slate-400',
    emerald: 'text-emerald-400',
    blue:    'text-blue-400',
    rose:    'text-rose-400',
    amber:   'text-amber-400',
    violet:  'text-violet-400',
  }[color] ?? 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="empty-state"
    >
      {Icon && (
        <div className={`empty-state-icon ${iconBg}`}>
          <Icon size={34} className={iconColor} />
        </div>
      )}
      <h3
        className="text-lg font-extrabold text-slate-700 mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 mb-5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && action}
    </motion.div>
  );
}
