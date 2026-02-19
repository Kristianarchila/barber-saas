import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const Home = lazy(() => import("../pages/public/Home"));

/**
 * PublicRouter - Componente para la página principal pública
 * 
 * Nota: Las rutas ahora se manejan en SlugRouter.
 * Este componente solo renderiza la página Home.
 */
export default function PublicRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Cargando..." />}>
      <Home />
    </Suspense>
  );
}
