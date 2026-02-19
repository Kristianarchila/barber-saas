/**
 * Test Script for Email Notification System
 * Run this to verify the system is working correctly
 */

const { runReminderJobManually } = require('./src/infrastructure/jobs/reminderScheduler');
const EmailAdapter = require('./src/infrastructure/external-services/email/EmailAdapter');

async function testEmailSystem() {
    console.log('\n🧪 TESTING EMAIL NOTIFICATION SYSTEM\n');
    console.log('='.repeat(50));

    // Test 1: Email Adapter Initialization
    console.log('\n1️⃣ Testing Email Adapter...');
    try {
        const emailAdapter = new EmailAdapter();
        console.log('   ✅ EmailAdapter initialized successfully');
    } catch (error) {
        console.error('   ❌ Error:', error.message);
        return;
    }

    // Test 2: Manual Reminder Job
    console.log('\n2️⃣ Running manual reminder job...');
    try {
        const result = await runReminderJobManually(24);
        console.log(`   ✅ Job completed: ${result.sent} sent, ${result.failed} failed`);

        if (result.sent === 0 && result.failed === 0) {
            console.log('   ℹ️  No reservations found for tomorrow');
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }

    // Test 3: Environment Variables
    console.log('\n3️⃣ Checking environment variables...');
    const requiredVars = ['EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL'];
    let allPresent = true;

    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName} is set`);
        } else {
            console.log(`   ❌ ${varName} is MISSING`);
            allPresent = false;
        }
    });

    if (!allPresent) {
        console.log('\n   ⚠️  Add missing variables to .env file');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Test completed!\n');
}

// Run if called directly
if (require.main === module) {
    require('dotenv').config();
    const { connectDB } = require('./src/config/db');

    connectDB().then(() => {
        testEmailSystem().then(() => {
            process.exit(0);
        }).catch(err => {
            console.error('Test failed:', err);
            process.exit(1);
        });
    });
}

module.exports = { testEmailSystem };
