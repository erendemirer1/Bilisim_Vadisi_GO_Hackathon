# Monitoring Sistemi

Bu proje Prometheus, Grafana ve Loki kullanarak kapsamlı monitoring ve logging çözümü içermektedir.

## 📊 Bileşenler

### 1. Prometheus (Metrics Collection)
- **Port:** 9090
- **Endpoint:** http://localhost:9090
- Backend servisi her 15 saniyede bir scrape edilir
- Metriks endpoint: `/metrics`

### 2. Grafana (Visualization)
- **Port:** 3001 (Docker), 3000 (Kubernetes)
- **Endpoint:** http://localhost:3001
- **Default Credentials:**
  - Username: `admin`
  - Password: `admin123`
- Prometheus ve Loki otomatik olarak veri kaynağı olarak eklenir

### 3. Loki (Log Aggregation)
- **Port:** 3100
- **Endpoint:** http://localhost:3100
- Container loglarını toplar ve saklar

### 4. Promtail (Log Collection)
- Docker container loglarını otomatik toplar
- Loki'ye gönderir

## 🚀 Kullanım

### Docker Compose ile Başlatma

```bash
# Tüm servisleri başlat
docker-compose up -d

# Monitoring servislerini kontrol et
docker-compose ps

# Logları izle
docker-compose logs -f prometheus grafana loki promtail
```

### Kubernetes ile Deployment

```bash
# Monitoring stack'i deploy et
kubectl apply -f k8s/monitoring.yaml

# Prometheus Operator kurulu olmalı:
# kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

# Servisleri kontrol et
kubectl get pods -l app=prometheus
kubectl get pods -l app=grafana
kubectl get pods -l app=loki

# Port forwarding ile erişim
kubectl port-forward svc/prometheus 9090:9090
kubectl port-forward svc/grafana 3000:3000
kubectl port-forward svc/loki 3100:3100
```

## 📈 Mevcut Metrikler

Backend servisi aşağıdaki Prometheus metriklerini expose eder:

- `http_requests_total` - Toplam HTTP istek sayısı
- `http_errors_total` - Toplam HTTP hata sayısı
- `health_checks_total` - Toplam health check sayısı
- `process_uptime_seconds` - Process çalışma süresi
- `nodejs_memory_heap_used_bytes` - Node.js heap memory kullanımı
- `nodejs_memory_heap_total_bytes` - Node.js toplam heap memory
- `nodejs_memory_rss_bytes` - Node.js RSS memory

### Metrikleri Görüntüleme

```bash
# Backend metrics
curl http://localhost:3000/metrics

# Prometheus targets
curl http://localhost:9090/api/v1/targets
```

## 🔍 Grafana Dashboard Oluşturma

1. Grafana'ya giriş yap: http://localhost:3001
2. **+** -> **Dashboard** -> **Add new panel**
3. Query örnekleri:

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_errors_total[5m])

# Memory usage
nodejs_memory_heap_used_bytes / 1024 / 1024

# Uptime
process_uptime_seconds / 60
```

## 📝 Log Sorgulama

Loki'de logları sorgulamak için Grafana Explore kullanın:

1. Grafana -> Explore
2. Datasource: Loki
3. Query örnekleri:

```logql
# Backend logları
{container="hack-backend"}

# Error logları
{container="hack-backend"} |= "error"

# Son 1 saatteki loglar
{service="backend"} [1h]
```

## 🛠️ Konfigürasyon Dosyaları

```
monitoring/
├── prometheus.yml           # Prometheus config
├── loki-config.yml         # Loki config
├── promtail-config.yml     # Promtail config
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yml
        └── dashboards/
            └── dashboards.yml
```

## 🔐 Güvenlik Notları

- **Production'da** Grafana admin şifresini mutlaka değiştirin
- Prometheus ve Grafana'yı public internete açmayın
- RBAC ve network policies kullanın
- TLS/SSL sertifikaları ekleyin

## 📊 Kubernetes HPA ile Entegrasyon

HPA metrikleri Prometheus'tan alabilir:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
```

## 🐛 Troubleshooting

### Prometheus hedefleri görünmüyor
```bash
# Docker network'ü kontrol et
docker network inspect bilisim_vadisi_go_hackathon_app-network

# Backend'in çalıştığını kontrol et
curl http://localhost:3000/metrics
```

### Grafana datasource bağlanamıyor
```bash
# Loki ve Prometheus'un çalıştığını kontrol et
docker-compose ps
kubectl get pods

# DNS resolution test et
docker exec hack-grafana ping prometheus
docker exec hack-grafana ping loki
```

### Loglar gelmiyor
```bash
# Promtail loglarını kontrol et
docker-compose logs promtail

# Loki'ye erişimi test et
curl http://localhost:3100/ready
```

## 📚 Ek Kaynaklar

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL Tutorial](https://grafana.com/docs/loki/latest/logql/)
