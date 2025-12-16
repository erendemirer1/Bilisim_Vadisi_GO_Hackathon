# Case 3 - DevOps Implementation Guide

## 📋 Overview

Bu döküman **Case 3: Akıllı Randevu ve Kuyruk Yönetimi** için DevOps gereksinimlerini içerir:

- ✅ **Kilit voltajı izleme** (Lock monitoring)
- ✅ **DB/Redis yedekleme** (Automated backups)
- ✅ **Randevu performans izleme** (<3 saniye response time)

---

## 🚀 Quick Start

### 1. Redis Infrastructure Deployment

```bash
# Redis StatefulSet ve Service
kubectl apply -f k8s/redis-deployment.yaml

# Redis Service'in çalıştığını kontrol et
kubectl get pods -l app=redis
kubectl get svc redis
```

### 2. Lock Monitoring Setup

```bash
# Lock monitoring deployment
kubectl apply -f k8s/lock-monitoring.yaml

# Metrics endpoint'i kontrol et
kubectl port-forward svc/lock-monitor 9150:9150
curl http://localhost:9150/metrics
```

### 3. Backup CronJobs

```bash
# Backup cronjobs oluştur
kubectl apply -f k8s/backup-cronjob.yaml

# CronJob'ları listele
kubectl get cronjobs

# Manuel backup tetikle (test için)
kubectl create job --from=cronjob/redis-backup redis-backup-manual
kubectl create job --from=cronjob/db-backup db-backup-manual
```

### 4. Performance Monitoring

```bash
# Prometheus alerting rules
kubectl apply -f k8s/performance-monitoring.yaml

# PrometheusRule'ları kontrol et
kubectl get prometheusrules
```

---

## 🔧 Configuration

### Redis Configuration

Redis aşağıdaki ayarlarla çalışır:

```yaml
# k8s/redis-deployment.yaml
maxmemory: 256mb
maxmemory-policy: allkeys-lru
appendonly: yes  # AOF persistence
```

**Environment Variables (Backend Developer için):**

```typescript
// backend/src/config/redis.ts
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost', // K8s: 'redis'
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
```

### Lock Monitoring Metrics

Lock monitoring aşağıdaki metrics'leri expose eder:

```
active_locks_count        # Aktif lock sayısı
stuck_locks_count         # 30s'den uzun stuck lock'lar
lock_monitor_last_check_timestamp  # Son kontrol zamanı
```

Prometheus'ta görmek için:

```promql
# Aktif lock sayısı
active_locks_count

# Stuck lock'lar
stuck_locks_count > 0
```

### Backup Strategy

#### Redis Backup
- **Schedule:** Her gün 02:00
- **Method:** Redis SAVE + RDB copy
- **Retention:** 7 gün
- **Storage:** 10Gi PVC

#### Database Backup
- **Schedule:** Her gün 02:30
- **Method:** SQLite .backup + gzip
- **Retention:** 14 gün
- **Storage:** 10Gi PVC

---

## 📊 Monitoring & Alerts

### Prometheus Alerting Rules

1. **AppointmentResponseTimeSlow**
   - Condition: p95 > 3 saniye
   - Duration: 5 dakika
   - Severity: warning

2. **LockWaitTimeHigh**
   - Condition: Average > 1 saniye
   - Duration: 2 dakika
   - Severity: warning

3. **RedisConnectionErrors**
   - Condition: Error rate > 0
   - Duration: 1 dakika
   - Severity: critical

4. **BackupJobFailed**
   - Condition: Job failed
   - Duration: 5 dakika
   - Severity: warning

5. **HighLockContention**
   - Condition: Failures > 10/sec
   - Duration: 5 dakika
   - Severity: warning

6. **RedisHighMemory**
   - Condition: Usage > 80%
   - Duration: 5 dakika
   - Severity: warning

7. **StuckLocksDetected**
   - Condition: Stuck locks > 5
   - Duration: 5 dakika
   - Severity: warning

8. **RedisDown**
   - Condition: Redis unavailable
   - Duration: 1 dakika
   - Severity: critical

9. **AppointmentQueueTooLong**
   - Condition: Queue > 100
   - Duration: 10 dakika
   - Severity: warning

### Grafana Dashboard

Grafana'da **"Appointment Performance (Case 3)"** dashboard'u:

```bash
# Grafana'ya eriş
kubectl port-forward svc/grafana 3000:3000

# Browser'da aç: http://localhost:3000
# Login: admin / admin123
# Dashboard: "Appointment Performance (Case 3)"
```

**Dashboard Panels:**
- API Response Time (p95)
- Lock Wait Time
- Redis Memory Usage
- Lock Contention Rate
- Appointment Queue Length
- Backup Status
- Active Locks
- Stuck Locks

---

## 🔍 Troubleshooting

### Redis Connection Issues

```bash
# Redis pod'u kontrol et
kubectl get pods -l app=redis
kubectl logs -l app=redis

# Redis'e bağlan
kubectl exec -it redis-0 -- redis-cli ping

# Redis metrics kontrol et
kubectl port-forward svc/redis 6379:6379
redis-cli -h localhost ping
```

### Backup Job Failures

```bash
# CronJob history
kubectl get jobs -l app=redis-backup
kubectl get jobs -l app=db-backup

# Son backup job logları
kubectl logs job/redis-backup-XXXXX
kubectl logs job/db-backup-XXXXX

# Backup dosyalarını kontrol et
kubectl exec -it <backup-job-pod> -- ls -lh /backup
```

### Lock Monitoring Issues

