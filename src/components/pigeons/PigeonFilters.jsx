import { Search } from 'lucide-react';
import { RACES } from '../../utils/constants';

export default function PigeonFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className="input pl-9 w-48 text-sm"
          placeholder="Rechercher par bague…"
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      {/* Sexe */}
      <select
        className="input w-36 text-sm font-medium"
        value={filters.sexe || ''}
        onChange={(e) => set('sexe', e.target.value)}
      >
        <option value="">Tous sexes</option>
        <option value="male">♂ Mâle</option>
        <option value="femelle">♀ Femelle</option>
      </select>

      {/* Statut */}
      <select
        className="input w-36 text-sm font-medium"
        value={filters.statut || 'actif'}
        onChange={(e) => set('statut', e.target.value)}
      >
        <option value="">Tous statuts</option>
        <option value="actif">✅ Actif</option>
        <option value="vendu">💜 Vendu</option>
        <option value="mort">⚫ Mort</option>
        <option value="perdu">🟡 Perdu</option>
      </select>

      {/* Race */}
      <select
        className="input w-44 text-sm font-medium"
        value={filters.race || ''}
        onChange={(e) => set('race', e.target.value)}
      >
        <option value="">Toutes races</option>
        {RACES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}
