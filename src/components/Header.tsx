import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function Header() {
  const { user, isAuthenticated, isAuthChecking, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isAuthChecking) {
    return (
      <header className="header">
        <div className="user-info">
          <div className="user-details">
            <h1>Red Social</h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      {isAuthenticated && user ? (
        <>
          <div className="user-info">
            <div className="avatar avatar-lg">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h1>{user.username}</h1>
              <p>{user.email}</p>
            </div>
          </div>

          <nav className="app-nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Feed
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              Perfil
            </NavLink>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <NotificationsDropdown />
            <button onClick={handleLogout} className="btn btn-danger">
              Cerrar sesión
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="user-info">
            <div className="user-details">
              <h1>Red Social</h1>
            </div>
          </div>

          <nav className="app-nav">
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Iniciar sesión
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
              Registrarse
            </NavLink>
          </nav>
        </>
      )}
    </header>
  );
}
