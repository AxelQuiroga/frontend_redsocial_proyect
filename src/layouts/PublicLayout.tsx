import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <main className="container">
      <Outlet />
    </main>
  );
}