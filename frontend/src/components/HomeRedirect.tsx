import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomeRedirect() {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-slate-500 text-sm">
        Loading session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/seller'} replace />;
}