```bash
# Lock monitor pod'u kontrol et
kubectl get pods -l app=lock-monitor
kubectl logs -l app=lock-monitor -c monitor
kubectl logs -l app=lock-monitor -c metrics-exporter

# Metrics endpoint test et
kubectl port-forward svc/lock-monitor 9150:9150
curl http://localhost:9150/metrics
```

### Performance Issues

```bash
# Prometheus'ta alert'leri kontrol et
kubectl port-forward svc/prometheus 9090:9090
# Browser: http://localhost:9090/alerts

# Yavaş endpoint'leri bul
# PromQL: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Redis memory kontrol et
# PromQL: redis_memory_used_bytes / redis_memory_max_bytes
```

---

## 📈 Metrics Endpoints

| Service | Port | Endpoint | Description |
|---------|------|----------|-------------|
| Backend | 3000 | `/metrics` | Application metrics |
| Redis Exporter | 9121 | `/metrics` | Redis metrics |
| Lock Monitor | 9150 | `/metrics` | Lock monitoring metrics |
| Prometheus | 9090 | `/metrics` | Prometheus metrics |

---

## 🔐 Security Considerations

### Redis Security

```yaml
# Production'da Redis password kullan
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: redis-secret
stringData:
  password: "your-secure-password"
```

Backend'de:

```typescript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD, // K8s secret'tan
});
```

---

## 🧪 Testing

### Local Testing (Docker Compose)

```bash
# Redis ile local test
docker-compose up -d redis redis-exporter

# Redis'e bağlan
docker exec -it hack-redis redis-cli

# Test lock oluştur
SET lock:appointment:123 "locked" EX 30

# Lock monitoring test
docker-compose up -d
curl http://localhost:9150/metrics | grep lock
```

### K8s Testing

```bash
# Redis deployment test
kubectl apply -f k8s/redis-deployment.yaml
kubectl wait --for=condition=ready pod -l app=redis --timeout=60s

# Lock monitoring test
kubectl apply -f k8s/lock-monitoring.yaml
kubectl port-forward svc/lock-monitor 9150:9150 &
curl http://localhost:9150/metrics

# Backup test (manuel trigger)
kubectl create job --from=cronjob/redis-backup test-backup
kubectl logs job/test-backup --follow
```

---

## 📚 Backend Developer Integration

Backend developer'ın yapması gerekenler:

### 1. Redis Client Setup

```typescript
// backend/src/config/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    // Redis çöktüyse DB fallback (backend developer yazacak)
    if (times > 3) {
      console.warn('Redis unavailable, using DB lock');
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});
```

### 2. Lock Service Implementation

```typescript
// backend/src/services/LockService.ts
export class LockService {
  async acquireLock(resourceId: string, ttl: number = 30000): Promise<boolean> {
    try {
      const key = `lock:appointment:${resourceId}`;
      const acquired = await redis.set(key, Date.now(), 'PX', ttl, 'NX');
      return acquired === 'OK';
    } catch (error) {
      // Redis down, fallback to DB lock
      return await this.acquireDBLock(resourceId, ttl);
    }
  }
  
  async releaseLock(resourceId: string): Promise<void> {
    const key = `lock:appointment:${resourceId}`;
    await redis.del(key);
  }
}
```

### 3. Metrics Exposure

```typescript
// backend/src/server.ts
import promClient from 'prom-client';

// Custom metrics
const lockWaitDuration = new promClient.Histogram({
  name: 'lock_wait_duration_seconds',
  help: 'Time waiting for lock acquisition',
});

const lockAcquisitionFailures = new promClient.Counter({
  name: 'lock_acquisition_failures_total',
  help: 'Number of failed lock acquisitions',
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## 🎯 Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 2s | > 3s |
| Lock Wait Time | < 500ms | > 1s |
| Redis Memory Usage | < 70% | > 80% |
| Backup Success Rate | 100% | < 100% |
| Lock Contention | < 5/sec | > 10/sec |

---

## 🔄 Backup & Restore

### Restore Redis from Backup

```bash
# Backup dosyasını bul
kubectl exec -it redis-0 -- ls -lh /backup

# Redis'i durdur
kubectl scale statefulset redis --replicas=0

# Backup'ı restore et
kubectl cp <backup-file> redis-0:/data/dump.rdb

# Redis'i başlat
kubectl scale statefulset redis --replicas=1
```

### Restore Database from Backup

```bash
# Backup dosyasını bul
kubectl exec -it <backend-pod> -- ls -lh /backup

# Backup'ı extract et
kubectl exec -it <backend-pod> -- gunzip /backup/db-backup-XXXXXXXX.db.gz

# SQLite restore
kubectl exec -it <backend-pod> -- sqlite3 database.db ".restore /backup/db-backup-XXXXXXXX.db"
```

---

## 🚀 Production Deployment Checklist

- [ ] Redis password configured
- [ ] Backup CronJobs scheduled
- [ ] Prometheus alerts configured
- [ ] Grafana dashboard imported
- [ ] Lock monitoring deployed
- [ ] Resource limits set
- [ ] Health checks configured
- [ ] Metrics endpoints tested
- [ ] Backup restore tested
- [ ] Redis persistence verified

---

## 📞 Support

**DevOps Team:** Case 3 infrastructure sorularında
**Backend Team:** Lock implementation ve metrics exposure konularında
**Frontend Team:** UI/UX appointment features

---

## 🔗 Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Genel deployment guide
- [MONITORING.md](./MONITORING.md) - Monitoring stack dökümanı
- [API.md](./API.md) - Backend API endpoints

---

**Last Updated:** December 16, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
