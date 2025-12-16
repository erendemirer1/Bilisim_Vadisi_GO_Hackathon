# CI/CD Pipeline Dokümantasyonu

## 📋 Genel Bakış

Bu proje tam otomatik CI/CD pipeline'ı ile çalışmaktadır. GitHub Actions kullanarak kod değişikliklerini otomatik olarak test eder, Docker image'larını build edip Docker Hub'a push eder ve GKE cluster'a deploy eder.

## 🔄 Pipeline Yapısı

### 1. **CI Pipeline** (`ci.yml`)
- **Trigger:** `dev` branch'ine push veya PR
- **İşlemler:**
  - ✅ Backend testleri (Node.js 20)
  - ✅ Frontend testleri
  - ✅ Linting kontrolleri
  - ✅ Format kontrolleri
  - ✅ Docker build testleri

### 2. **CD Pipeline** (`cd.yml`)
- **Trigger:** `main` branch'ine push veya manuel tetikleme
- **İşlemler:**
  - 🐳 Docker image build (backend & frontend)
  - 📦 Docker Hub'a push (latest, commit SHA, date tags)
  - 🚀 GKE'ye otomatik deployment (secrets varsa)
  - ✅ Deployment verification

## 🔐 Gerekli GitHub Secrets

Repository Settings → Secrets and variables → Actions → New repository secret:

### Zorunlu Secrets (Docker için):
```
DOCKER_USERNAME=erendemirer1
DOCKER_PASSWORD=your_docker_hub_token
```

### Opsiyonel Secrets (GKE otomatik deployment için):
```
GCP_SA_KEY=<service-account-json-key>
GCP_PROJECT_ID=bilisimvadisihackathon
GKE_CLUSTER_NAME=hackathon-cluster
GKE_ZONE=europe-central2
```

## 🚀 Deployment Workflow

### Otomatik Deployment (Önerilen)
1. Değişiklikleri `main` branch'e push edin:
   ```bash
   git add .
   git commit -m "feat: yeni özellik eklendi"
   git push origin main
   ```

2. GitHub Actions otomatik olarak:
   - Docker image'ları build eder
   - Docker Hub'a push eder
   - GKE'ye deploy eder (secrets varsa)

3. Deployment durumunu kontrol edin:
   - GitHub → Actions sekmesi
   - Veya: `kubectl get pods -w`

### Manuel Deployment
GitHub Actions'dan manuel tetikleme:
1. GitHub → Actions → CD workflow
2. "Run workflow" butonuna tıklayın
3. Branch seçin ve "Run workflow"

## 📊 Mevcut Deployment Bilgileri

### Cluster Bilgileri:
- **Project ID:** `bilisimvadisihackathon`
- **Cluster Name:** `hackathon-cluster`
- **Zone:** `europe-central2`

### Servis URL'leri:
- **Backend:** `http://34.118.24.156:3000`
- **Frontend:** `http://34.118.101.197`

### Docker Images:
- **Backend:** `erendemirer1/backend:latest`
- **Frontend:** `erendemirer1/frontend:latest`

## 🔧 Manuel Deployment Komutları

Eğer GitHub Actions kullanmak istemezseniz:

### 1. Docker Build & Push
```bash
# Backend
docker build -t erendemirer1/backend:latest ./backend
docker push erendemirer1/backend:latest

# Frontend
docker build -t erendemirer1/frontend:latest ./frontend
docker push erendemirer1/frontend:latest
```

### 2. GKE Deployment
```bash
# Cluster'a bağlan
gcloud container clusters get-credentials hackathon-cluster \
  --zone=europe-central2 \
  --project=bilisimvadisihackathon

# Deploy
kubectl set image deployment/backend backend=erendemirer1/backend:latest
kubectl set image deployment/frontend frontend=erendemirer1/frontend:latest

# Rollout durumunu izle
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
```

## 🐛 Troubleshooting

### Pipeline Başarısız Olursa:
1. GitHub Actions logs'ları kontrol edin
2. Docker Hub credentials'ları doğrulayın
3. GKE secrets'larını kontrol edin

### Pod Başlatılamıyorsa:
```bash
# Pod loglarını kontrol et
kubectl logs deployment/backend
kubectl logs deployment/frontend

# Pod durumunu detaylı incele
kubectl describe pod <pod-name>

# Events'leri kontrol et
kubectl get events --sort-by='.lastTimestamp'
```

### Rollback Gerekirse:
```bash
# Önceki versiyona dön
kubectl rollout undo deployment/backend
kubectl rollout undo deployment/frontend

# Belirli bir revision'a dön
kubectl rollout history deployment/backend
kubectl rollout undo deployment/backend --to-revision=2
```

## 📈 Monitoring

### Pipeline Durumu:
- GitHub → Actions sekmesi → Workflow runs

### Deployment Durumu:
```bash
# Genel durum
kubectl get all

# HPA durumu
kubectl get hpa

# Resource kullanımı
kubectl top pods
kubectl top nodes
```

## 🔒 Güvenlik

- ✅ Docker images multi-stage build ile optimize
- ✅ Non-root user kullanımı
- ✅ Secret management (ConfigMap & Secrets)
- ✅ RBAC permissions
- ✅ Network policies (opsiyonel)
- ✅ Image scanning (Docker Hub)

## 📝 Best Practices

1. **Feature Branch Strategy:**
   - `dev` → Development (CI testleri)
   - `main` → Production (CD deployment)

2. **Version Tagging:**
   - Her commit otomatik version tag alır
   - Format: `YYYYMMDD-<commit-sha>`

3. **Zero Downtime:**
   - Rolling update strategy
   - Health checks (readiness & liveness)
   - HPA ile auto-scaling

4. **Rollback Strategy:**
   - Her deployment önceki versiyonu saklar
   - Tek komutla rollback mümkün

## 🎯 Sonraki Adımlar

- [ ] Ingress controller ekle (SSL/TLS)
- [ ] Monitoring dashboard (Grafana)
- [ ] Alerting (Prometheus)
- [ ] Backup stratejisi (Velero)
- [ ] GitOps (ArgoCD/Flux)
