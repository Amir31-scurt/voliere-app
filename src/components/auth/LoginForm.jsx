import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { setCredentials } from '../../store/authSlice';
import { baseApi } from '../../store/api/baseApi';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const endpoint = import.meta.env.PROD 
        ? 'https://voliere-server.vercel.app/api/auth/login' 
        : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth/login` : '/api/auth/login');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Identifiants incorrects');
      dispatch(setCredentials({ token: data.token, user: data.user }));
      dispatch(baseApi.util.resetApiState());
      toast.success(`Bienvenue ${data.user?.nom || data.user?.email} 👋`);
      navigate('/voliere');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          placeholder="votre@email.com"
          autoComplete="email"
          {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' } })}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Mot de passe</label>
        <input
          type="password"
          className="input"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password', { required: 'Requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" variant="primary" className="w-full justify-center" disabled={isLoading}>
        {isLoading ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  );
}
