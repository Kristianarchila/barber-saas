// Tab: Avanzado (SEO, Redes, Analytics, Políticas, Email Config)
import { motion } from 'framer-motion';

export default function AdvancedTab({ config, setConfig }) {
    const updPoliticas = (patch) => setConfig(p => ({ ...p, politicasCancelacion: { ...p.politicasCancelacion, ...patch } }));
    const updEmail     = (patch) => setConfig(p => ({ ...p, emailConfig: { ...p.emailConfig, ...patch } }));

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO */}
            <div className="card card-padding">
                <h2 className="heading-3 mb-6">SEO y Metadatos</h2>
                <div className="space-y-4">
                    <div>
                        <label className="label mb-2 block">Título SEO</label>
                        <input type="text" value={config.seoTitle} onChange={e => setConfig(p => ({ ...p, seoTitle: e.target.value }))} className="input" />
                    </div>
                    <div>
                        <label className="label mb-2 block">Meta Descripción</label>
                        <textarea value={config.seoDescription} onChange={e => setConfig(p => ({ ...p, seoDescription: e.target.value }))} rows={3} className="input textarea" />
                    </div>
                    <div>
                        <label className="label mb-2 block">URL Favicon</label>
                        <input type="text" value={config.faviconUrl} onChange={e => setConfig(p => ({ ...p, faviconUrl: e.target.value }))} className="input font-mono text-sm" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Redes Sociales */}
                <div className="card card-padding">
                    <h2 className="heading-3 mb-6">Redes Sociales</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label mb-2 block">Instagram</label>
                            <input type="text" value={config.instagram} onChange={e => setConfig(p => ({ ...p, instagram: e.target.value }))} className="input text-sm" />
                        </div>
                        <div>
                            <label className="label mb-2 block">Facebook</label>
                            <input type="text" value={config.facebook} onChange={e => setConfig(p => ({ ...p, facebook: e.target.value }))} className="input text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="label mb-2 block">Google Maps</label>
                        <textarea value={config.googleMapsUrl} onChange={e => setConfig(p => ({ ...p, googleMapsUrl: e.target.value }))} rows={2} className="input textarea text-sm" />
                    </div>
                </div>

                {/* Analytics */}
                <div className="card card-padding">
                    <h2 className="heading-3 mb-6">Analítica</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label mb-2 block">Google Analytics</label>
                            <input type="text" value={config.analyticsId} onChange={e => setConfig(p => ({ ...p, analyticsId: e.target.value }))} placeholder="G-XXXXXXXXXX" className="input font-mono text-sm" />
                        </div>
                        <div>
                            <label className="label mb-2 block">Facebook Pixel</label>
                            <input type="text" value={config.pixelId} onChange={e => setConfig(p => ({ ...p, pixelId: e.target.value }))} placeholder="123456789..." className="input font-mono text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Políticas de Cancelación */}
            <div className="card card-padding">
                <h2 className="heading-3 mb-6">Políticas de Cancelación</h2>
                <div className="space-y-4">
                    {[
                        { label: 'Horas Mínimas para Cancelar', key: 'horasMinimas', min: 1, max: 168, help: 'Tiempo mínimo antes de la cita' },
                        { label: 'Límite Mensual de Cancelaciones', key: 'limiteMensual', min: 1, max: 20, help: 'Máximo de cancelaciones por mes' },
                        { label: 'Días de Bloqueo', key: 'diasBloqueo', min: 1, max: 365, help: 'Días de bloqueo al exceder límite' },
                    ].map(({ label, key, min, max, help }) => (
                        <div key={key}>
                            <label className="label mb-2 block">{label}</label>
                            <input type="number" value={config.politicasCancelacion?.[key]} onChange={e => updPoliticas({ [key]: parseInt(e.target.value) })} min={min} max={max} className="input" />
                            <p className="body-small text-gray-500 mt-1">{help}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Email Config (notificaciones) */}
            <div className="card card-padding">
                <h2 className="heading-3 mb-6">Notificaciones por Email</h2>
                <div className="space-y-4">
                    {[
                        { label: 'Emails de Confirmación', desc: 'Enviar al crear reserva', key: 'enviarConfirmacion' },
                        { label: 'Recordatorios Automáticos', desc: 'Enviar antes de la cita', key: 'enviarRecordatorio' },
                        { label: 'Solicitar Reseñas', desc: 'Pedir reseña post-servicio', key: 'solicitarResena' },
                    ].map(({ label, desc, key }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                            <div>
                                <label className="label">{label}</label>
                                <p className="body-small text-gray-500 mt-1">{desc}</p>
                            </div>
                            <input type="checkbox" checked={config.emailConfig?.[key] !== false}
                                onChange={e => updEmail({ [key]: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </div>
                    ))}
                    {config.emailConfig?.enviarRecordatorio !== false && (
                        <div>
                            <label className="label mb-2 block">Horas Antes del Recordatorio</label>
                            <input type="number" value={config.emailConfig?.horasAntesRecordatorio || 24} onChange={e => updEmail({ horasAntesRecordatorio: parseInt(e.target.value) })} min={1} max={168} className="input" />
                            <p className="body-small text-gray-500 mt-1">Default: 24 horas</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
