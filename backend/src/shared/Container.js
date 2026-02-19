/**
 * Dependency Injection Container
 * Centralizes the creation and wiring of dependencies
 */

// Repositories
const MongoReservaRepository = require('../infrastructure/database/mongodb/repositories/MongoReservaRepository');
const MongoServicioRepository = require('../infrastructure/database/mongodb/repositories/MongoServicioRepository');
const MongoClienteRepository = require('../infrastructure/database/mongodb/repositories/MongoClienteRepository');
const MongoBarberoRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberoRepository');
const MongoHorarioRepository = require('../infrastructure/database/mongodb/repositories/MongoHorarioRepository');
const MongoUserRepository = require('../infrastructure/database/mongodb/repositories/MongoUserRepository');
const MongoBarberiaRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberiaRepository');
const MongoProductoRepository = require('../infrastructure/database/mongodb/repositories/MongoProductoRepository');
const MongoPedidoRepository = require('../infrastructure/database/mongodb/repositories/MongoPedidoRepository');
const MongoInventarioRepository = require('../infrastructure/database/mongodb/repositories/MongoInventarioRepository');
const MongoMovimientoStockRepository = require('../infrastructure/database/mongodb/repositories/MongoMovimientoStockRepository');
const MongoProveedorRepository = require('../infrastructure/database/mongodb/repositories/MongoProveedorRepository');
const MongoCarritoRepository = require('../infrastructure/database/mongodb/repositories/MongoCarritoRepository');
const MongoEgresoRepository = require('../infrastructure/database/mongodb/repositories/MongoEgresoRepository');
const MongoCajaRepository = require('../infrastructure/database/mongodb/repositories/MongoCajaRepository');
const MongoPagoRepository = require('../infrastructure/database/mongodb/repositories/MongoPagoRepository');
const MongoTransactionRepository = require('../infrastructure/database/mongodb/repositories/MongoTransactionRepository');
const MongoRevenueConfigRepository = require('../infrastructure/database/mongodb/repositories/MongoRevenueConfigRepository');
const MongoBloqueoRepository = require('../infrastructure/database/mongodb/repositories/MongoBloqueoRepository');
const MongoClienteStatsRepository = require('../infrastructure/database/mongodb/repositories/MongoClienteStatsRepository');
const MongoVentaRepository = require('../infrastructure/database/mongodb/repositories/MongoVentaRepository');
const MongoWaitingListRepository = require('../infrastructure/database/mongodb/repositories/MongoWaitingListRepository');


// Domain Services
const AvailabilityService = require('../domain/services/AvailabilityService');
const PricingService = require('../domain/services/PricingService');
const RevenueService = require('../domain/services/RevenueService');

// Use Cases - Reservas
const CreateReserva = require('../application/use-cases/reservas/CreateReserva');
const CancelReserva = require('../application/use-cases/reservas/CancelReserva');
const CompleteReserva = require('../application/use-cases/reservas/CompleteReserva');
const RescheduleReserva = require('../application/use-cases/reservas/RescheduleReserva');
const GetAvailableSlots = require('../application/use-cases/reservas/GetAvailableSlots');

// Use Cases - Bloqueos
const CheckBloqueos = require('../application/use-cases/bloqueos/CheckBloqueos');

// Use Cases - Clientes (Cancellation Limits)
const CheckClienteStatus = require('../application/use-cases/clientes/CheckClienteStatus');
const IncrementCancelacion = require('../application/use-cases/clientes/IncrementCancelacion');
const IncrementReserva = require('../application/use-cases/clientes/IncrementReserva');
const ValidarCancelacion = require('../application/use-cases/clientes/ValidarCancelacion');
const ResetMonthlyCancelaciones = require('../application/use-cases/clientes/ResetMonthlyCancelaciones');

// Use Cases - Waiting List
const JoinWaitingList = require('../application/use-cases/waitingList/JoinWaitingList');
const NotifyWaitingList = require('../application/use-cases/waitingList/NotifyWaitingList');
const ConvertWaitingListToReserva = require('../application/use-cases/waitingList/ConvertWaitingListToReserva');
const GetWaitingListByBarberia = require('../application/use-cases/waitingList/GetWaitingListByBarberia');
const CancelWaitingListEntry = require('../application/use-cases/waitingList/CancelWaitingListEntry');

// Use Cases - Servicios
const CreateServicio = require('../application/use-cases/servicios/CreateServicio');
const UpdateServicio = require('../application/use-cases/servicios/UpdateServicio');
const DeleteServicio = require('../application/use-cases/servicios/DeleteServicio');
const ListServicios = require('../application/use-cases/servicios/ListServicios');

