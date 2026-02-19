/**
 * Manual Subscription Management - Backend Tests
 * 
 * Test script to verify all manual subscription endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

// Mock data
const testBarberiaId = '507f1f77bcf86cd799439011'; // Replace with real ID
const testUserId = '507f1f77bcf86cd799439012'; // Replace with real SuperAdmin ID

// You'll need a valid JWT token for SuperAdmin
const AUTH_TOKEN = 'YOUR_SUPERADMIN_JWT_TOKEN_HERE';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testChangePlan() {
    console.log('\n🧪 Testing: Change Plan Manually');
    try {
        const response = await api.post(`/superadmin/subscriptions/${testBarberiaId}/change-plan`, {
            newPlan: 'BASIC',
            reason: 'Cliente pagó plan básico por transferencia'
        });
        console.log('✅ Success:', response.data.message);
        console.log('   Plan:', response.data.subscription.plan);
        console.log('   Payment Method:', response.data.subscription.paymentMethod);
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error || error.message);
    }
}

async function testExtendPeriod() {
    console.log('\n🧪 Testing: Extend Period Manually');
    try {
        const response = await api.post(`/superadmin/subscriptions/${testBarberiaId}/extend`, {
            months: 3,
            reason: 'Promoción especial - 3 meses gratis'
        });
        console.log('✅ Success:', response.data.message);
        console.log('   New End Date:', response.data.subscription.currentPeriodEnd);
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error || error.message);
    }
}

async function testRecordPayment() {
    console.log('\n🧪 Testing: Record Manual Payment');
    try {
        const response = await api.post(`/superadmin/subscriptions/${testBarberiaId}/record-payment`, {
            amount: 15000,
            concept: 'Pago plan BASIC - Transferencia bancaria',
            metadata: {
                paymentMethod: 'Transferencia',
                bank: 'Banco de Chile',
                reference: 'TRF-2026-001'
            }
        });
        console.log('✅ Success:', response.data.message);
        console.log('   Total Payments:', response.data.subscription.manualPayments.length);
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error || error.message);
    }
}

async function testActivate() {
    console.log('\n🧪 Testing: Activate Subscription');
    try {
        const response = await api.post(`/superadmin/subscriptions/${testBarberiaId}/activate`, {
            reason: 'Pago confirmado'
        });
        console.log('✅ Success:', response.data.message);
        console.log('   Status:', response.data.subscription.status);
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error || error.message);
    }
}

async function testDeactivate() {
    console.log('\n🧪 Testing: Deactivate Subscription');
    try {
        const response = await api.post(`/superadmin/subscriptions/${testBarberiaId}/deactivate`, {
            reason: 'Cliente solicitó cancelación'
        });
        console.log('✅ Success:', response.data.message);
        console.log('   Status:', response.data.subscription.status);
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error || error.message);
    }
}

async function testGetHistory() {
    console.log('\n🧪 Testing: Get Subscription History');
    try {
        const response = await api.get(`/superadmin/subscriptions/${testBarberiaId}/history`);
        console.log('✅ Success: History retrieved');
        console.log('   Total Changes:', response.data.summary.totalChanges);
        console.log('   Total Payments:', response.data.summary.totalManualPayments);
        console.log('   Total Amount:', response.data.summary.totalManualPaymentAmount);
        console.log('   Is Manual:', response.data.summary.isManagedManually);

        if (response.data.changeHistory.length > 0) {
            console.log('\n   Recent Changes:');
            response.data.changeHistory.slice(0, 3).forEach((change, i) => {
                console.log(`   ${i + 1}. ${change.type}: ${change.from} → ${change.to}`);
                console.log(`      Reason: ${change.reason || 'N/A'}`);
            });
        }
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error || error.message);
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  MANUAL SUBSCRIPTION MANAGEMENT - BACKEND TESTS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📍 API URL: ${API_URL}`);
    console.log(`🏢 Test Barberia ID: ${testBarberiaId}`);
    console.log(`\n⚠️  NOTE: You need to update the following in this file:`);
    console.log(`   - testBarberiaId: Use a real barberia ID from your database`);
    console.log(`   - AUTH_TOKEN: Use a valid SuperAdmin JWT token`);
    console.log(`\n   To get a token, login as SuperAdmin and copy from browser DevTools`);

    if (AUTH_TOKEN === 'YOUR_SUPERADMIN_JWT_TOKEN_HERE') {
        console.log('\n❌ ERROR: Please set AUTH_TOKEN before running tests');
        console.log('   1. Login as SuperAdmin in the frontend');
        console.log('   2. Open DevTools → Application → Local Storage');
        console.log('   3. Copy the token value');
        console.log('   4. Update AUTH_TOKEN in this file');
        return;
    }

    console.log('\n🚀 Running tests...\n');

    // Run tests sequentially
    await testChangePlan();
    await new Promise(resolve => setTimeout(resolve, 500));

    await testExtendPeriod();
    await new Promise(resolve => setTimeout(resolve, 500));

    await testRecordPayment();
    await new Promise(resolve => setTimeout(resolve, 500));

    await testActivate();
    await new Promise(resolve => setTimeout(resolve, 500));

    await testGetHistory();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  TESTS COMPLETED');
    console.log('═══════════════════════════════════════════════════════\n');
}

// Run tests
runAllTests().catch(console.error);
