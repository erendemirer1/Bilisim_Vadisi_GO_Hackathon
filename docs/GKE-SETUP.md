# GKE (Google Kubernetes Engine) Setup Guide

## Prerequisites

- Google Cloud Platform account
- gcloud CLI installed
- kubectl installed

## 1. GKE Cluster Setup

### Create GKE Cluster

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create GKE cluster (Standard tier)
gcloud container clusters create bilisim-vadisi-cluster \
  --zone=europe-west1-b \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --disk-size=20GB \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=5 \
  --enable-autorepair \
  --enable-autoupgrade \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver

# Get cluster credentials
gcloud container clusters get-credentials bilisim-vadisi-cluster \
  --zone=europe-west1-b
```

### Create Service Account for CI/CD

```bash
# Create service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create github-sa-key.json \
  --iam-account=github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Display key (for GitHub Secrets)
cat github-sa-key.json | base64
```

## 2. GitHub Secrets Configuration

GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Required secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `GCP_SA_KEY` | Service account JSON key (base64) | *paste base64 output* |
| `GCP_PROJECT_ID` | GCP Project ID | `bilisim-vadisi-2025` |
| `GKE_CLUSTER_NAME` | GKE cluster name | `bilisim-vadisi-cluster` |
| `GKE_ZONE` | GKE cluster zone | `europe-west1-b` |
| `DOCKERHUB_USERNAME` | Docker Hub username | `erendemirer1` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | *your token* |

## 3. Deploy Kubernetes Manifests

```bash
# Apply ConfigMap and Secrets first
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Deploy backend and frontend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Apply HPA
kubectl apply -f k8s/hpa.yaml

# Deploy monitoring
kubectl apply -f k8s/lock-monitoring.yaml
kubectl apply -f k8s/performance-monitoring.yaml

# Deploy backup CronJobs
kubectl apply -f k8s/backup-cronjob.yaml

# Verify deployments
kubectl get pods
kubectl get services
kubectl get hpa
```

## 4. Load Balancer & Ingress

### Option A: LoadBalancer Service (Simple)

```yaml
# frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 80
  selector:
    app: frontend
```

```bash
# Apply and get external IP
kubectl apply -f k8s/frontend-service.yaml
kubectl get service frontend -w
# Wait for EXTERNAL-IP to be assigned
```

### Option B: GKE Ingress with SSL (Recommended)

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: "gce"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  rules:
  - host: api.bilisimvadisi.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3000
  - host: bilisimvadisi.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  tls:
  - hosts:
    - api.bilisimvadisi.com
    - bilisimvadisi.com
    secretName: app-tls
```

## 5. Monitoring with Google Cloud

### Enable Cloud Monitoring

```bash
# Enable APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Metrics will be automatically collected
# View in: Cloud Console → Monitoring → Dashboards
```

### Custom Metrics Export

```bash
# Create service account for Prometheus
gcloud iam service-accounts create prometheus-sa

# Grant monitoring permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:prometheus-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/monitoring.metricWriter"
```

## 6. Persistent Storage

### Create PVC for backups

```yaml
# backup-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: backup-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: standard-rwo
```

```bash
kubectl apply -f k8s/backup-pvc.yaml
```

## 7. CI/CD Pipeline

CD workflow automatically deploys when pushing to `main` branch:

1. **Build** → Docker images (backend, frontend)
2. **Push** → Docker Hub with version tags
3. **Deploy** → GKE cluster
4. **Verify** → Rollout status check

### Manual deployment

```bash
# Update image
kubectl set image deployment/backend backend=erendemirer1/bilisim-vadisi-backend:v1.2.3

# Check rollout
kubectl rollout status deployment/backend

# Rollback if needed
kubectl rollout undo deployment/backend
```

## 8. Scaling

### Manual scaling

```bash
kubectl scale deployment backend --replicas=5
kubectl scale deployment frontend --replicas=3
```

### Auto-scaling (HPA already configured)

```bash
# Check HPA status
kubectl get hpa
kubectl describe hpa backend-hpa

# Test load
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh
# Inside pod:
while sleep 0.01; do wget -q -O- http://backend:3000/health; done
```

## 9. Cost Optimization

### Use Autopilot (optional)

```bash
# Create Autopilot cluster (managed, cost-effective)
gcloud container clusters create-auto bilisim-vadisi-autopilot \
  --region=europe-west1
```

### Node Pool Management

```bash
# Add spot instance node pool
gcloud container node-pools create spot-pool \
  --cluster=bilisim-vadisi-cluster \
  --zone=europe-west1-b \
  --spot \
  --num-nodes=2 \
  --machine-type=e2-medium
```

## 10. Cleanup

```bash
# Delete cluster
gcloud container clusters delete bilisim-vadisi-cluster --zone=europe-west1-b

# Delete service account
gcloud iam service-accounts delete github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Delete keys
rm github-sa-key.json
```

## Common Commands

```bash
# View logs
kubectl logs -f deployment/backend
kubectl logs -f deployment/frontend

# Port forward for testing
kubectl port-forward service/backend 3000:3000
kubectl port-forward service/frontend 8080:80

# Exec into pod
kubectl exec -it deployment/backend -- /bin/sh

# View events
kubectl get events --sort-by='.lastTimestamp'

# Resource usage
kubectl top nodes
kubectl top pods
```

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Service not accessible

```bash
kubectl get endpoints
kubectl describe service <service-name>
```

### HPA not scaling

```bash
# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml
kubectl top nodes
```

### Backup jobs failing

```bash
kubectl get cronjobs
kubectl get jobs
kubectl logs job/<job-name>
```

## Security Best Practices

1. **Secrets Management**: Use Google Secret Manager
2. **Network Policies**: Enable GKE Dataplane V2
3. **Pod Security**: Enable Pod Security Admission
4. **RBAC**: Least privilege access
5. **Image Scanning**: Enable Container Analysis API

```bash
# Enable Workload Identity (recommended)
gcloud container clusters update bilisim-vadisi-cluster \
  --zone=europe-west1-b \
  --workload-pool=YOUR_PROJECT_ID.svc.id.goog
```