// Use Cases - Barberos
const CreateBarbero = require('../application/use-cases/barberos/CreateBarbero');
const ListBarberos = require('../application/use-cases/barberos/ListBarberos');
const GetBarberoById = require('../application/use-cases/barberos/GetBarberoById');
const UpdateBarbero = require('../application/use-cases/barberos/UpdateBarbero');
const DeleteBarbero = require('../application/use-cases/barberos/DeleteBarbero');
const ToggleBarberoStatus = require('../application/use-cases/barberos/ToggleBarberoStatus');
const GetMiPerfil = require('../application/use-cases/barberos/GetMiPerfil');
const GetMisCitas = require('../application/use-cases/barberos/GetMisCitas');
const GetAgenda = require('../application/use-cases/barberos/GetAgenda');
const GetEstadisticasBarbero = require('../application/use-cases/barberos/GetEstadisticasBarbero');

// Use Cases - Horarios
const SaveHorario = require('../application/use-cases/horarios/SaveHorario');
const GetHorariosByBarbero = require('../application/use-cases/horarios/GetHorariosByBarbero');
const ToggleHorario = require('../application/use-cases/horarios/ToggleHorario');

// Use Cases - Barberias
const CreateBarberia = require('../application/use-cases/barberias/CreateBarberia');
const ListBarberias = require('../application/use-cases/barberias/ListBarberias');
const GetBarberiaById = require('../application/use-cases/barberias/GetBarberiaById');
const UpdateBarberiaConfig = require('../application/use-cases/barberias/UpdateBarberiaConfig');
const GetMiBarberia = require('../application/use-cases/barberias/GetMiBarberia');

// Use Cases - Productos
const ListProductos = require('../application/use-cases/productos/ListProductos');
const GetProductoById = require('../application/use-cases/productos/GetProductoById');
const CreateProducto = require('../application/use-cases/productos/CreateProducto');
const UpdateProducto = require('../application/use-cases/productos/UpdateProducto');
const DeleteProducto = require('../application/use-cases/productos/DeleteProducto');
const UpdateStock = require('../application/use-cases/productos/UpdateStock');

// Use Cases - Inventario
const GetInventario = require('../application/use-cases/inventario/GetInventario');
const GetInventarioItem = require('../application/use-cases/inventario/GetInventarioItem');

// Use Cases - AI
const GetAISlotSuggestions = require('../application/use-cases/reservas/GetAISlotSuggestions');

// Use Cases - Calendar
const SyncReservaWithCalendar = require('../application/use-cases/calendar/SyncReservaWithCalendar');

// Adapters
const OpenAIAdapter = require('../infrastructure/external-services/ai/OpenAIAdapter');
const GoogleCalendarAdapter = require('../infrastructure/external-services/calendar/GoogleCalendarAdapter');
const MongoCalendarSyncRepository = require('../infrastructure/database/mongodb/repositories/MongoCalendarSyncRepository');
const CreateInventario = require('../application/use-cases/inventario/CreateInventario');
const UpdateInventario = require('../application/use-cases/inventario/UpdateInventario');
const RegistrarMovimiento = require('../application/use-cases/inventario/RegistrarMovimiento');
const GetMovimientos = require('../application/use-cases/inventario/GetMovimientos');
const GetAlertasStock = require('../application/use-cases/inventario/GetAlertasStock');

// Use Cases - Proveedores
const ListProveedores = require('../application/use-cases/proveedores/ListProveedores');
const GetProveedor = require('../application/use-cases/proveedores/GetProveedor');
const CreateProveedor = require('../application/use-cases/proveedores/CreateProveedor');
const UpdateProveedor = require('../application/use-cases/proveedores/UpdateProveedor');
const DeleteProveedor = require('../application/use-cases/proveedores/DeleteProveedor');

// Use Cases - Carrito
const ObtenerCarrito = require('../application/use-cases/carrito/ObtenerCarrito');
const AgregarProductoCarrito = require('../application/use-cases/carrito/AgregarProductoCarrito');
const ActualizarCantidadCarrito = require('../application/use-cases/carrito/ActualizarCantidadCarrito');
const RemoverProductoCarrito = require('../application/use-cases/carrito/RemoverProductoCarrito');
const VaciarCarrito = require('../application/use-cases/carrito/VaciarCarrito');
const MigrarCarrito = require('../application/use-cases/carrito/MigrarCarrito');

// Use Cases - Egresos
const RegistrarEgreso = require('../application/use-cases/egresos/RegistrarEgreso');
const ObtenerEgresos = require('../application/use-cases/egresos/ObtenerEgresos');
const ObtenerResumenEgresos = require('../application/use-cases/egresos/ObtenerResumenEgresos');
const ActualizarEgreso = require('../application/use-cases/egresos/ActualizarEgreso');
const EliminarEgreso = require('../application/use-cases/egresos/EliminarEgreso');

// Use Cases - Caja
const AbrirCaja = require('../application/use-cases/caja/AbrirCaja');
const ObtenerCajaActual = require('../application/use-cases/caja/ObtenerCajaActual');
const RegistrarMovimientoCaja = require('../application/use-cases/caja/RegistrarMovimientoCaja');
const CerrarCaja = require('../application/use-cases/caja/CerrarCaja');
const ListHistorialCajas = require('../application/use-cases/caja/ListHistorialCajas');

