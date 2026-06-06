import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, CreditCard,
  TrendingDown, BarChart3, Building2,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/residents', icon: Users, label: 'Penghuni' },
  { to: '/houses', icon: Home, label: 'Rumah' },
  { to: '/payments', icon: CreditCard, label: 'Pembayaran' },
  { to: '/expenses', icon: TrendingDown, label: 'Pengeluaran' },
  { to: '/reports', icon: BarChart3, label: 'Laporan' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Building2 size={22} color="#fff" />
        </div>
        <h1>Manajemen<br />Perumahan</h1>
        <p>Sistem Administrasi RT</p>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu Utama</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive || (to !== '/' && location.pathname.startsWith(to)) ? 'active' : ''}`
            }
          >
            <Icon className="nav-icon" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        v1.0.0 &bull; RT Management System
      </div>
    </aside>
  );
}
