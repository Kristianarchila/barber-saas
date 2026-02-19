# 📦 Backup & Recovery Guide

## 🎯 Overview

This system implements a **3-tier backup strategy** to prevent catastrophic data loss:

1. **Daily Backups** - Automated daily at 2:00 AM (retention: 7 days)
2. **Weekly Backups** - Every Sunday at 3:00 AM (retention: 4 weeks)
3. **Monthly Backups** - 1st of month at 4:00 AM (retention: 12 months)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install MongoDB tools
# macOS
brew install mongodb-database-tools

# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# Windows
# Download from: https://www.mongodb.com/try/download/database-tools
```

### Configuration

Add to your `.env`:

```bash
# Backup Configuration
MONGO_URI=mongodb://localhost:27017/barber-saas
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=7
BACKUP_RETENTION_WEEKS=4
BACKUP_RETENTION_MONTHS=12
BACKUP_COMPRESS=true

# Optional: Notifications
SLACK_BACKUP_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
BACKUP_EMAIL_NOTIFICATIONS=false
```

---

## 📋 Manual Backup

### Create Backup

```bash
# Run manual backup
node scripts/backup-mongodb.js

# List all backups
node scripts/backup-mongodb.js list
```

### Expected Output

```
🔄 Starting MongoDB backup...
📁 Backup location: /path/to/backups/backup-2026-02-12T15-30-00-000Z
⏳ Running mongodump...
🗜️ Compressing backup...
✅ Backup compressed
✅ Backup completed successfully!
📊 Size: 45.23 MB
⏱️ Duration: 12.5s
🧹 Cleaning old backups...
✅ Retention policy applied (7 daily, 4 weekly, 12 monthly)
```

---

## 🔄 Automated Backups

### Start Scheduler

```bash
# Run in background with PM2 (recommended)
pm2 start scripts/schedule-backups.js --name backup-scheduler

# Or run directly (for testing)
node scripts/schedule-backups.js
```

### PM2 Configuration

Add to `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'barber-saas-api',
      script: 'src/server.js',
      instances: 2,
      exec_mode: 'cluster'
    },
    {
      name: 'backup-scheduler',
      script: 'scripts/schedule-backups.js',
      instances: 1,
      cron_restart: '0 0 * * *' // Restart daily at midnight
    }
  ]
};
```

### Verify Scheduler

```bash
# Check PM2 status
pm2 status

# View scheduler logs
pm2 logs backup-scheduler

# Monitor in real-time
pm2 monit
```

---

## 🔙 Restore from Backup

### List Available Backups

```bash
node scripts/restore-mongodb.js list
```

Output:
```
📋 Available backups:

1. backup-2026-02-12T15-30-00-000Z
   Size: 45.23 MB | Created: 2026-02-12T15:30:00.000Z

2. backup-2026-02-11T02-00-00-000Z
   Size: 44.87 MB | Created: 2026-02-11T02:00:00.000Z
```

### Restore Database

```bash
# Interactive restore (asks for confirmation)
node scripts/restore-mongodb.js restore backup-2026-02-12T15-30-00-000Z

# Auto-confirm (for scripts)
node scripts/restore-mongodb.js restore backup-2026-02-12T15-30-00-000Z --confirm
```

### Restore Process

1. ✅ Creates safety backup of current database
2. ⚠️ Asks for confirmation (unless `--confirm` flag)
3. 🗜️ Decompresses backup if needed
4. 🔄 Drops current database
5. 📥 Restores from backup
6. ✅ Completes with success message

**Safety**: Your current database is backed up before restore, so you can rollback if needed.

---

## 🏥 Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Problem**: Admin deleted all barberos by mistake

**Solution**:
```bash
# 1. List backups
node scripts/restore-mongodb.js list

# 2. Restore from latest backup before deletion
node scripts/restore-mongodb.js restore backup-2026-02-12T15-30-00-000Z

# 3. Verify data
mongo barber-saas --eval "db.barberos.countDocuments({})"
```

### Scenario 2: Database Corruption

**Problem**: MongoDB crashed and database is corrupted

**Solution**:
```bash
# 1. Stop application
pm2 stop barber-saas-api

# 2. Restore from latest backup
node scripts/restore-mongodb.js restore backup-2026-02-12T02-00-00-000Z --confirm

# 3. Restart application
pm2 restart barber-saas-api