// Use Cases - Ventas
const RegistrarVentaRapida = require('../application/use-cases/ventas/RegistrarVentaRapida');


// Use Cases - Pagos
const RegistrarPago = require('../application/use-cases/pagos/RegistrarPago');
const ObtenerPagos = require('../application/use-cases/pagos/ObtenerPagos');
const ObtenerResumenIngresos = require('../application/use-cases/pagos/ObtenerResumenIngresos');

// Use Cases - Finanzas
const GetFinanzasSummary = require('../application/use-cases/finanzas/GetFinanzasSummary');

// Use Cases - Transactions
const ListTransactions = require('../application/use-cases/transactions/ListTransactions');
const GetTransactionById = require('../application/use-cases/transactions/GetTransactionById');
const AjustarTransaccion = require('../application/use-cases/transactions/AjustarTransaccion');
const MarcarComoPagado = require('../application/use-cases/transactions/MarcarComoPagado');
const GetBalanceBarbero = require('../application/use-cases/transactions/GetBalanceBarbero');
const GetReporteFinanciero = require('../application/use-cases/transactions/GetReporteFinanciero');

// Use Cases - Public
const GetBarberiaBySlug = require('../application/use-cases/public/GetBarberiaBySlug');

// Use Cases - Pedidos
const CreatePedido = require('../application/use-cases/pedidos/CreatePedido');
const GetPedido = require('../application/use-cases/pedidos/GetPedido');
const ListMisPedidos = require('../application/use-cases/pedidos/ListMisPedidos');
const ListTodosPedidos = require('../application/use-cases/pedidos/ListTodosPedidos');
const UpdatePedidoEstado = require('../application/use-cases/pedidos/UpdatePedidoEstado');
const CancelPedido = require('../application/use-cases/pedidos/CancelPedido');
const GetPedidoStats = require('../application/use-cases/pedidos/GetPedidoStats');

// Use Cases - Users
const CreateBarberiaAdmin = require('../application/use-cases/users/CreateBarberiaAdmin');
const CreateUsuarioBarbero = require('../application/use-cases/users/CreateUsuarioBarbero');
const GetMyBarberias = require('../application/use-cases/users/GetMyBarberias');
const ListClientes = require('../application/use-cases/users/ListClientes');
const CreateCliente = require('../application/use-cases/users/CreateCliente');

// Use Cases - Auth
const Login = require('../application/use-cases/auth/Login');
const Register = require('../application/use-cases/auth/Register');

// Use Cases - SuperAdmin
const GetAuditLogs = require('../application/use-cases/audit/GetAuditLogs');
const GetAdmins = require('../application/use-cases/superadmin/GetAdmins');
const UpdateAdminSedes = require('../application/use-cases/superadmin/UpdateAdminSedes');
const SAGetGlobalStats = require('../application/use-cases/superadmin/GetGlobalStats');
const SAListBarberias = require('../application/use-cases/superadmin/ListBarberias');
const SAGetBarberiaDetails = require('../application/use-cases/superadmin/GetBarberiaDetails');
const SACreateBarberia = require('../application/use-cases/superadmin/CreateBarberia');
const SAUpdateBarberia = require('../application/use-cases/superadmin/UpdateBarberia');
const SAChangeBarberiaStatus = require('../application/use-cases/superadmin/ChangeBarberiaStatus');
const SAExtendPaymentDeadline = require('../application/use-cases/superadmin/ExtendPaymentDeadline');
const SADeleteBarberia = require('../application/use-cases/superadmin/DeleteBarberia');

// Use Cases - Dashboard
const GetDashboardStats = require('../application/use-cases/dashboard/GetDashboardStats');

// Use Cases - Turnos
const GetTurnosDia = require('../application/use-cases/turnos/GetTurnosDia');
const GetTurnosMes = require('../application/use-cases/turnos/GetTurnosMes');

// Use Cases - Reportes
const GetResumenGeneral = require('../application/use-cases/reportes/GetResumenGeneral');
const GetRendimientoBarberos = require('../application/use-cases/reportes/GetRendimientoBarberos');
const GetServiciosMasVendidos = require('../application/use-cases/reportes/GetServiciosMasVendidos');
const GetAnalisisPagos = require('../application/use-cases/reportes/GetAnalisisPagos');
const GetTendenciasIngresos = require('../application/use-cases/reportes/GetTendenciasIngresos');

// Security Services
const BcryptPasswordService = require('../infrastructure/security/BcryptPasswordService');

// External Services Adapters
const CloudinaryAdapter = require('../infrastructure/external-services/cloudinary/CloudinaryAdapter');
const EmailAdapter = require('../infrastructure/external-services/email/EmailAdapter');
const StripeAdapter = require('../infrastructure/external-services/payments/StripeAdapter');

// Legacy External Services (to be deprecated)
const emailService = require('../notifications/email/email.service');

