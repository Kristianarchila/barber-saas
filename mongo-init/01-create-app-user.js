/**
 * MongoDB Init Script
 * 
 * Creates the application-specific user with readWrite access
 * to the barber-saas database. This runs automatically on first
 * container startup when mounted in /docker-entrypoint-initdb.d/
 * 
 * The root user is created by MONGO_INITDB_ROOT_USERNAME/PASSWORD
 * env vars. This script runs AFTER that, authenticated as root.
 */

// Switch to the application database
db = db.getSiblingDB('barber-saas');

db.createUser({
    user: 'barber_app',
    pwd: process.env.MONGO_APP_PASSWORD || 'changeme_in_production',
    roles: [
        {
            role: 'readWrite',
            db: 'barber-saas'
        }
    ]
});

print('✅ Application user "barber_app" created for database "barber-saas"');
