export default function CageLegend() {
  const items = [
    { dot: 'bg-emerald-400 ring-2 ring-emerald-200', label: 'Libre' },
    { dot: 'bg-red-400 ring-2 ring-red-200',         label: '1 pigeon' },
    { dot: 'bg-orange-400 ring-2 ring-orange-200',   label: 'Couple' },
  ];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map(({ dot, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />
          <span className="text-xs font-semibold text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
