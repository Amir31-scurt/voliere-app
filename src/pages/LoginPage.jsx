import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🕊️</div>
          <h1 className="text-2xl font-bold text-gray-900">Volière App</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion de votre volière de pigeons</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-xl">
          <h2 className="text-base font-semibold text-gray-800 mb-6 text-center">Connexion</h2>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Application Bakeli · DTS 2024
        </p>
      </div>
    </div>
  );
}
