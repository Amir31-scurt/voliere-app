import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/common/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VolierePage from './pages/VolierePage';
import PigeonsPage from './pages/PigeonsPage';
import CouplesPage from './pages/CouplesPage';
import ReproductionsPage from './pages/ReproductionsPage';
import SortiesPage from './pages/SortiesPage';
import NotFoundPage from './pages/NotFoundPage';

function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen text-slate-900" style={{fontFamily:"'Inter','Plus Jakarta Sans',system-ui,sans-serif"}}>
      <Navbar />
      <main className="flex-1 overflow-hidden min-h-0">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Redirect root to dashboard or voliere */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Private routes */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/voliere" element={<PrivateRoute><Layout><VolierePage /></Layout></PrivateRoute>} />
        <Route path="/pigeons" element={<PrivateRoute><Layout><PigeonsPage /></Layout></PrivateRoute>} />
        <Route path="/couples" element={<PrivateRoute><Layout><CouplesPage /></Layout></PrivateRoute>} />
        <Route path="/reproductions" element={<PrivateRoute><Layout><ReproductionsPage /></Layout></PrivateRoute>} />
        <Route path="/sorties" element={<PrivateRoute><Layout><SortiesPage /></Layout></PrivateRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
