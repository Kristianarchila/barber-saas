/**
 * Script de Diagnóstico - Frontend/Backend Compatibility
 * Verifica que todos los endpoints críticos respondan correctamente
 */

const BASE_URL = 'http://localhost:4000';
const TEST_SLUG = 'barberiakris'; // Cambiar por un slug real de tu base de datos

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, url, data = null, headers = {}) {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            ...(data && { body: JSON.stringify(data) })
        };

        const response = await fetch(`${BASE_URL}${url}`, config);
        const responseData = await response.json().catch(() => null);

        if (response.ok) {
            log(`✅ ${method} ${url} - Status: ${response.status}`, 'green');
            return { success: true, status: response.status, data: responseData };
        } else {
            const message = responseData?.message || response.statusText;
            log(`❌ ${method} ${url} - Status: ${response.status} - ${message}`, 'red');
            return { success: false, status: response.status, error: message };
        }
    } catch (error) {
        log(`❌ ${method} ${url} - ERROR: ${error.message}`, 'red');
        return { success: false, status: 'ERROR', error: error.message };
    }
}

async function runDiagnostics() {
    log('\n🔍 INICIANDO DIAGNÓSTICO DE ENDPOINTS\n', 'blue');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // ========================================
    // 1. HEALTH CHECK
    // ========================================
    log('\n📋 1. HEALTH CHECK', 'yellow');
    const health = await testEndpoint('GET', '/health');
    results.tests.push({ name: 'Health Check', ...health });
    health.success ? results.passed++ : results.failed++;

    // ========================================
    // 2. PUBLIC ENDPOINTS (Sin autenticación)
    // ========================================
    log('\n📋 2. PUBLIC ENDPOINTS', 'yellow');

    // Test con /api/public/barberias (correcto según backend)
    const publicBarberia1 = await testEndpoint('GET', `/api/public/barberias/${TEST_SLUG}`);
    results.tests.push({ name: 'GET /api/public/barberias/:slug', ...publicBarberia1 });
    publicBarberia1.success ? results.passed++ : results.failed++;

    // Test sin /api (como lo usa el frontend actualmente)
    const publicBarberia2 = await testEndpoint('GET', `/public/barberias/${TEST_SLUG}`);
    results.tests.push({ name: 'GET /public/barberias/:slug (frontend)', ...publicBarberia2 });
    publicBarberia2.success ? results.passed++ : results.failed++;

    const publicBarberos = await testEndpoint('GET', `/api/public/barberias/${TEST_SLUG}/barberos`);
    results.tests.push({ name: 'GET /api/public/barberias/:slug/barberos', ...publicBarberos });
    publicBarberos.success ? results.passed++ : results.failed++;

    const publicServicios = await testEndpoint('GET', `/api/public/barberias/${TEST_SLUG}/servicios`);
    results.tests.push({ name: 'GET /api/public/barberias/:slug/servicios', ...publicServicios });
    publicServicios.success ? results.passed++ : results.failed++;

    // ========================================
    // 3. AUTH ENDPOINTS
    // ========================================
    log('\n📋 3. AUTH ENDPOINTS', 'yellow');

    const login = await testEndpoint('POST', '/api/auth/login', {
        email: 'test@test.com',
        password: 'wrongpassword'
    });
    results.tests.push({ name: 'POST /api/auth/login (invalid)', ...login });
    // Esperamos que falle con 401, no con 404
    if (login.status === 401 || login.status === 400) {
        results.passed++;
    } else {
        results.failed++;
    }

    // ========================================
    // 4. PROTECTED ENDPOINTS (Requieren token)
    // ========================================
    log('\n📋 4. PROTECTED ENDPOINTS (Sin token - debe fallar con 401)', 'yellow');

    const servicios = await testEndpoint('GET', `/api/barberias/${TEST_SLUG}/admin/servicios`);
    results.tests.push({ name: 'GET /api/barberias/:slug/admin/servicios', ...servicios });
    // Esperamos 401 (no autorizado), no 404
    if (servicios.status === 401) {
        results.passed++;
    } else {
        results.failed++;
    }

    const reservas = await testEndpoint('GET', `/api/barberias/${TEST_SLUG}/admin/reservas`);
    results.tests.push({ name: 'GET /api/barberias/:slug/admin/reservas', ...reservas });
    if (reservas.status === 401) {
        results.passed++;
    } else {
        results.failed++;
    }

    // ========================================
    // RESUMEN
    // ========================================
    log('\n' + '='.repeat(60), 'blue');
    log('📊 RESUMEN DEL DIAGNÓSTICO', 'blue');
    log('='.repeat(60), 'blue');
    log(`\n✅ Tests Pasados: ${results.passed}`, 'green');
    log(`❌ Tests Fallidos: ${results.failed}`, 'red');
    log(`📝 Total de Tests: ${results.tests.length}\n`, 'yellow');

    // ========================================
    // ANÁLISIS DE PROBLEMAS
    // ========================================
    if (results.failed > 0) {
        log('\n🔍 PROBLEMAS IDENTIFICADOS:\n', 'red');

        const publicTest = results.tests.find(t => t.name === 'GET /public/barberias/:slug (frontend)');
        const publicApiTest = results.tests.find(t => t.name === 'GET /api/public/barberias/:slug');

        if (!publicTest.success && publicApiTest.success) {
            log('⚠️  PROBLEMA CRÍTICO ENCONTRADO:', 'red');
            log('   El frontend usa /public/barberias pero el backend espera /api/public/barberias', 'yellow');
            log('   SOLUCIÓN: Verificar que api.js incluya /api en baseURL', 'green');
            log('   O actualizar publicService.js para no duplicar /api\n', 'green');
        }
    }

    // ========================================
    // RECOMENDACIONES
    // ========================================
    log('\n💡 RECOMENDACIONES:\n', 'blue');
    log('1. Verificar que VITE_API_URL en .env incluya /api:', 'yellow');
    log('   VITE_API_URL=http://localhost:4000/api\n', 'green');

    log('2. O actualizar api.js para agregar /api automáticamente:', 'yellow');
    log('   const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"\n', 'green');

    log('3. Revisar la consola del navegador (F12) para errores específicos\n', 'yellow');

    log('4. Si hay errores 404, verificar las rutas en app.js vs servicios del frontend\n', 'yellow');

    process.exit(results.failed > 0 ? 1 : 0);
}

// Ejecutar diagnóstico
runDiagnostics().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
