import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-7xl mb-4">🕊️</div>
        <h1 className="text-5xl font-extrabold text-gray-200 mb-2">404</h1>
        <p className="text-lg font-semibold text-gray-700 mb-1">Page introuvable</p>
        <p className="text-sm text-gray-400 mb-6">Ce pigeon s'est envolé… la page n'existe pas.</p>
        <Link to="/voliere">
          <Button variant="primary">Retour à la volière</Button>
        </Link>
      </div>
    </div>
  );
}
