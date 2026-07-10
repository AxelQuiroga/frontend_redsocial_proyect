import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "@/hooks/useAuth";

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
      <h2 style={{ marginBottom: "var(--space-lg)" }}>Iniciar Sesión</h2>
      {error && <p style={{ color: "var(--color-danger)", marginBottom: "var(--space-md)" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "var(--space-lg)", color: "var(--color-text-secondary)" }}>
        ¿No tienes cuenta?{" "}
        <a href="/register" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
          Registrarte
        </a>
      </p>
    </div>
  );
}