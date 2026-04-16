import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();  // ← Usamos el hook
   const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);  // ← Llama al hook
      navigate("/");  
    } catch {
      // Error ya está manejado en el hook (se muestra abajo)
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
      <p className="auth-link">
        ¿No tienes cuenta? <a href="/register">Registrarte</a>
      </p>
    </div>
  );
}