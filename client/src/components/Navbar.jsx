import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, LayoutDashboard, UploadCloud, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Globe size={22} />
          </div>
          <span>ClimaHub</span>
        </Link>

        {isAuthenticated && (
          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/upload"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <UploadCloud size={18} />
              <span>Upload</span>
            </NavLink>

            <div className="nav-user-section">
              <div className="user-badge" title={user?.email || 'Logged in user'}>
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <span>{user?.name || 'Researcher'}</span>
              </div>

              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                title="Sign out of ClimaHub"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
