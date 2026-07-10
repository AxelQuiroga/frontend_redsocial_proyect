import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";

export function BaseLayout() {
  return (
    <div>
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
