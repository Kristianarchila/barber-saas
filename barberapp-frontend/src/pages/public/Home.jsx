import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getServiciosPublicos, getBarberosPublicos } from "../../services/publicService";

export default function Home() {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, b] = await Promise.all([
          getServiciosPublicos(),
          getBarberosPublicos()
        ]);
        setServicios(s.slice(0, 3)); // Solo mostrar 3 servicios destacados
        setBarberos(b);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image con overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('/barber.png')",
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-serif font-light text-white tracking-[0.3em] uppercase mb-4">
              Kristian
            </h1>
            <p className="text-[#D4AF37] text-2xl md:text-3xl font-bold tracking-[0.4em] uppercase">
              Studio
            </p>
          </div>
          
          <p className="text-gray-300 text-sm md:text-base tracking-[0.2em] uppercase mb-12 max-w-2xl mx-auto">
            Donde el estilo se encuentra con la tradición
          </p>
          
          <button
            onClick={() => navigate("/book")}
            className="group relative bg-[#D4AF37] text-black px-12 py-5 text-sm font-bold tracking-[0.3em] uppercase hover:bg-white transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Reservar Ahora</span>
            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS DESTACADOS */}
      <section className="py-24 px-6 bg-[#F9F9F9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-4">Servicios</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wider">
              Experiencia Premium
            </h2>
            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {servicios.map((servicio) => (
              <div 
                key={servicio._id}
                className="group bg-white p-8 hover:bg-black transition-all duration-500 cursor-pointer border border-gray-200 hover:border-black"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D4AF37]/10 group-hover:bg-[#D4AF37] flex items-center justify-center transition-colors duration-300">
                    <span className="text-2xl">✂️</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-3 group-hover:text-white transition-colors">
                    {servicio.nombre}
                  </h3>
                  <p className="text-gray-400 text-xs tracking-wider mb-4 group-hover:text-gray-300">
                    {servicio.duracion} MINUTOS
                  </p>
                  <div className="text-3xl font-serif text-[#D4AF37] mb-6">
                    ${servicio.precio}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400">
                    {servicio.descripcion || "Servicio profesional con productos premium"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/book")}
              className="border-2 border-black text-black px-10 py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-300"
            >
              Ver Todos los Servicios
            </button>
          </div>
        </div>
      </section>

      {/* NUESTRO EQUIPO */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-4">El Equipo</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wider">
              Maestros del Estilo
            </h2>
            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {barberos.map((barbero) => (
              <div 
                key={barbero._id}
                className="group text-center"
              >
                <div className="relative mb-6 overflow-hidden">
                  {/* 🆕 Mostrar foto real o inicial */}
                  {barbero.foto ? (
                    <div className="w-48 h-48 mx-auto rounded-full border-4 border-[#D4AF37] group-hover:border-white transition-all duration-300 overflow-hidden">
                      <img 
                        src={barbero.foto} 
                        alt={barbero.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto rounded-full border-4 border-[#D4AF37] bg-gray-800 flex items-center justify-center group-hover:border-white transition-all duration-300">
                      <span className="text-6xl font-serif text-[#D4AF37] group-hover:text-white transition-colors">
                        {barbero.nombre.substring(0, 1)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">
                  {barbero.nombre}
                </h3>
                <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">
                  Master Barber
                </p>
                
                {/* 🆕 Mostrar descripción real o por defecto */}
                <p className="text-gray-400 text-sm max-w-xs mx-auto mb-4">
                  {barbero.descripcion || "Especialista en cortes clásicos y modernos"}
                </p>

                {/* 🆕 Mostrar especialidades si existen */}
                {barbero.especialidades && barbero.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {barbero.especialidades.map((esp, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                )}

                {/* 🆕 Mostrar experiencia si existe */}
                {barbero.experiencia && (
                  <p className="text-gray-500 text-xs">
                    ⭐ {barbero.experiencia} años de experiencia
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="py-24 px-6 bg-[#F9F9F9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-4">Ventajas</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wider">
              La Diferencia Kristian
            </h2>
            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-3">
                Calidad Premium
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Productos de primera calidad y técnicas profesionales
              </p>
            </div>
            
            <div className="p-6">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-3">
                Reserva Online
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Sistema de reservas 24/7 fácil y rápido
              </p>
            </div>
            
            <div className="p-6">
              <div className="text-5xl mb-4">👔</div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-3">
                Ambiente Exclusivo
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Experiencia única en un espacio diseñado para ti
              </p>
            </div>
            
            <div className="p-6">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-3">
                Expertos Certificados
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Barberos con años de experiencia y formación continua
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-4">Portfolio</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wider text-white">
              Nuestro Trabajo
            </h2>
            <div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i}
                className="aspect-square bg-gray-900 hover:opacity-75 transition-opacity cursor-pointer overflow-hidden group"
              >
                <div 
                  className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-${
                      [
                        '1603509442072-3c5a0f7f5d3a',
                        '1599351431202-1e0f0137899a',
                        '1503951914875-452162b0f3f1',
                        '1622296089863-eb5eb9a557f4',
                        '1605497788044-5a32c7078486',
                        '1617127365376-ec71e5ca8887',
                        '1621274403997-37aac5a8a503',
                        '1633681122291-149b57b0ff6e'
                      ][i - 1]
                    }?w=400')`
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6 bg-[#D4AF37] text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-light tracking-wider mb-6">
            ¿Listo para tu transformación?
          </h2>
          <p className="text-lg tracking-[0.2em] uppercase mb-12 opacity-80">
            Reserva tu cita ahora y experimenta el lujo
          </p>
          <button
            onClick={() => navigate("/book")}
            className="bg-black text-white px-16 py-5 text-sm font-bold tracking-[0.3em] uppercase hover:bg-gray-900 transition-all duration-300"
          >
            Reservar Cita
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-serif mb-4 text-[#D4AF37]">Kristian Studio</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Más que una barbería, una experiencia de estilo de vida para el hombre moderno.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>📍 Av. Principal 123, Centro</p>
                <p>📞 +56 9 1234 5678</p>
                <p>✉️ info@kristianstudio.com</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Horarios</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>Lunes - Viernes: 9:00 - 20:00</p>
                <p>Sábado: 9:00 - 18:00</p>
                <p>Domingo: Cerrado</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              © 2025 Kristian Studio. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}