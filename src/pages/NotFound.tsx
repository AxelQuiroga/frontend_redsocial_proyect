import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: "4rem", margin: "0 0 0.5rem", color: "var(--color-primary)" }}>
        404
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Esta página no existe.
      </p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
        Volver al inicio
      </Link>
    </div>
  );
}
