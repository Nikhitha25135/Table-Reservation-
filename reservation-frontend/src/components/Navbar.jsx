import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className={`navbar ${user?.role === 'admin' ? 'navbar--admin' : ''}`}>
      <div className="navbar__brand">
        <span className="navbar__mark">&#127869;</span>
        <span className="navbar__name">The Ledger</span>
        {user?.role === 'admin' && <span className="navbar__tag">Admin</span>}
      </div>

      {user && (
        <nav className="navbar__links">
          {user.role === 'customer' && (
            <NavLink to="/book" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
              Book a table
            </NavLink>
          )}
          {user.role === 'admin' && (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                Reservations
              </NavLink>
              <NavLink to="/admin/tables" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                Tables
              </NavLink>
            </>
          )}
          <span className="navbar__user">{user.name}</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={logout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
