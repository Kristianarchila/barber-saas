import { useEffect, useState } from "react";
import { getEmailConfig, updateEmailConfig, testEmailConfig } from "../../services/emailService";
import { Mail, Save, TestTube, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Loader2, HelpCircle } from "lucide-react";

export default function EmailConfig() {
  const [form, setForm] = useState({
    emailNotificaciones: "",
    nombreParaEmails: "",
    emailPassword: "",
    emailProvider: "gmail",
    smtpConfig: {
      host: "",
      port: 587,
      secure: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await getEmailConfig();
      setForm(prev => ({
        ...prev,
        emailNotificaciones: res.config.emailNotificaciones || "",
        nombreParaEmails: res.config.nombreParaEmails || ""
      }));
      setIsConfigured(res.config.isConfigured || false);
    } catch (error) {
      console.error("Error cargando config email:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("smtp.")) {
      const field = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        smtpConfig: {
          ...prev.smtpConfig,
          [field]: type === "checkbox" ? checked : (field === "port" ? parseInt(value) || 587 : value)
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const testData = {
        emailNotificaciones: form.emailNotificaciones,
        emailPassword: form.emailPassword,
        emailProvider: form.emailProvider
      };

      if (form.emailProvider === "smtp") {
        testData.smtpConfig = form.smtpConfig;
      }

      const res = await testEmailConfig(testData);
      setTestResult({
        success: true,
        message: res.message
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || "Error al probar configuración",
        hint: error.response?.data?.hint
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const saveData = {
        emailNotificaciones: form.emailNotificaciones,
        nombreParaEmails: form.nombreParaEmails,
        emailProvider: form.emailProvider
      };

      // Solo enviar contraseña si se modificó
      if (form.emailPassword) {
        saveData.emailPassword = form.emailPassword;
      }

      if (form.emailProvider === "smtp") {
        saveData.smtpConfig = form.smtpConfig;
      }

      await updateEmailConfig(saveData);
      setTestResult({
        success: true,
        message: "✅ Configuración guardada correctamente"
      });
      setIsConfigured(true);

      // Limpiar contraseña del formulario por seguridad
      setForm(prev => ({ ...prev, emailPassword: "" }));

    } catch (error) {
      setTestResult({
        success: false,
        message: "Error guardando configuración"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="heading-1">Configuración de Email</h1>
        <p className="body-large text-gray-600 mt-2">
          Configura tu servidor de email para enviar notificaciones a tus clientes
        </p>
      </div>

      {/* STATUS BADGE */}
      <div className={`p-4 rounded-lg border ${isConfigured
        ? 'bg-green-50 border-green-200'
        : 'bg-yellow-50 border-yellow-200'
        }`}>
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <CheckCircle className="text-green-600" size={20} />
          ) : (
            <AlertCircle className="text-yellow-600" size={20} />
          )}
          <div>
            <p className="label text-gray-900">
              {isConfigured ? 'Configurado' : 'Sin configurar'}
            </p>
            <p className="body-small text-gray-600">
              {isConfigured
                ? `Tus clientes reciben emails desde: ${form.emailNotificaciones}`
                : 'Tus clientes reciben emails desde: barberingsaas@gmail.com'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFORMACIÓN BÁSICA */}
        <div className="card card-padding">
          <h2 className="heading-3 mb-6">Información Básica</h2>

          <div className="space-y-4">
            {/* Email de notificaciones */}
            <div>
              <label className="label mb-2 block">
                Email de notificaciones *
              </label>
              <input
                type="email"
                name="emailNotificaciones"
                value={form.emailNotificaciones}
                onChange={handleChange}
                required
                placeholder="contacto@mibarberia.com"
                className="input"
              />
              <p className="body-small text-gray-500 mt-1">
                Los clientes verán este email como remitente
              </p>
            </div>

            {/* Nombre para emails */}
            <div>
              <label className="label mb-2 block">
                Nombre para emails
              </label>
              <input
                type="text"
                name="nombreParaEmails"
                value={form.nombreParaEmails}
                onChange={handleChange}
                placeholder="Barbería El Corte"
                className="input"
              />
              <p className="body-small text-gray-500 mt-1">
                Aparecerá como: "Barbería El Corte &lt;contacto@mibarberia.com&gt;"
              </p>
            </div>

            {/* Proveedor */}
            <div>
              <label className="label mb-2 block">
                Proveedor de email
              </label>
              <div className="flex gap-4">
                {['gmail', 'outlook', 'smtp'].map((provider) => (
                  <label key={provider} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="emailProvider"
                      value={provider}
                      checked={form.emailProvider === provider}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="label capitalize">{provider === 'smtp' ? 'SMTP Personalizado' : provider}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="label mb-2 block">
                Contraseña de aplicación *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="emailPassword"
                  value={form.emailPassword}
                  onChange={handleChange}
                  placeholder={isConfigured ? "Dejar vacío para no cambiar" : "••••••••••••"}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <HelpCircle size={16} className="text-gray-400 mt-0.5" />
                <div className="body-small text-gray-500">
                  <p>Usa una "App Password", no tu contraseña normal.</p>
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-blue-600 hover:underline mt-1"
                  >
                    ¿Cómo crear una App Password?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GUÍA DE APP PASSWORD */}
        {showGuide && (
          <div className="card card-padding bg-blue-50 border-blue-200">
            <h3 className="heading-4 mb-4">📖 Guía: Crear App Password en Gmail</h3>
            <ol className="list-decimal list-inside space-y-2 body-small text-gray-700">
              <li>Ve a tu cuenta de Google → Seguridad</li>
              <li>Activa la verificación en 2 pasos (si no está activa)</li>
              <li>Busca "Contraseñas de aplicaciones"</li>
              <li>Selecciona "Correo" y "Otro dispositivo"</li>
              <li>Copia la contraseña de 16 caracteres</li>
              <li>Pégala en el campo de arriba</li>
            </ol>
            <a
              href="https://support.google.com/accounts/answer/185833"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline body-small mt-3 inline-block"
            >
              Ver guía completa de Google →
            </a>
          </div>
        )}

        {/* CONFIGURACIÓN SMTP AVANZADA */}
        {form.emailProvider === "smtp" && (
          <div className="card card-padding">
            <h2 className="heading-3 mb-6">Configuración SMTP</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-2 block">
                  Host *
                </label>
                <input
                  type="text"
                  name="smtp.host"
                  value={form.smtpConfig.host}
                  onChange={handleChange}
                  placeholder="smtp.miservidor.com"
                  required={form.emailProvider === "smtp"}
                  className="input"
                />
              </div>

              <div>
                <label className="label mb-2 block">
                  Puerto
                </label>
                <input
                  type="number"
                  name="smtp.port"
                  value={form.smtpConfig.port}
                  onChange={handleChange}
                  placeholder="587"
                  className="input"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="smtp.secure"
                  checked={form.smtpConfig.secure}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="label">Usar SSL/TLS (puerto 465)</span>
              </label>
            </div>
          </div>
        )}

        {/* RESULTADO DEL TEST */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${testResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
            }`}>
            <p className={`label ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {testResult.message}
            </p>
            {testResult.hint && (
              <p className="body-small text-gray-600 mt-1">
                💡 {testResult.hint}
              </p>
            )}
          </div>
        )}

        {/* BOTONES */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !form.emailNotificaciones || !form.emailPassword}
            className="btn btn-secondary"
          >
            {testing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Probando...
              </>
            ) : (
              <>
                <TestTube size={18} />
                Probar Configuración
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={saving || !form.emailNotificaciones}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Configuración
              </>
            )}
          </button>
        </div>

        {/* INFO DE SEGURIDAD */}
        <div className="card card-padding bg-gray-50">
          <div className="flex items-start gap-2 body-small text-gray-600">
            <CheckCircle size={16} className="text-green-600 mt-0.5" />
            <p>
              Tu contraseña se guarda encriptada en nuestra base de datos.
              Nunca compartimos tus credenciales con terceros.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
