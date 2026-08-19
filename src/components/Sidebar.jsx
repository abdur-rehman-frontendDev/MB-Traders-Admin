import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Products', icon: '🛒' },
  { to: '/categories', label: 'Categories', icon: '🗂️' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/customers', label: 'Customers', icon: '👥' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">
          <span className="gold">MB</span> <span className="white">TRADERS</span>
        </div>
        <div className="sidebar-brand-sub">ADMIN PANEL</div>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.name}</div>
        <div className="sidebar-user-phone">{user?.phone}</div>
        <button className="sidebar-logout" onClick={logout}>
          🚪 <span className="label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