# 4. Verify health
curl http://localhost:5000/health
```

### Scenario 3: Ransomware Attack

**Problem**: Database encrypted by ransomware

**Solution**:
```bash
# 1. Isolate server (disconnect network)
sudo ifconfig eth0 down

# 2. Restore from offline backup
node scripts/restore-mongodb.js restore backup-2026-02-01T04-00-00-000Z --confirm

# 3. Update security
# - Change all passwords
# - Update firewall rules
# - Scan for malware

# 4. Reconnect and verify
sudo ifconfig eth0 up
```

---

## 📊 Monitoring & Alerts

### Slack Notifications

Configure Slack webhook in `.env`:

```bash
SLACK_BACKUP_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
```

You'll receive notifications for:
- ✅ Successful backups (size, duration)
- ❌ Failed backups (error details)
- 🧹 Cleanup operations

### Health Checks

Add to your monitoring system:

```bash
# Check if backups are running
ls -lt backups/ | head -n 5

# Verify latest backup is recent (< 25 hours old)
find backups/ -name "backup-*.tar.gz" -mtime -1 | wc -l
# Should return at least 1
```

---

## 🔐 Security Best Practices

### 1. Encrypt Backups

```bash
# Encrypt backup with GPG
gpg --symmetric --cipher-algo AES256 backups/backup-2026-02-12.tar.gz

# Decrypt when needed
gpg --decrypt backups/backup-2026-02-12.tar.gz.gpg > backup.tar.gz
```

### 2. Off-site Storage

Upload to cloud storage:

```bash
# AWS S3
aws s3 sync backups/ s3://your-bucket/barber-saas-backups/

# Google Cloud Storage
gsutil -m rsync -r backups/ gs://your-bucket/barber-saas-backups/

# Azure Blob Storage
az storage blob upload-batch -d backups -s ./backups/
```

### 3. Access Control

```bash
# Restrict backup directory permissions
chmod 700 backups/
chown mongodb:mongodb backups/

# Restrict script permissions
chmod 750 scripts/backup-mongodb.js
chmod 750 scripts/restore-mongodb.js
```

---

## 🧪 Testing Backups

**CRITICAL**: Test your backups monthly!

```bash
# 1. Create test database
mongorestore --uri="mongodb://localhost:27017/barber-saas-test" \
  backups/backup-2026-02-12T02-00-00-000Z

# 2. Verify data integrity
mongo barber-saas-test --eval "
  print('Barberias:', db.barberias.countDocuments({}));
  print('Barberos:', db.barberos.countDocuments({}));
  print('Reservas:', db.reservas.countDocuments({}));
"

# 3. Drop test database
mongo barber-saas-test --eval "db.dropDatabase()"
```

---

## 📈 Backup Size Estimation

| Database Size | Compressed Backup | Retention Cost (7d + 4w + 12m) |
|---------------|-------------------|--------------------------------|
| 100 MB | ~20 MB | ~500 MB |
| 1 GB | ~200 MB | ~5 GB |
| 10 GB | ~2 GB | ~50 GB |
| 100 GB | ~20 GB | ~500 GB |

**Tip**: Monitor backup sizes to predict storage needs.

---

## 🆘 Emergency Contacts

**Backup Issues**: 
- Check logs: `pm2 logs backup-scheduler`
- Verify disk space: `df -h`
- Check MongoDB status: `systemctl status mongod`

**Data Loss**: 
- DO NOT PANIC
- DO NOT make changes to database
- Contact senior developer immediately
- Follow disaster recovery procedures above

---

## ✅ Checklist: Production Deployment

- [ ] MongoDB tools installed
- [ ] Backup scripts tested manually
- [ ] PM2 scheduler configured and running
- [ ] Slack notifications working
- [ ] Off-site backup sync configured
- [ ] Backup encryption enabled (if required)
- [ ] Restore procedure tested successfully
- [ ] Team trained on recovery procedures
- [ ] Monitoring alerts configured
- [ ] Monthly backup test scheduled

---

## 📚 Additional Resources

- [MongoDB Backup Methods](https://www.mongodb.com/docs/manual/core/backups/)
- [mongodump Documentation](https://www.mongodb.com/docs/database-tools/mongodump/)
- [mongorestore Documentation](https://www.mongodb.com/docs/database-tools/mongorestore/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)

---

**Last Updated**: 2026-02-12  
**Version**: 1.0.0  
**Maintained by**: DevOps Team
