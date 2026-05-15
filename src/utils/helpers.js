import { format, parseISO, differenceInYears, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatAge(dateNaissance) {
  if (!dateNaissance) return '—';
  try {
    const date = parseISO(dateNaissance);
    const years  = differenceInYears(new Date(), date);
    const months = differenceInMonths(new Date(), date) % 12;
    if (years === 0) return `${months} mois`;
    if (months === 0) return `${years} an${years > 1 ? 's' : ''}`;
    return `${years} an${years > 1 ? 's' : ''} ${months} mois`;
  } catch {
    return '—';
  }
}

export function formatBague(bague) {
  return bague || '—';
}

export function getCageClass(statut) {
  if (statut === 'pigeon') return 'cage-pigeon';
  if (statut === 'couple') return 'cage-couple';
  return 'cage-libre';
}

export function getStatutLabel(statut) {
  const labels = {
    libre:   'Libre',
    pigeon:  '1 pigeon',
    couple:  '2 pigeons',
    actif:   'Actif',
    vendu:   'Vendu',
    mort:    'Mort',
    perdu:   'Perdu',
    separé:  'Séparé',
  };
  return labels[statut] || statut;
}

export function getSexeLabel(sexe) {
  return sexe === 'male' ? 'Mâle' : sexe === 'femelle' ? 'Femelle' : '—';
}
