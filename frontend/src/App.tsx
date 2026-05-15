import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SellerView from './pages/SellerView';
import AdminView from './pages/AdminView';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight text-blue-600">KVY TECH</div>
            <nav className="flex gap-4">
              <Link to="/seller" className="text-slate-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
                Seller Portal
              </Link>
              <Link to="/admin" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
                Admin Portal
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SellerView />} />
            <Route path="/seller" element={<SellerView />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;
