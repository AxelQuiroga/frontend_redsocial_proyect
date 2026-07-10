import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";

export function PublicLayout() {
  return (
    <div>
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
