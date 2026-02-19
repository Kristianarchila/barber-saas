import { Suspense } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { logout } from "../pages/auth/logout";
import BarberoSidebar from "./barbero/BarberoSidebar";
import BarberoBottomNav from "./barbero/BarberoBottomNav";
import { Toaster } from "react-hot-toast";

export default function BarberoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();

  const handleLogout = () => {
    logout(navigate, slug);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <BarberoSidebar
          slug={slug}
          location={location}
          onLogout={handleLogout}
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 lg:ml-64 min-h-screen p-4 md:p-8 pb-20 lg:pb-8">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<LoadingSpinner label="Cargando..." />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* BOTTOM NAVIGATION - Only visible on mobile */}
      <BarberoBottomNav slug={slug} />
    </div>
  );
}



