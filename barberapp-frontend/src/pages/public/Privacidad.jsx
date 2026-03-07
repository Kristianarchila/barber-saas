import PublicLayout from '../../layouts/PublicLayout';
import { Lock } from 'lucide-react';

const Section = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <div className="text-zinc-400 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
);

export default function Privacidad() {
    const date = '1 de marzo de 2026';
    const company = 'BarberSaaS';
    const email = 'soporte@barbersaas.duckdns.org';

    return (
        <PublicLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                        <Lock size={20} className="text-purple-400" />
                    </div>
                    <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Legal</p>
                </div>
                <h1 className="text-4xl font-black text-white mb-2">Política de Privacidad</h1>
                <p className="text-zinc-500 text-sm mb-12">Última actualización: {date}</p>

                <div className="prose prose-invert max-w-none">
                    <Section title="1. Responsable del tratamiento">
                        <p><strong className="text-white">{company}</strong> es el responsable del tratamiento de los datos personales recogidos a través de la plataforma. Para cualquier consulta relacionada con la privacidad: <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300">{email}</a></p>
                    </Section>

                    <Section title="2. Datos que recopilamos">
                        <p>Recopilamos los siguientes tipos de información:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-zinc-300">Datos de cuenta:</strong> nombre, email, contraseña (encriptada)</li>
                            <li><strong className="text-zinc-300">Datos de la barbería:</strong> nombre, dirección, logotipo, horarios</li>
                            <li><strong className="text-zinc-300">Datos de clientes finales:</strong> nombre, teléfono, email (solo los ingresados por la barbería)</li>
                            <li><strong className="text-zinc-300">Datos de uso:</strong> páginas visitadas, funciones utilizadas, tiempos de sesión</li>
                            <li><strong className="text-zinc-300">Datos técnicos:</strong> dirección IP, tipo de navegador, dispositivo</li>
                        </ul>
                    </Section>

                    <Section title="3. Finalidad del tratamiento">
                        <p>Utilizamos sus datos para:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Prestar y mejorar los servicios de la plataforma</li>
                            <li>Gestionar su cuenta y facturación</li>
                            <li>Enviar notificaciones relacionadas con el servicio</li>
                            <li>Atender solicitudes de soporte técnico</li>
                            <li>Cumplir obligaciones legales y prevenir fraude</li>
                        </ul>
                    </Section>

                    <Section title="4. Base legal del tratamiento">
                        <p>El tratamiento de sus datos se basa en:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-zinc-300">Ejecución contractual:</strong> para prestar los servicios contratados</li>
                            <li><strong className="text-zinc-300">Interés legítimo:</strong> para mejorar la plataforma y prevenir fraude</li>
                            <li><strong className="text-zinc-300">Consentimiento:</strong> para comunicaciones de marketing (puede revocarse)</li>
                            <li><strong className="text-zinc-300">Cumplimiento legal:</strong> cuando sea requerido por ley</li>
                        </ul>
                    </Section>

                    <Section title="5. Compartición de datos">
                        <p>No vendemos ni alquilamos sus datos personales. Podemos compartirlos con:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-zinc-300">Proveedores de servicios:</strong> hosting, email, análisis (bajo acuerdos de confidencialidad)</li>
                            <li><strong className="text-zinc-300">Procesadores de pago:</strong> solo los datos necesarios para completar transacciones</li>
                            <li><strong className="text-zinc-300">Autoridades legales:</strong> cuando sea requerido por ley o proceso judicial</li>
                        </ul>
                    </Section>

                    <Section title="6. Seguridad de los datos">
                        <p>Implementamos medidas técnicas y organizativas para proteger sus datos:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Cifrado en tránsito (HTTPS/TLS) y en reposo</li>
                            <li>Arquitectura multi-tenant con aislamiento de datos por barbería</li>
                            <li>Contraseñas encriptadas con bcrypt</li>
                            <li>Tokens JWT con expiración automática</li>
                            <li>Acceso restringido por roles (SuperAdmin, Admin, Barbero)</li>
                        </ul>
                    </Section>

                    <Section title="7. Conservación de datos">
                        <p>Conservamos sus datos mientras mantenga una cuenta activa. Al cancelar la cuenta, sus datos serán eliminados en un plazo máximo de 90 días, salvo obligación legal de conservación.</p>
                    </Section>

                    <Section title="8. Sus derechos">
                        <p>Tiene derecho a:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-zinc-300">Acceso:</strong> solicitar una copia de sus datos personales</li>
                            <li><strong className="text-zinc-300">Rectificación:</strong> corregir datos inexactos</li>
                            <li><strong className="text-zinc-300">Eliminación:</strong> solicitar el borrado de sus datos</li>
                            <li><strong className="text-zinc-300">Portabilidad:</strong> recibir sus datos en formato estructurado</li>
                            <li><strong className="text-zinc-300">Oposición:</strong> oponerse al tratamiento basado en interés legítimo</li>
                        </ul>
                        <p>Para ejercer estos derechos, contáctenos en: <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300">{email}</a></p>
                    </Section>

                    <Section title="9. Cookies">
                        <p>Utilizamos cookies esenciales para el funcionamiento de la plataforma (sesión, autenticación) y cookies analíticas para mejorar la experiencia. Puede gestionar las cookies desde la configuración de su navegador.</p>
                    </Section>

                    <Section title="10. Cambios en esta política">
                        <p>Notificaremos cualquier cambio significativo en esta política por email con al menos 15 días de anticipación. La fecha de última actualización siempre será visible al inicio de este documento.</p>
                    </Section>

                    <Section title="11. Contacto">
                        <p>Para consultas sobre privacidad o ejercicio de derechos: <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300">{email}</a></p>
                    </Section>
                </div>
            </div>
        </PublicLayout>
    );
}
