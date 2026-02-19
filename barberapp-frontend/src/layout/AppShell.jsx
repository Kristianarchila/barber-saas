import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-white/10">
        <Sidebar />
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
