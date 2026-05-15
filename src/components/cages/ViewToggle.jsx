import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
      {[
        { key: 'grid', Icon: LayoutGrid, title: 'Vue grille' },
        { key: 'list', Icon: List,       title: 'Vue liste'  },
      ].map(({ key, Icon, title }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          title={title}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            view === key
              ? 'bg-white shadow-sm text-emerald-600 shadow-emerald-100'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
          }`}
        >
          <Icon size={15} strokeWidth={view === key ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );
}
