import PublicLayout from '../../layouts/PublicLayout';
import { FileText } from 'lucide-react';

const Section = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <div className="text-zinc-400 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
);

export default function Terminos() {
    const date = '1 de marzo de 2026';
    const company = 'BarberSaaS';
    const email = 'soporte@barbersaas.duckdns.org';
    const domain = 'barbersaas.duckdns.org';

    return (
        <PublicLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-purple-400" />
                    </div>
                    <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Legal</p>
                </div>
                <h1 className="text-4xl font-black text-white mb-2">Términos y Condiciones</h1>
                <p className="text-zinc-500 text-sm mb-12">Última actualización: {date}</p>

                <div className="prose prose-invert max-w-none">
                    <Section title="1. Aceptación de los términos">
                        <p>Al acceder o utilizar los servicios de <strong className="text-white">{company}</strong> disponibles en <strong className="text-white">{domain}</strong>, usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte, no podrá utilizar nuestro servicio.</p>
                    </Section>

                    <Section title="2. Descripción del servicio">
                        <p>{company} es una plataforma SaaS (Software as a Service) de gestión para barberías que incluye:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Sistema de reservas online para clientes finales</li>
                            <li>Panel de administración para dueños de barberías</li>
                            <li>Gestión de barberos, servicios y horarios</li>
                            <li>Reportes financieros y métricas de negocio</li>
                            <li>Notificaciones automáticas por email y push</li>
                        </ul>
                    </Section>

                    <Section title="3. Cuentas de usuario">
                        <p>Al crear una cuenta usted declara que:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Tiene al menos 18 años de edad</li>
                            <li>La información proporcionada es verídica y actualizada</li>
                            <li>Es responsable de mantener la confidencialidad de sus credenciales</li>
                            <li>Notificará inmediatamente cualquier uso no autorizado de su cuenta</li>
                        </ul>
                    </Section>

                    <Section title="4. Planes y facturación">
                        <p>Los servicios de {company} están disponibles en diferentes planes de suscripción mensual. Los precios se especifican en la <a href="/precios" className="text-purple-400 hover:text-purple-300">página de precios</a>.</p>
                        <p>El pago se realiza por adelantado al inicio de cada período de facturación. Los precios pueden cambiar con un aviso previo de 30 días por correo electrónico.</p>
                    </Section>

                    <Section title="5. Política de reembolso" id="reembolso">
                        <p>Ofrecemos un período de prueba gratuito de 14 días sin necesidad de método de pago. Después del período de prueba:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>No se realizan reembolsos por períodos ya facturados</li>
                            <li>Puede cancelar en cualquier momento; mantendrá acceso hasta el fin del período pagado</li>
                            <li>En casos excepcionales de falla del servicio, evaluaremos reembolsos proporcionales</li>
                        </ul>
                        <p>Para solicitar un reembolso, contacte a <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300">{email}</a>.</p>
                    </Section>

                    <Section title="6. Uso aceptable">
                        <p>Usted se compromete a NO utilizar {company} para:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Actividades ilegales o fraudulentas</li>
                            <li>Enviar spam o comunicaciones no solicitadas</li>
                            <li>Intentar vulnerar la seguridad de la plataforma</li>
                            <li>Revender o sublicenciar el acceso al servicio sin autorización</li>
                        </ul>
                    </Section>

                    <Section title="7. Propiedad intelectual">
                        <p>{company} y su contenido, características y funcionalidades son propiedad exclusiva de sus desarrolladores y están protegidos por leyes de propiedad intelectual. Los datos ingresados por el usuario (clientes, reservas, información de la barbería) son propiedad del usuario.</p>
                    </Section>

                    <Section title="8. Disponibilidad del servicio">
                        <p>Nos esforzamos por mantener una disponibilidad del 99.5% mensual. Sin embargo, el servicio puede interrumpirse por mantenimiento programado (notificado con antelación) o por causas de fuerza mayor.</p>
                    </Section>

                    <Section title="9. Limitación de responsabilidad">
                        <p>{company} no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso del servicio, incluyendo pérdida de ingresos o datos.</p>
                    </Section>

                    <Section title="10. Modificaciones">
                        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Notificaremos los cambios significativos por email con al menos 15 días de anticipación. El uso continuado del servicio tras los cambios implica la aceptación de los nuevos términos.</p>
                    </Section>

                    <Section title="11. Contacto">
                        <p>Para cualquier consulta sobre estos términos: <a href={`mailto:${email}`} className="text-purple-400 hover:text-purple-300">{email}</a></p>
                    </Section>
                </div>
            </div>
        </PublicLayout>
    );
}
