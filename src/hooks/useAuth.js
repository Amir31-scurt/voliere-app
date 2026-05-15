import { useSelector } from 'react-redux';

export function useAuth() {
  const token = useSelector((s) => s.auth.token);
  const user  = useSelector((s) => s.auth.user);
  return { token, user, isAuthenticated: !!token };
}
