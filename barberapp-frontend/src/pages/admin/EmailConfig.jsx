import { useEffect, useState } from "react";
import { getEmailConfig, updateEmailConfig, testEmailConfig } from "../../services/emailService";

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
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">📧 Configuración de Email</h1>
        <p className="text-gray-400">
          Configura tu servidor de email para enviar notificaciones a tus clientes
        </p>
      </div>

      {/* Estado actual */}
      <div className={`mb-6 p-4 rounded-lg border ${isConfigured
          ? 'bg-green-900/20 border-green-700'
          : 'bg-yellow-900/20 border-yellow-700'
        }`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{isConfigured ? '✅' : '⚠️'}</span>
          <div>
            <p className="font-semibold text-white">
              {isConfigured ? 'Configurado' : 'Sin configurar'}
            </p>
            <p className="text-sm text-gray-400">
              {isConfigured
                ? 'Tus clientes reciben emails desde tu dominio'
                : 'Tus clientes reciben emails desde: barberingsaas@gmail.com'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Información Básica</h2>

          {/* Email de notificaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email de notificaciones *
            </label>
            <input
              type="email"
              name="emailNotificaciones"
              value={form.emailNotificaciones}
              onChange={handleChange}
              required
              placeholder="contacto@mibarberia.com"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Los clientes verán este email como remitente
            </p>
          </div>

          {/* Nombre para emails */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre para emails
            </label>
            <input
              type="text"
              name="nombreParaEmails"
              value={form.nombreParaEmails}
              onChange={handleChange}
              placeholder="Barbería El Corte"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Aparecerá como: "Barbería El Corte &lt;contacto@mibarberia.com&gt;"
            </p>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Proveedor de email
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="emailProvider"
                  value="gmail"
                  checked={form.emailProvider === "gmail"}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span className="text-white">Gmail</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="emailProvider"
                  value="outlook"
                  checked={form.emailProvider === "outlook"}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span className="text-white">Outlook</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="emailProvider"
                  value="smtp"
                  checked={form.emailProvider === "smtp"}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span className="text-white">SMTP Personalizado</span>
              </label>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña de aplicación *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="emailPassword"
                value={form.emailPassword}
                onChange={handleChange}
                placeholder={isConfigured ? "Dejar vacío para no cambiar" : "••••••••••••"}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-400">
              <span>ℹ️</span>
              <div>
                <p>Usa una "App Password", no tu contraseña normal.</p>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-blue-400 hover:underline mt-1"
                >
                  ¿Cómo crear una App Password?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guía de App Password */}
        {showGuide && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📖 Guía: Crear App Password en Gmail</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
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
              className="text-blue-400 hover:underline text-sm mt-2 inline-block"
            >
              Ver guía completa de Google →
            </a>
          </div>
        )}

        {/* Configuración SMTP Avanzada */}
        {form.emailProvider === "smtp" && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Configuración SMTP</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host *
                </label>
                <input
                  type="text"
                  name="smtp.host"
                  value={form.smtpConfig.host}
                  onChange={handleChange}
                  placeholder="smtp.miservidor.com"
                  required={form.emailProvider === "smtp"}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Puerto
                </label>
                <input
                  type="number"
                  name="smtp.port"
                  value={form.smtpConfig.port}
                  onChange={handleChange}
                  placeholder="587"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="smtp.secure"
                  checked={form.smtpConfig.secure}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">Usar SSL/TLS (puerto 465)</span>
              </label>
            </div>
          </div>
        )}

        {/* Resultado del test */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${testResult.success
              ? 'bg-green-900/20 border-green-700'
              : 'bg-red-900/20 border-red-700'
            }`}>
            <p className={`font-semibold ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.message}
            </p>
            {testResult.hint && (
              <p className="text-sm text-gray-300 mt-1">
                💡 {testResult.hint}
              </p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !form.emailNotificaciones || !form.emailPassword}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testing ? (
              <>
                <span className="animate-spin">⏳</span>
                Probando...
              </>
            ) : (
              <>
                🧪 Probar Configuración
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={saving || !form.emailNotificaciones}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                💾 Guardar Configuración
              </>
            )}
          </button>
        </div>

        {/* Info de seguridad */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <span>🔒</span>
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