class Container {
    constructor() {
        this._instances = {};
    }

    // ==========================================
    // REPOSITORIES
    // ==========================================

    get reservaRepository() {
        if (!this._instances.reservaRepository) {
            this._instances.reservaRepository = new MongoReservaRepository();
        }
        return this._instances.reservaRepository;
    }

    get servicioRepository() {
        if (!this._instances.servicioRepository) {
            this._instances.servicioRepository = new MongoServicioRepository();
        }
        return this._instances.servicioRepository;
    }

    get clienteRepository() {
        if (!this._instances.clienteRepository) {
            this._instances.clienteRepository = new MongoClienteRepository();
        }
        return this._instances.clienteRepository;
    }

    get barberoRepository() {
        if (!this._instances.barberoRepository) {
            this._instances.barberoRepository = new MongoBarberoRepository();
        }
        return this._instances.barberoRepository;
    }

    get horarioRepository() {
        if (!this._instances.horarioRepository) {
            this._instances.horarioRepository = new MongoHorarioRepository();
        }
        return this._instances.horarioRepository;
    }

    get userRepository() {
        if (!this._instances.userRepository) {
            this._instances.userRepository = new MongoUserRepository();
        }
        return this._instances.userRepository;
    }

    get barberiaRepository() {
        if (!this._instances.barberiaRepository) {
            this._instances.barberiaRepository = new MongoBarberiaRepository();
        }
        return this._instances.barberiaRepository;
    }

    get productoRepository() {
        if (!this._instances.productoRepository) {
            this._instances.productoRepository = new MongoProductoRepository();
        }
        return this._instances.productoRepository;
    }

    get pedidoRepository() {
        if (!this._instances.pedidoRepository) {
            this._instances.pedidoRepository = new MongoPedidoRepository();
        }
        return this._instances.pedidoRepository;
    }

    get inventarioRepository() {
        if (!this._instances.inventarioRepository) {
            this._instances.inventarioRepository = new MongoInventarioRepository();
        }
        return this._instances.inventarioRepository;
    }

    get movimientoRepository() {
        if (!this._instances.movimientoRepository) {
            this._instances.movimientoRepository = new MongoMovimientoStockRepository();
        }
        return this._instances.movimientoRepository;
    }

    get proveedorRepository() {
        if (!this._instances.proveedorRepository) {
            this._instances.proveedorRepository = new MongoProveedorRepository();
        }
        return this._instances.proveedorRepository;
    }

    get carritoRepository() {
        if (!this._instances.carritoRepository) {
            this._instances.carritoRepository = new MongoCarritoRepository();
        }
        return this._instances.carritoRepository;
    }

    get egresoRepository() {
        if (!this._instances.egresoRepository) {
            this._instances.egresoRepository = new MongoEgresoRepository();
        }
        return this._instances.egresoRepository;
    }

    get cajaRepository() {
        if (!this._instances.cajaRepository) {
            this._instances.cajaRepository = new MongoCajaRepository();
        }
        return this._instances.cajaRepository;
    }

    get pagoRepository() {
        if (!this._instances.pagoRepository) {
            this._instances.pagoRepository = new MongoPagoRepository();
        }
        return this._instances.pagoRepository;
    }

    get transactionRepository() {
        if (!this._instances.transactionRepository) {
            this._instances.transactionRepository = new MongoTransactionRepository();
        }
        return this._instances.transactionRepository;
    }

    get revenueConfigRepository() {
        if (!this._instances.revenueConfigRepository) {
            this._instances.revenueConfigRepository = new MongoRevenueConfigRepository();
        }
        return this._instances.revenueConfigRepository;
    }

    get bloqueoRepository() {
        if (!this._instances.bloqueoRepository) {
            this._instances.bloqueoRepository = new MongoBloqueoRepository();
        }
        return this._instances.bloqueoRepository;
    }

    get clienteStatsRepository() {
        if (!this._instances.clienteStatsRepository) {
            this._instances.clienteStatsRepository = new MongoClienteStatsRepository();
        }
        return this._instances.clienteStatsRepository;
    }

    get ventaRepository() {
        if (!this._instances.ventaRepository) {
            this._instances.ventaRepository = new MongoVentaRepository();
        }
        return this._instances.ventaRepository;
    }

    get waitingListRepository() {
        if (!this._instances.waitingListRepository) {
            this._instances.waitingListRepository = new MongoWaitingListRepository();
        }
        return this._instances.waitingListRepository;
    }

    get passwordService() {
        if (!this._instances.passwordService) {
            this._instances.passwordService = new BcryptPasswordService();
        }
        return this._instances.passwordService;
    }

    // ==========================================
    // EXTERNAL SERVICES ADAPTERS
    // ==========================================

    get cloudinaryAdapter() {
        if (!this._instances.cloudinaryAdapter) {
            this._instances.cloudinaryAdapter = new CloudinaryAdapter();
        }
        return this._instances.cloudinaryAdapter;
    }

