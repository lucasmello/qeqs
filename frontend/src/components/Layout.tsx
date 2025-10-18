import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <h1 className={styles.logo}>🍻 Qeqs</h1>
          <div className={styles.navLinks}>
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/bars"
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              Bars
            </NavLink>
            <NavLink
              to="/voting"
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              Voting
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              Calendar
            </NavLink>
          </div>
          <div className={styles.userSection}>
            <span className={styles.username}>{user?.username}</span>
            <button onClick={logout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;

