import { LogOut, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function DashboardLayout({ title, subtitle, children, headerExtra }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
            <Leaf size={22} />
            FoodLink AI
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold text-gray-800">{user.full_name}</p>
                <p className="text-gray-400 capitalize">{user.role}</p>
              </div>
            )}
            <Link
              to="/impact"
              className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Impact
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerExtra}
        </div>
        {children}
      </main>
    </div>
  );
}
