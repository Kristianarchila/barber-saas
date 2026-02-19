/**
 * Quick Manual Test
 * Tests manual subscription management with real database IDs
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000/api';
const BARBERIA_ID = '694215d5e25160b2d7f0b103'; // Barbería Central

// You need to get this token by logging in as SuperAdmin
// Email: krisjosearchila@gmail.com
const AUTH_TOKEN = process.env.TEST_TOKEN || 'PASTE_YOUR_TOKEN_HERE';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function quickTest() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  QUICK MANUAL SUBSCRIPTION TEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n🏢 Barberia: Barbería Central`);
    console.log(`📍 ID: ${BARBERIA_ID}`);

    if (AUTH_TOKEN === 'PASTE_YOUR_TOKEN_HERE') {
        console.log('\n⚠️  NECESITAS UN TOKEN DE SUPERADMIN');
        console.log('\n📝 Pasos para obtener el token:');
        console.log('   1. Abre el frontend en el navegador');
        console.log('   2. Login con: krisjosearchila@gmail.com');
        console.log('   3. Abre DevTools (F12) → Application → Local Storage');
        console.log('   4. Busca "token" y copia el valor');
        console.log('   5. Ejecuta: TEST_TOKEN="tu_token" node quick-test.js');
        console.log('\n   O edita este archivo y pega el token en AUTH_TOKEN\n');
        return;
    }

    console.log('\n🚀 Ejecutando prueba...\n');

    try {
        // Test 1: Change plan to BASIC
        console.log('1️⃣  Cambiando plan a BASIC...');
        const changePlan = await api.post(`/superadmin/subscriptions/${BARBERIA_ID}/change-plan`, {
            newPlan: 'BASIC',
            reason: 'Prueba de sistema manual - Cliente pagó por transferencia'
        });
        console.log('   ✅', changePlan.data.message);
        console.log('   📋 Plan:', changePlan.data.subscription.plan);
        console.log('   💳 Método:', changePlan.data.subscription.paymentMethod);

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test 2: Extend period
        console.log('\n2️⃣  Extendiendo período por 3 meses...');
        const extend = await api.post(`/superadmin/subscriptions/${BARBERIA_ID}/extend`, {
            months: 3,
            reason: 'Promoción de lanzamiento'
        });
        console.log('   ✅', extend.data.message);
        const endDate = new Date(extend.data.subscription.currentPeriodEnd);
        console.log('   📅 Vence:', endDate.toLocaleDateString('es-CL'));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Test 3: Record payment
        console.log('\n3️⃣  Registrando pago manual...');
        const payment = await api.post(`/superadmin/subscriptions/${BARBERIA_ID}/record-payment`, {
            amount: 15000,
            concept: 'Pago plan BASIC - Transferencia Banco de Chile',
            metadata: {
                paymentMethod: 'Transferencia',
                bank: 'Banco de Chile',
                reference: 'TRF-2026-001'
            }
        });
        console.log('   ✅', payment.data.message);
        console.log('   💰 Total pagos:', payment.data.subscription.manualPayments.length);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Test 4: Get history
        console.log('\n4️⃣  Obteniendo historial...');
        const history = await api.get(`/superadmin/subscriptions/${BARBERIA_ID}/history`);
        console.log('   ✅ Historial obtenido');
        console.log('   📊 Total cambios:', history.data.summary.totalChanges);
        console.log('   💵 Total pagos:', history.data.summary.totalManualPayments);
        console.log('   💰 Monto total: $' + history.data.summary.totalManualPaymentAmount.toLocaleString('es-CL'));
        console.log('   🔧 Gestión manual:', history.data.summary.isManagedManually ? 'Sí' : 'No');

        if (history.data.changeHistory.length > 0) {
            console.log('\n   📜 Últimos cambios:');
            history.data.changeHistory.slice(-3).forEach((change, i) => {
                const date = new Date(change.date).toLocaleString('es-CL');
                console.log(`      ${i + 1}. [${date}] ${change.type}`);
                console.log(`         ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`);
                if (change.reason) console.log(`         Razón: ${change.reason}`);
            });
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ✅ TODAS LAS PRUEBAS EXITOSAS');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.error || error.message);
        if (error.response?.status === 401) {
            console.log('\n   El token expiró o es inválido. Obtén uno nuevo.');
        }
        console.log('\n');
    }
}

quickTest();
