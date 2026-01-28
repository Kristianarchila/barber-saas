import { Outlet, useParams } from "react-router-dom";
import { useBarberia } from "../hooks/useBarberia";
import Navbar from "./Navbar"; // Reutilizamos o creamos uno minimalista

export default function PublicLayout() {
  const { slug } = useParams();
  const { barberia, loading } = useBarberia(slug);

  if (loading) return null; // O un skeleton muy básico

  return (
    <div className="relative min-h-screen bg-neutral-950">
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex justify-between items-center glass-dark border-b border-white/5">
        <span className="text-white font-serif italic text-xl tracking-tighter">
          {barberia?.nombre}
        </span>
        <div className="h-8 w-8 rounded-full border border-gold-glow flex items-center justify-center text-[10px] text-[#D4AF37]">
          HB
        </div>
      </nav>

      {/* Aquí se renderiza la Home o el Book */}
      <main className="pt-[72px]"> 
        <Outlet />
      </main>

      {/* Footer simple para SEO y confianza */}
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <p className="text-neutral-600 text-[10px] uppercase tracking-[0.3em]">
          © 2026 {barberia?.nombre} — Premium Experience
        </p>
      </footer>
    </div>
  );
}