import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function BaseLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <header className="header">
        <div className="user-info">
          <div className="avatar avatar-lg">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h1>{user?.username}</h1>
            <p>{user?.email}</p>
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

        <button onClick={handleLogout} className="btn btn-danger">
          Cerrar sesión
        </button>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
