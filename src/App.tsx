import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { HomePage } from "./pages/Home";
import { useAuth } from "./hooks/useAuth";

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthChecking } = useAuth();  // ← AGREGAR isAuthChecking
  
  if (isAuthChecking) return <p>Cargando...</p>;  // ← AGREGAR
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Ruta protegida (ejemplo) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage /> 
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
