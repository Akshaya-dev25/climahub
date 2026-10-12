import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, LayoutDashboard, UploadCloud, LogOut, Leaf } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-logo-wrapper">
            <Globe size={22} />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">ClimaHub</span>
            <span className="nav-brand-tagline">Climate Intelligence</span>
          </div>
        </Link>

        {isAuthenticated && (
          <nav className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/upload"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <UploadCloud size={18} />
              <span>Upload Dataset</span>
            </NavLink>

            <div className="nav-user-cluster">
              <div className="user-profile-pill" title={user?.email || 'Authenticated Researcher'}>
                <div className="user-avatar-circle">
                  {getInitials(user?.name)}
                </div>
                <span>{user?.name || 'Researcher'}</span>
              </div>

              <button
                type="button"
                className="btn-nav-logout"
                onClick={handleLogout}
                title="Sign out of ClimaHub"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
