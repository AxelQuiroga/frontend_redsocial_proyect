import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { FeedPage } from "./pages/Feed";
import { ProfilePage } from "./pages/Profile";
import { BaseLayout } from "./layouts/BaseLayout";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthChecking } = useAuth();
  if (isAuthChecking) return <p>Cargando...</p>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* privadas con layout */}
        <Route
          element={
            <ProtectedRoute>
              <BaseLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