    get emailAdapter() {
        if (!this._instances.emailAdapter) {
            this._instances.emailAdapter = new EmailAdapter();
        }
        return this._instances.emailAdapter;
    }

    get stripeAdapter() {
        if (!this._instances.stripeAdapter) {
            this._instances.stripeAdapter = new StripeAdapter();
        }
        return this._instances.stripeAdapter;
    }

    // ==========================================
    // DOMAIN SERVICES
    // ==========================================

    get availabilityService() {
        if (!this._instances.availabilityService) {
            this._instances.availabilityService = new AvailabilityService(
                this.reservaRepository
            );
        }
        return this._instances.availabilityService;
    }

    get pricingService() {
        if (!this._instances.pricingService) {
            this._instances.pricingService = new PricingService();
        }
        return this._instances.pricingService;
    }

    // ==========================================
    // USE CASES - RESERVAS
    // ==========================================

    get createReservaUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        if (!this._instances.checkBloqueosUseCase) {
            this._instances.checkBloqueosUseCase = new CheckBloqueos(this.bloqueoRepository);
        }

        if (!this._instances.checkClienteStatusUseCase) {
            this._instances.checkClienteStatusUseCase = new CheckClienteStatus(this.clienteStatsRepository);
        }

        if (!this._instances.incrementReservaUseCase) {
            this._instances.incrementReservaUseCase = new IncrementReserva(this.clienteStatsRepository);
        }

