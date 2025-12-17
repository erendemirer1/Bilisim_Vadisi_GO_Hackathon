## 42Klinik (GO Hackathon)

Full‑stack sağlık randevu projesi: React/Vite frontend, Node/Express (TypeScript) backend, Spring Boot AI chatbot, Redis (distributed locking) ve Kubernetes/monitoring altyapısı.

### Öne Çıkanlar
- Docker Compose ile tek komut lokal ortam
- GitHub Actions CD: Docker Hub’a image build+push (opsiyonel GKE deploy)
- Kubernetes: rolling update, HPA, health probes
- Observability: Prometheus + Grafana + Loki

## Hızlı Başlangıç (Docker Compose)

```bash
docker-compose up -d
docker-compose ps
```

Servisler:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Health: http://localhost:3000/health
- Prometheus: http://localhost:9090

Durdur:

```bash
docker-compose down
```

## Yerel Geliştirme

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend/ui
npm install
npm run dev
```

## API (kısa)

- `POST /register`, `POST /login`, `GET /validate`, `GET /health`
- `POST /admin/login`, `POST /admin/addDoctor`, `DELETE /admin/deleteDoctor`, `GET /admin/getAllDoctors`

## Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
kubectl get hpa
```

## Kubernetes (External IP)

Bu repoda `backend` ve `frontend` servisleri `LoadBalancer` tipinde olduğu için dış IP alır.

```bash
kubectl get svc backend frontend -o wide
```

URL’ler (IP geldikten sonra):
- Frontend: `http://<FRONTEND_EXTERNAL_IP>/`
- Backend: `http://<BACKEND_EXTERNAL_IP>:3000/health`

## CI/CD (özet)

`main` branch’e push:
- Backend & frontend image’ları Docker Hub’a basılır (`latest`, `${SHA7}`, `${YYYYMMDD}`).
- GKE secret’ları varsa aynı workflow run’ında Kubernetes’e deploy eder.

İlgili dosya: `.github/workflows/cd.yml`

## Dokümanlar

- `docs/DEPLOYMENT.md`
- `docs/CI-CD.md`
- `docs/MONITORING.md`
- `docs/GKE-SETUP.md`

## Lisans

MIT — `LICENSE`
