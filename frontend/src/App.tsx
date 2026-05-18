import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SellerView from './pages/SellerView';
import AdminView from './pages/AdminView';
import LoginPage from './pages/LoginPage';
import RequireRole from './components/RequireRole';
import HomeRedirect from './components/HomeRedirect';

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-bold text-xl tracking-tight text-blue-600 shrink-0">
            KVY TECH
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {user ? (
              <>
                {user.role === 'SELLER' && (
                  <Link
                    to="/seller"
                    className="text-slate-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm sm:text-base"
                  >
                    Seller Portal
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm sm:text-base"
                  >
                    Admin Portal
                  </Link>
                )}
                <span className="text-slate-400 hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm text-slate-500 max-w-[140px] sm:max-w-[200px] truncate" title={user.email}>
                  {user.name ?? user.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-red-600 px-2 py-2 rounded-md hover:bg-slate-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-slate-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route
            path="/seller"
            element={
              <RequireRole role="SELLER">
                <SellerView />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="ADMIN">
                <AdminView />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
