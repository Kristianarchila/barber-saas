import { useEffect, useState } from "react";
import { getFinanzasAdmin, getCajaActual, abrirCaja, cerrarCaja, getEgresos, registrarEgreso, getTransactions } from "../../services/finanzasService";
import { DollarSign, TrendingUp, CheckCircle, XCircle, Calendar, Target, ArrowUp, ArrowDown, Wallet, Receipt, History, Users, FileText, Plus, Landmark, PieChart, Filter, Search, Download } from "lucide-react";
import { Button, Card, Stat } from "../../components/ui";

export default function FinanzasAdmin() {
  const [activeTab, setActiveTab] = useState("resumen");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cajaActual, setCajaActual] = useState(null);
  const [showAbrirCajaModal, setShowAbrirCajaModal] = useState(false);
  const [showCerrarCajaModal, setShowCerrarCajaModal] = useState(false);
  const [montoApertura, setMontoApertura] = useState("");
  const [montoCierreReal, setMontoCierreReal] = useState("");
  const [notaCierre, setNotaCierre] = useState("");
  const [egresos, setEgresos] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [showAddEgresoModal, setShowAddEgresoModal] = useState(false);
  const [nuevoEgreso, setNuevoEgreso] = useState({ concepto: "", monto: "", categoria: "OPERATIVO" });

  // Tabs definitions
  const tabs = [
    { id: "resumen", label: "Resumen", icon: PieChart },
    { id: "caja", label: "Caja & Flujo", icon: Wallet },
    { id: "egresos", label: "Egresos", icon: Receipt },
    { id: "transacciones", label: "Transacciones", icon: History },
    { id: "staff", label: "Staff & Splits", icon: Users },
    { id: "reportes", label: "Reportes", icon: FileText },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [finRes, cajaRes, egRes, transRes] = await Promise.all([
        getFinanzasAdmin(),
        getCajaActual(),
        getEgresos(),
        getTransactions()
      ]);
      setData(finRes);
      setCajaActual(cajaRes);
      setEgresos(egRes.egresos || []);
      setTransacciones(transRes.transactions || []);
    } catch (error) {
      console.error("Error cargando finanzas:", error);
      setData({
        ingresosHoy: 0,
        ingresosMes: 0,
        completadas: 0,
        canceladas: 0
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAbrirCaja = async () => {
    try {
      await abrirCaja({ montoInicial: Number(montoApertura) });
      setShowAbrirCajaModal(false);
      setMontoApertura("");
      fetchData();
    } catch (error) {
      alert("Error al abrir caja: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCerrarCaja = async () => {
    try {
      await cerrarCaja({
        montoCierreReal: Number(montoCierreReal),
        notas: notaCierre
      });
      setShowCerrarCajaModal(false);
      setMontoCierreReal("");
      setNotaCierre("");
      fetchData();
    } catch (error) {
      alert("Error al cerrar caja: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddEgreso = async () => {
    try {
      await registrarEgreso({
        ...nuevoEgreso,
        monto: Number(nuevoEgreso.monto)
      });
      setShowAddEgresoModal(false);
      setNuevoEgreso({ concepto: "", monto: "", categoria: "OPERATIVO" });
      fetchData();
    } catch (error) {
      alert("Error al registrar egreso: " + (error.response?.data?.message || error.message));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="body-large text-gray-600">Sincronizando datos contables...</p>
      </div>
    );
  }

  // Render Helpers
  const renderResumen = () => {
    const tasaCompletadas = data.completadas + data.canceladas > 0
      ? Math.round((data.completadas / (data.completadas + data.canceladas)) * 100)
      : 0;

    const promedioIngresoPorCita = data.completadas > 0
      ? Math.round(data.ingresosMes / data.completadas)
      : 0;

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-padding shadow-sm ring-1 ring-gray-100 border-none">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Landmark size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUp size={12} />
                12.5%
              </div>
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-wider">Ingresos del Mes</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(data.ingresosMes)}</h3>
          </Card>

          <Card className="card-padding shadow-sm ring-1 ring-gray-100 border-none">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <DollarSign size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUp size={12} />
                8.2%
              </div>
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-wider">Recaudación Hoy</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(data.ingresosHoy)}</h3>
          </Card>

          <Card className="card-padding shadow-sm ring-1 ring-gray-100 border-none">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <CheckCircle size={24} />
              </div>
              <div className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                Meta: 80%
              </div>
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-wider">Tasa de Éxito</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{tasaCompletadas}%</h3>
          </Card>

          <Card className="card-padding shadow-sm ring-1 ring-gray-100 border-none">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <TrendingUp size={24} className="rotate-90" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                -3.1%
              </div>
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-wider">Ticket Promedio</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(promedioIngresoPorCita)}</h3>
          </Card>
        </div>

        {/* DETAILED VIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                <Target size={20} />
              </div>
              <div>
                <h4 className="heading-4">Desempeño Operativo</h4>
                <p className="caption text-gray-500">Métricas de conversión y volumen</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="body-small text-gray-600 font-medium">Citas Completadas</span>
                </div>
                <span className="body-small font-black text-gray-900">{data.completadas}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="body-small text-gray-600 font-medium">Citas Canceladas</span>
                </div>
                <span className="body-small font-black text-gray-900">{data.canceladas}</span>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="body-small text-gray-900 font-bold">Salud del Flujo</span>
                  <span className="body-small font-black text-blue-600">{tasaCompletadas}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${tasaCompletadas}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="heading-4">Distribución Mensual</h4>
                <p className="caption text-gray-500">Acumulado vs Proyección</p>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="text-center py-6">
                <p className="caption text-gray-400 font-bold uppercase tracking-widest mb-2">Proyección Fin de Mes</p>
                <h2 className="text-4xl font-black text-gray-900">
                  {formatCurrency(data.ingresosMes * 1.15)}
                </h2>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mt-4">
                  <Plus size={12} /> Al alza respecto a mes anterior
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderCaja = () => {
    const isCajaAbierta = cajaActual && cajaActual.estado === 'ABIERTA';

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isCajaAbierta ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h2 className="heading-3">Estado de Caja: {isCajaAbierta ? 'Abierta' : 'Cerrada'}</h2>
          </div>
          {!isCajaAbierta ? (
            <Button className="btn-primary" onClick={() => setShowAbrirCajaModal(true)}>
              <Plus size={18} className="mr-2" />
              Abrir Caja Hoy
            </Button>
          ) : (
            <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50" onClick={() => setShowCerrarCajaModal(true)}>
              <XCircle size={18} className="mr-2" />
              Cerrar Caja
            </Button>
          )}
        </div>

        {isCajaAbierta ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="card-padding shadow-sm border-none ring-1 ring-gray-100 col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h4 className="heading-4">Balance en Tiempo Real</h4>
                <div className="caption font-bold text-gray-400">ABIERTA DESDE: {new Date(cajaActual.fechaApertura).toLocaleTimeString()}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="caption text-gray-500 uppercase font-black tracking-widest">Base de Apertura</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(cajaActual.montoInicial)}</p>
                </div>
                <div className="space-y-1">
                  <p className="caption text-gray-500 uppercase font-black tracking-widest">Ventas del Día</p>
                  <p className="text-2xl font-bold text-green-600">+{formatCurrency(cajaActual.montoVentas)}</p>
                </div>
                <div className="space-y-1">
                  <p className="caption text-gray-500 uppercase font-black tracking-widest">Otros Ingresos</p>
                  <p className="text-2xl font-bold text-blue-600">+{formatCurrency(cajaActual.montoIngresosExtras)}</p>
                </div>
                <div className="space-y-1">
                  <p className="caption text-gray-500 uppercase font-black tracking-widest">Egresos/Salidas</p>
                  <p className="text-2xl font-bold text-red-600">-{formatCurrency(cajaActual.montoEgresos)}</p>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="caption text-gray-500 uppercase font-black tracking-widest">Saldo Esperado en Caja</p>
                  <p className="text-4xl font-black text-gray-900">{formatCurrency(cajaActual.montoEsperado)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <PieChart size={40} className="text-blue-500" />
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="card-padding shadow-sm border-none ring-1 ring-gray-100">
                <h4 className="body font-bold mb-4">Acciones de Flujo</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start py-6 bg-gray-50/50 border-gray-100">
                    <Plus size={18} className="mr-3 text-blue-500" />
                    Ingreso Adicional
                  </Button>
                  <Button variant="outline" className="w-full justify-start py-6 bg-gray-50/50 border-gray-100" onClick={() => setActiveTab("egresos")}>
                    <ArrowDown size={18} className="mr-3 text-red-500" />
                    Registrar Gasto
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Wallet className="text-gray-300" size={32} />
            </div>
            <h3 className="heading-3 text-gray-900">La caja está cerrada</h3>
            <p className="body-small text-gray-500 mt-2 max-w-sm mx-auto">
              Debes realizar la apertura de caja para comenzar a registrar ventas y movimientos financieros el día de hoy.
            </p>
            <Button className="btn-primary mt-8" onClick={() => setShowAbrirCajaModal(true)}>
              Proceder a la Apertura
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderEgresos = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="heading-3">Registro de Egresos</h2>
            <p className="body-small text-gray-500">Gastos operativos y salidas de capital</p>
          </div>
          <Button className="btn-primary" onClick={() => setShowAddEgresoModal(true)}>
            <Plus size={18} className="mr-2" />
            Registrar Gasto
          </Button>
        </div>

        <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50/50">
                <tr>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th className="text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {egresos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Receipt className="mx-auto text-gray-200 mb-4" size={48} />
                      <p className="body-small text-gray-400">No hay egresos registrados recientemente</p>
                    </td>
                  </tr>
                ) : (
                  egresos.map((eg) => (
                    <tr key={eg._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="font-bold text-gray-900">{eg.concepto}</td>
                      <td>
                        <span className="badge badge-primary">{eg.categoria}</span>
                      </td>
                      <td className="text-gray-500 body-small">{new Date(eg.createdAt).toLocaleDateString()}</td>
                      <td className="font-black text-red-600">-{formatCurrency(eg.monto)}</td>
                      <td className="text-right">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">PROCESADO</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderTransacciones = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="heading-3">Libro Diario Unificado</h2>
            <p className="body-small text-gray-500">Historial completo de movimientos de la barbería</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white">
              <Filter size={18} className="mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" className="bg-white">
              <Download size={18} className="mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50/50">
                <tr>
                  <th>Tipo</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                  <th>Medio</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <History className="mx-auto text-gray-200 mb-4" size={48} />
                      <p className="body-small text-gray-400">No se han encontrado transacciones</p>
                    </td>
                  </tr>
                ) : (
                  transacciones.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                      <td>
                        <div className={`p-2 rounded-lg inline-block ${t.tipo === 'INGRESO' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {t.tipo === 'INGRESO' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </div>
                      </td>
                      <td>
                        <p className="body-small font-bold text-gray-900">{t.descripcion || 'Sin descripción'}</p>
                        <p className="caption text-gray-400 capitalize">{t.categoria}</p>
                      </td>
                      <td className="text-gray-500 body-small">{new Date(t.createdAt).toLocaleString()}</td>
                      <td>
                        <span className="caption font-bold text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                          {t.metodoPago || 'EFECTIVO'}
                        </span>
                      </td>
                      <td className={`font-black ${t.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.tipo === 'INGRESO' ? '+' : '-'}{formatCurrency(t.monto)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderStaff = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <header>
          <h2 className="heading-3">Liquidación de Comisiones</h2>
          <p className="body-small text-gray-500">Gestión de pagos a barberos y splits automáticos</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="card-padding shadow-sm ring-1 ring-gray-100 border-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Users size={24} />
              </div>
              <h4 className="heading-4">Pendiente de Pago</h4>
            </div>
            <p className="caption text-gray-400 font-bold uppercase tracking-widest">Total Acumulado Staff</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{formatCurrency(data.ingresosMes * 0.4)}</h3>
            <Button className="w-full mt-8 btn-primary">Gestionar Pagos</Button>
          </Card>

          <Card className="card-padding shadow-sm ring-1 ring-gray-100 border-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Target size={24} />
              </div>
              <h4 className="heading-4">Configuración de Splits</h4>
            </div>
            <p className="body-small text-gray-600 mb-6">Define porcentajes de comisión por servicio o por barbero.</p>
            <Button variant="outline" className="w-full">Configurar Reglas</Button>
          </Card>
        </div>
      </div>
    );
  };

  const renderReportes = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <header>
          <h2 className="heading-3">Centro de Reportes</h2>
          <p className="body-small text-gray-500">Exportación de datos y análisis de tendencias</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Libro de Ventas", desc: "Listado de todas las ventas del mes", icon: FileText },
            { title: "Balance General", desc: "Reporte consolidado de flujo de caja", icon: Landmark },
            { title: "Rendimiento Staff", desc: "Detalle de productividad por barbero", icon: Users },
          ].map((rep, idx) => (
            <Card key={idx} className="card-padding shadow-sm ring-1 ring-gray-100 border-none hover:shadow-md transition-shadow cursor-pointer">
              <rep.icon className="text-blue-600 mb-4" size={28} />
              <h4 className="body font-bold text-gray-900">{rep.title}</h4>
              <p className="caption text-gray-500 mt-1">{rep.desc}</p>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mt-6">
                <Download size={14} /> GENERAR PDF
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} />
            Control Financiero
          </h1>
          <p className="body-large text-gray-600 mt-2">
            Gestión de ingresos, egresos y conciliación bancaria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="shadow-sm bg-white">
            <Download size={18} className="mr-2" />
            Descargar Reporte
          </Button>
          <Button className="btn-primary shadow-lg shadow-blue-200">
            <Plus size={18} className="mr-2" />
            Nuevo Registro
          </Button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[500px]">
        {activeTab === "resumen" && renderResumen()}
        {activeTab === "caja" && renderCaja()}
        {activeTab === "egresos" && renderEgresos()}
        {activeTab === "transacciones" && renderTransacciones()}
        {activeTab === "staff" && renderStaff()}
        {activeTab === "reportes" && renderReportes()}
      </div>

      {/* MODALS */}
      {showAbrirCajaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="card card-padding w-full max-w-md animate-in zoom-in-95">
            <h3 className="heading-3 mb-6">Apertura de Caja</h3>
            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">Monto Inicial (Base de Efectivo)</label>
                <input
                  type="number"
                  placeholder="Ej: 50000"
                  className="input"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAbrirCajaModal(false)}>Cancelar</Button>
                <Button className="btn-primary flex-1" onClick={handleAbrirCaja}>Abrir Caja</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCerrarCajaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="card card-padding w-full max-w-lg animate-in zoom-in-95">
            <h3 className="heading-3 mb-6">Cierre de Caja</h3>
            <div className="p-4 bg-blue-50 rounded-xl mb-6">
              <div className="flex justify-between items-center">
                <span className="body-small text-blue-600 font-bold">Saldo Esperado (Sistema):</span>
                <span className="body font-black text-blue-700">{formatCurrency(cajaActual?.montoEsperado)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">Monto Real en Caja (Efectivo + Otros)</label>
                <input
                  type="number"
                  placeholder="Ej: 155000"
                  className="input"
                  value={montoCierreReal}
                  onChange={(e) => setMontoCierreReal(e.target.value)}
                />
              </div>
              <div>
                <label className="label mb-2 block">Notas de Cierre</label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="Ej: Faltan 100 pesos por cambio..."
                  value={notaCierre}
                  onChange={(e) => setNotaCierre(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowCerrarCajaModal(false)}>Volver</Button>
                <Button className="btn-primary flex-1 bg-red-600 hover:bg-red-700 border-none" onClick={handleCerrarCaja}>Procesar Cierre</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddEgresoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="card card-padding w-full max-w-md animate-in zoom-in-95">
            <h3 className="heading-3 mb-6">Registrar Nuevo Gasto</h3>
            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">Concepto / Descripción</label>
                <input
                  className="input"
                  placeholder="Ej: Pago de Luz local"
                  value={nuevoEgreso.concepto}
                  onChange={(e) => setNuevoEgreso({ ...nuevoEgreso, concepto: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-2 block">Monto</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Ej: 15000"
                    value={nuevoEgreso.monto}
                    onChange={(e) => setNuevoEgreso({ ...nuevoEgreso, monto: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label mb-2 block">Categoría</label>
                  <select
                    className="input"
                    value={nuevoEgreso.categoria}
                    onChange={(e) => setNuevoEgreso({ ...nuevoEgreso, categoria: e.target.value })}
                  >
                    <option value="OPERATIVO">Operativo</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="INSUMOS">Insumos</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddEgresoModal(false)}>Cancelar</Button>
                <Button className="btn-primary flex-1" onClick={handleAddEgreso}>Guardar Egreso</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