        return new CreateReserva(
            this.reservaRepository,
            this.servicioRepository,
            this.availabilityService,
            this._instances.emailServiceWrapper,
            this._instances.checkBloqueosUseCase,
            this._instances.checkClienteStatusUseCase,
            this._instances.incrementReservaUseCase
        );
    }

    get cancelReservaUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        if (!this._instances.validarCancelacionUseCase) {
            this._instances.validarCancelacionUseCase = new ValidarCancelacion();
        }

        if (!this._instances.incrementCancelacionUseCase) {
            this._instances.incrementCancelacionUseCase = new IncrementCancelacion(this.clienteStatsRepository);
        }

        return new CancelReserva(
            this.reservaRepository,
            this._instances.emailServiceWrapper,
            this.barberiaRepository,
            this._instances.validarCancelacionUseCase,
            this._instances.incrementCancelacionUseCase
        );
    }

    get completeReservaUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new CompleteReserva(
            this.reservaRepository,
            this.clienteRepository,
            this._instances.emailServiceWrapper
        );
    }

    get rescheduleReservaUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new RescheduleReserva(
            this.reservaRepository,
            this.availabilityService,
            this._instances.emailServiceWrapper
        );
    }

    get getAvailableSlotsUseCase() {
        return new GetAvailableSlots(
            this.availabilityService,
            this.barberoRepository,
            this.horarioRepository
        );
    }

    // ==========================================
    // USE CASES - SERVICIOS
    // ==========================================

    get createServicioUseCase() {
        return new CreateServicio(this.servicioRepository);
    }

    get updateServicioUseCase() {
        return new UpdateServicio(this.servicioRepository);
    }

    get deleteServicioUseCase() {
        return new DeleteServicio(
            this.servicioRepository,
            this.reservaRepository
        );
    }

    get listServiciosUseCase() {
        return new ListServicios(this.servicioRepository);
    }

    // ==========================================
    // USE CASES - BARBEROS
    // ==========================================

    get createBarberoUseCase() {
        return new CreateBarbero(this.barberoRepository, this.userRepository);
    }

    get listBarberosUseCase() {
        return new ListBarberos(this.barberoRepository);
    }

    get getBarberoByIdUseCase() {
        return new GetBarberoById(this.barberoRepository);
    }

    get updateBarberoUseCase() {
        return new UpdateBarbero(this.barberoRepository, this.userRepository);
    }

    get deleteBarberoUseCase() {
        return new DeleteBarbero(this.barberoRepository, this.userRepository);
    }

    get toggleBarberoStatusUseCase() {
        return new ToggleBarberoStatus(this.barberoRepository, this.userRepository);
    }

    get getMiPerfilUseCase() {
        return new GetMiPerfil(this.barberoRepository);
    }

    get getMisCitasUseCase() {
        return new GetMisCitas(this.barberoRepository, this.reservaRepository);
    }

    get getAgendaUseCase() {
        return new GetAgenda(this.barberoRepository, this.reservaRepository);
    }

    get getAgendaBarberoRangeUseCase() {
        const GetAgendaBarberoRange = require('../application/use-cases/barberos/GetAgendaBarberoRange');
        return new GetAgendaBarberoRange(this.barberoRepository, this.reservaRepository);
    }

    get getEstadisticasBarberoUseCase() {
        return new GetEstadisticasBarbero(this.barberoRepository, this.reservaRepository);
    }

    // ==========================================
    // USE CASES - HORARIOS
    // ==========================================

    get saveHorarioUseCase() {
        return new SaveHorario(this.horarioRepository, this.barberoRepository);
    }

    get getHorariosByBarberoUseCase() {
        return new GetHorariosByBarbero(this.horarioRepository, this.barberoRepository);
    }

    get toggleHorarioUseCase() {
        return new ToggleHorario(this.horarioRepository, this.barberoRepository);
    }

    // ==========================================
    // USE CASES - BARBERIAS
    // ==========================================

    get createBarberiaUseCase() {
        return new CreateBarberia(this.barberiaRepository);
    }

    get listBarberiasUseCase() {
        return new ListBarberias(this.barberiaRepository);
    }

    get getBarberiaByIdUseCase() {
        return new GetBarberiaById(this.barberiaRepository);
    }

    get updateBarberiaConfigUseCase() {
        return new UpdateBarberiaConfig(this.barberiaRepository);
    }

    get getMiBarberiaUseCase() {
        return new GetMiBarberia(this.barberiaRepository);
    }

    // ==========================================
    // USE CASES - PRODUCTOS
    // ==========================================

    get listProductosUseCase() {
        return new ListProductos(this.productoRepository, this.barberiaRepository);
    }

    get getProductoByIdUseCase() {
        return new GetProductoById(this.productoRepository, this.barberiaRepository);
    }

    get createProductoUseCase() {
        return new CreateProducto(this.productoRepository, this.barberiaRepository);
    }

    get updateProductoUseCase() {
        return new UpdateProducto(this.productoRepository);
    }

    get deleteProductoUseCase() {
        return new DeleteProducto(this.productoRepository);
    }

    get updateStockUseCase() {
        return new UpdateStock(this.productoRepository);
    }

    // ==========================================
    // USE CASES - INVENTARIO
    // ==========================================

    get getInventarioUseCase() {
        return new GetInventario(this.inventarioRepository);
    }

    get getInventarioItemUseCase() {
        return new GetInventarioItem(this.inventarioRepository);
    }

    get createInventarioUseCase() {
        return new CreateInventario(
            this.inventarioRepository,
            this.movimientoRepository,
            this.productoRepository
        );
    }

    get updateInventarioUseCase() {
        return new UpdateInventario(this.inventarioRepository);
    }

    get registrarMovimientoUseCase() {
        return new RegistrarMovimiento(this.inventarioRepository, this.movimientoRepository);
    }

    get getMovimientosUseCase() {
        return new GetMovimientos(this.movimientoRepository);
    }

    get getAlertasStockUseCase() {
        return new GetAlertasStock(this.inventarioRepository);
    }

    // ==========================================
    // USE CASES - PROVEEDORES
    // ==========================================

    get listProveedoresUseCase() {
        return new ListProveedores(this.proveedorRepository);
    }

    get getProveedorUseCase() {
        return new GetProveedor(this.proveedorRepository);
    }

    get createProveedorUseCase() {
        return new CreateProveedor(this.proveedorRepository);
    }

    get updateProveedorUseCase() {
        return new UpdateProveedor(this.proveedorRepository);
    }

    get deleteProveedorUseCase() {
        return new DeleteProveedor(this.proveedorRepository);
    }

    // ==========================================
    // USE CASES - CARRITO
    // ==========================================

    get obtenerCarritoUseCase() {
        return new ObtenerCarrito(this.carritoRepository, this.productoRepository);
    }

    get agregarProductoCarritoUseCase() {
        return new AgregarProductoCarrito(this.carritoRepository, this.productoRepository);
    }

    get actualizarCantidadCarritoUseCase() {
        return new ActualizarCantidadCarrito(this.carritoRepository, this.productoRepository);
    }

    get removerProductoCarritoUseCase() {
        return new RemoverProductoCarrito(this.carritoRepository);
    }

    get vaciarCarritoUseCase() {
        return new VaciarCarrito(this.carritoRepository);
    }

    get migrarCarritoUseCase() {
        return new MigrarCarrito(this.carritoRepository, this.productoRepository);
    }

    // ==========================================
    // USE CASES - EGRESOS
    // ==========================================

    get registrarEgresoUseCase() {
        return new RegistrarEgreso(this.egresoRepository);
    }

    get obtenerEgresosUseCase() {
        return new ObtenerEgresos(this.egresoRepository);
    }

    get obtenerResumenEgresosUseCase() {
        return new ObtenerResumenEgresos(this.egresoRepository);
    }

    get actualizarEgresoUseCase() {
        return new ActualizarEgreso(this.egresoRepository);
    }

    get eliminarEgresoUseCase() {
        return new EliminarEgreso(this.egresoRepository);
    }

    // ==========================================
    // USE CASES - CAJA
    // ==========================================

    get abrirCajaUseCase() {
        return new AbrirCaja(this.cajaRepository);
    }

    get obtenerCajaActualUseCase() {
        return new ObtenerCajaActual(this.cajaRepository);
    }

    get registrarMovimientoCajaUseCase() {
        return new RegistrarMovimientoCaja(this.cajaRepository);
    }

    get cerrarCajaUseCase() {
        return new CerrarCaja(this.cajaRepository);
    }

    get listHistorialCajasUseCase() {
        return new ListHistorialCajas(this.cajaRepository);
    }

    // ==========================================
    // USE CASES - VENTAS
    // ==========================================

    get registrarVentaRapidaUseCase() {
        return new RegistrarVentaRapida(
            this.ventaRepository,
            this.inventarioRepository,
            this.cajaRepository,
            this.transactionRepository,
            this.barberoRepository,
            this.servicioRepository,
            this.productoRepository
        );
    }


    // ==========================================
    // USE CASES - PAGOS
    // ==========================================

    get registrarPagoUseCase() {
        return new RegistrarPago(
            this.pagoRepository,
            this.reservaRepository,
            this.cajaRepository
        );
    }

    get obtenerPagosUseCase() {
        return new ObtenerPagos(this.pagoRepository);
    }

    get obtenerResumenIngresosUseCase() {
        return new ObtenerResumenIngresos(this.pagoRepository);
    }

    // ==========================================
    // USE CASES - FINANZAS
    // ==========================================

    get getFinanzasSummaryUseCase() {
        return new GetFinanzasSummary(this.reservaRepository);
    }

    // ==========================================
    // USE CASES - TRANSACTIONS
    // ==========================================

    get listTransactionsUseCase() {
        return new ListTransactions(this.transactionRepository);
    }

    get getTransactionByIdUseCase() {
        return new GetTransactionById(this.transactionRepository);
    }

    get ajustarTransaccionUseCase() {
        return new AjustarTransaccion(this.transactionRepository, this.revenueConfigRepository);
    }

    get marcarComoPagadoUseCase() {
        return new MarcarComoPagado(this.transactionRepository);
    }

    get getBalanceBarberoUseCase() {
        return new GetBalanceBarbero(this.transactionRepository);
    }

    get getReporteFinancieroUseCase() {
        return new GetReporteFinanciero(this.transactionRepository);
    }

    // ==========================================
    // USE CASES - PUBLIC
    // ==========================================

    get getBarberiaBySlugUseCase() {
        return new GetBarberiaBySlug(this.barberiaRepository);
    }

    // ==========================================
    // USE CASES - PEDIDOS
    // ==========================================

    get createPedidoUseCase() {
        return new CreatePedido(
            this.pedidoRepository,
            this.productoRepository,
            this.barberiaRepository
        );
    }

    get getPedidoUseCase() {
        return new GetPedido(this.pedidoRepository, this.barberiaRepository);
    }

    get listMisPedidosUseCase() {
        return new ListMisPedidos(this.pedidoRepository, this.barberiaRepository);
    }

    get listTodosPedidosUseCase() {
        return new ListTodosPedidos(this.pedidoRepository);
    }

    get updatePedidoEstadoUseCase() {
        return new UpdatePedidoEstado(this.pedidoRepository);
    }

    get cancelPedidoUseCase() {
        return new CancelPedido(
            this.pedidoRepository,
            this.productoRepository,
            this.barberiaRepository
        );
    }

    get getPedidoStatsUseCase() {
        return new GetPedidoStats(this.pedidoRepository);
    }

    // ==========================================
    // USE CASES - USERS
    // ==========================================

    get createBarberiaAdminUseCase() {
        return new CreateBarberiaAdmin(this.userRepository, this.barberiaRepository);
    }

    get createUsuarioBarberoUseCase() {
        return new CreateUsuarioBarbero(this.userRepository, this.barberoRepository);
    }

    get getMyBarberiasUseCase() {
        return new GetMyBarberias(this.userRepository, this.barberiaRepository);
    }

    get listClientesUseCase() {
        return new ListClientes(this.userRepository);
    }

    get createClienteUseCase() {
        return new CreateCliente(this.userRepository);
    }

    // ==========================================
    // USE CASES - AUTH
    // ==========================================

    get loginUseCase() {
        return new Login(this.userRepository, this.passwordService);
    }

    get registerUseCase() {
        return new Register(this.userRepository);
    }

    // ==========================================
    // USE CASES - SUPERADMIN
    // ==========================================

    get getAdminsUseCase() {
        return new GetAdmins(this.userRepository);
    }

    get updateAdminSedesUseCase() {
        return new UpdateAdminSedes(this.userRepository);
    }

    get getGlobalStatsUseCase() {
        return new SAGetGlobalStats(this.barberiaRepository);
    }

    get listBarberiasAdminUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new SAListBarberias(
            this.barberiaRepository,
            this.userRepository,
            this.barberoRepository,
            this.reservaRepository
        );
    }

    get getBarberiaDetailsAdminUseCase() {
        return new SAGetBarberiaDetails(
            this.barberiaRepository,
            this.userRepository,
            this.barberoRepository,
            this.reservaRepository
        );
    }

    get createBarberiaAdminUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new SACreateBarberia(
            this.barberiaRepository,
            this.userRepository,
            this._instances.emailServiceWrapper
        );
    }

    get updateBarberiaAdminUseCase() {
        return new SAUpdateBarberia(this.barberiaRepository);
    }

    get changeBarberiaStatusAdminUseCase() {
        return new SAChangeBarberiaStatus(this.barberiaRepository);
    }

    get extendPaymentDeadlineAdminUseCase() {
        return new SAExtendPaymentDeadline(this.barberiaRepository);
    }

    get deleteBarberiaAdminUseCase() {
        return new SADeleteBarberia(
            this.barberiaRepository,
            this.userRepository
        );
    }

    // ==========================================
    // USE CASES - DASHBOARD
    // ==========================================

    get getDashboardStatsUseCase() {
        return new GetDashboardStats(
            this.barberoRepository,
            this.servicioRepository,
            this.reservaRepository
        );
    }

    // ==========================================
    // USE CASES - TURNOS
    // ==========================================

    get getTurnosDiaUseCase() {
        return new GetTurnosDia(
            this.reservaRepository,
            this.servicioRepository,
            this.userRepository
        );
    }

    get getTurnosMesUseCase() {
        return new GetTurnosMes(
            this.reservaRepository,
            this.servicioRepository
        );
    }

    // ==========================================
    // USE CASES - REPORTES
    // ==========================================

    get getResumenGeneralUseCase() {
        return new GetResumenGeneral(
            this.pagoRepository,
            this.egresoRepository,
            this.reservaRepository
        );
    }

    get getRendimientoBarberosUseCase() {
        return new GetRendimientoBarberos(
            this.barberoRepository,
            this.reservaRepository,
            this.pagoRepository,
            this.revenueConfigRepository
        );
    }

    get getServiciosMasVendidosUseCase() {
        return new GetServiciosMasVendidos(
            this.reservaRepository
        );
    }

    get getAnalisisPagosUseCase() {
        return new GetAnalisisPagos(
            this.pagoRepository
        );
    }

    get getTendenciasIngresosUseCase() {
        return new GetTendenciasIngresos(
            this.pagoRepository,
            this.egresoRepository
        );
    }

    // ==========================================
    // USE CASES - WAITING LIST
    // ==========================================

    get joinWaitingListUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new JoinWaitingList(
            this.waitingListRepository,
            this.reservaRepository,
            this._instances.emailServiceWrapper
        );
    }

    get notifyWaitingListUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new NotifyWaitingList(
            this.waitingListRepository,
            this._instances.emailServiceWrapper
        );
    }

    get convertWaitingListToReservaUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new ConvertWaitingListToReserva(
            this.waitingListRepository,
            this.reservaRepository,
            this.createReservaUseCase,
            this._instances.emailServiceWrapper
        );
    }

    get getWaitingListByBarberiaUseCase() {
        return new GetWaitingListByBarberia(this.waitingListRepository);
    }

    get cancelWaitingListEntryUseCase() {
        if (!this._instances.emailServiceWrapper) {
            const EmailServiceWrapper = require('../infrastructure/external-services/email/EmailServiceWrapper');
            this._instances.emailServiceWrapper = new EmailServiceWrapper(emailService);
        }

        return new CancelWaitingListEntry(
            this.waitingListRepository,
            this._instances.emailServiceWrapper
        );
    }

    // ==========================================
    // EXTERNAL SERVICES ADAPTERS
    // ==========================================

    get openAIAdapter() {
        if (!this._instances.openAIAdapter) {
            this._instances.openAIAdapter = new OpenAIAdapter(process.env.OPENAI_API_KEY);
        }
        return this._instances.openAIAdapter;
    }

    // ==========================================
    // USE CASES - AI
    // ==========================================

    get getAISlotSuggestionsUseCase() {
        return new GetAISlotSuggestions(
            this.openAIAdapter,
            this.availabilityService,
            this.barberoRepository,
            this.servicioRepository,
            this.barberiaRepository
        );
    }

    // ==========================================
    // USE CASES - CALENDAR
    // ==========================================

    get calendarSyncRepository() {
        if (!this._instances.calendarSyncRepository) {
            this._instances.calendarSyncRepository = new MongoCalendarSyncRepository();
        }
        return this._instances.calendarSyncRepository;
    }

    get googleCalendarAdapter() {
        if (!this._instances.googleCalendarAdapter) {
            this._instances.googleCalendarAdapter = new GoogleCalendarAdapter(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                `${process.env.FRONTEND_URL}/admin/calendar/callback/google`
            );
        }
        return this._instances.googleCalendarAdapter;
    }

    get syncReservaWithCalendarUseCase() {
        return new SyncReservaWithCalendar(
            this.reservaRepository,
            this.calendarSyncRepository,
            this.googleCalendarAdapter,
            null
        );
    }

    get getAuditLogsUseCase() {
        return new GetAuditLogs();
    }
}

// Export singleton instance
module.exports = new Container();
