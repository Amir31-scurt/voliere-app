import { ChevronDown } from 'lucide-react';
import { VOLIERES } from '../../utils/constants';

export default function VoliereSelector({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none input pr-8 font-bold text-slate-700 cursor-pointer min-w-[120px]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {VOLIERES.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}
