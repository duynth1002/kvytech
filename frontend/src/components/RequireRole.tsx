import { Navigate } from 'react-router-dom';
import { useAuth, type AuthUser } from '../context/AuthContext';

type Role = AuthUser['role'];

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
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

  if (user.role !== role) {
    const fallback = user.role === 'ADMIN' ? '/admin' : '/seller';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
