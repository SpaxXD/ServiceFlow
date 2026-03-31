import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            ServiceFlow
          </Link>
          {user && (
            <nav className="flex gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium ${
                  location.pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/clients"
                className={`text-sm font-medium ${
                  location.pathname === '/clients' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Clients
              </Link>
              <Link
                to="/services"
                className={`text-sm font-medium ${
                  location.pathname === '/services' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Services
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{user.role}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
