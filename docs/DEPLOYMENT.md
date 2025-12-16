# Deployment Guide

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/erendemirer1/Bilisim_Vadisi_Hackathon.git
cd Bilisim_Vadisi_Hackathon

# Install backend dependencies
cd backend
npm install

# Run backend
npm run dev

# In another terminal, serve frontend
cd ../frontend
python3 -m http.server 8080
# or use any static file server
```

## Docker Deployment

### Using Docker Compose (Recommended for Local)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build
```

### Manual Docker Commands

```bash
# Build images
docker build -t backend:latest ./backend
docker build -t frontend:latest ./frontend

# Run containers
docker run -d -p 3000:3000 --name backend backend:latest
docker run -d -p 8080:80 --name frontend frontend:latest

# View logs
docker logs -f backend
docker logs -f frontend

# Stop and remove
docker stop backend frontend
docker rm backend frontend
```

## Kubernetes Deployment

### Prerequisites

- kubectl installed and configured
- Kubernetes cluster (local: minikube, kind, or cloud: GKE, EKS, AKS)
- Docker images pushed to registry

### Step-by-Step Deployment

#### 1. Prepare Images

```bash
# Build with version tag
docker build -t yourusername/backend:v1.0.0 ./backend
docker build -t yourusername/frontend:v1.0.0 ./frontend

# Push to Docker Hub
docker push yourusername/backend:v1.0.0
docker push yourusername/frontend:v1.0.0
```

#### 2. Update Kubernetes Manifests

Edit image references in:
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`

```yaml
image: yourusername/backend:v1.0.0
```

#### 3. Create ConfigMap and Secrets

```bash
# Review and edit secrets first!
vim k8s/secret.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

#### 4. Deploy Services

```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Enable autoscaling
kubectl apply -f k8s/hpa.yaml
```

#### 5. Verify Deployment

```bash
# Check pods
kubectl get pods
kubectl describe pod <pod-name>

# Check services
kubectl get svc

# Check HPA
kubectl get hpa

# View logs
kubectl logs -f deployment/backend
kubectl logs -f deployment/frontend
```

#### 6. Access Application

```bash
# Get NodePort
kubectl get svc frontend

# Access via NodePort (local cluster)
# http://<node-ip>:<nodeport>

# Port forward for testing
kubectl port-forward svc/frontend 8080:80
kubectl port-forward svc/backend 3000:3000
```

### Local Kubernetes (Minikube)

```bash
# Start minikube
minikube start

# Enable metrics server (for HPA)
minikube addons enable metrics-server

# Deploy application
kubectl apply -f k8s/

# Get URL
minikube service frontend --url

# Stop minikube
minikube stop
```

## CI/CD Pipeline

### GitHub Actions

The project uses GitHub Actions for CI/CD:

#### CI Pipeline (`.github/workflows/ci.yml`)

Triggers on:
- Push to `dev` branch
- Pull requests to `dev`

Steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run linters
5. Run tests

#### CD Pipeline (`.github/workflows/cd.yml`)

Triggers:
- Manual dispatch (`workflow_dispatch`)

Steps:
1. Build Docker images
2. Push to Docker Hub

### Required Secrets

Configure in GitHub Settings → Secrets:

```
DOCKER_USERNAME     # Docker Hub username
DOCKER_PASSWORD     # Docker Hub password
```

### Running Workflows

```bash
# Trigger manually
# Go to Actions tab → CD → Run workflow
```

## Troubleshooting

### Common Issues

#### 1. Pods in CrashLoopBackOff

```bash
# Check logs
kubectl logs <pod-name>

# Describe pod
kubectl describe pod <pod-name>

# Common causes:
# - Image pull errors
# - Missing environment variables
# - Application crashes
```

#### 2. ImagePullBackOff

```bash
# Check image name and tag
kubectl describe pod <pod-name> | grep Image

# Verify image exists in registry
docker pull yourusername/backend:v1.0.0

# Check image pull secrets
kubectl get secrets
```

#### 3. Service Not Accessible

```bash
# Check service
kubectl get svc
kubectl describe svc frontend

# Check endpoints
kubectl get endpoints

# Port forward for debugging
kubectl port-forward svc/frontend 8080:80
```

#### 4. HPA Not Scaling

```bash
# Check HPA status
kubectl get hpa
kubectl describe hpa backend-hpa

# Check metrics server
kubectl top nodes
kubectl top pods

# If metrics unavailable, install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### 5. ConfigMap/Secret Not Applied

```bash
# Verify ConfigMap
kubectl get configmap
kubectl describe configmap backend-config

# Verify Secret
kubectl get secrets
kubectl describe secret backend-secret

# Restart pods to pick up changes
kubectl rollout restart deployment/backend
```

### Debugging Commands

```bash
# Get all resources
kubectl get all

# Exec into pod
kubectl exec -it <pod-name> -- sh

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods
kubectl top nodes

# View pod definition
kubectl get pod <pod-name> -o yaml
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/backend

# Rollback to previous version
kubectl rollout undo deployment/backend

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2
```

## Production Checklist

Before deploying to production:

- [ ] Update all secrets with secure values
- [ ] Set appropriate resource limits
- [ ] Configure persistent storage if needed
- [ ] Set up monitoring and logging
- [ ] Configure ingress/load balancer
- [ ] Enable HTTPS/TLS
- [ ] Set up backup strategy
- [ ] Configure alerting
- [ ] Document runbooks
- [ ] Test disaster recovery

## Monitoring

```bash
# Watch pod status
kubectl get pods -w

# Monitor HPA
kubectl get hpa -w

# Stream logs
kubectl logs -f deployment/backend --all-containers=true

# Check resource usage
watch kubectl top pods
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=5

# Scale frontend
kubectl scale deployment/frontend --replicas=3
```

### Autoscaling

HPA automatically scales based on CPU/memory. Configure in `k8s/hpa.yaml`.

## Updates and Rollouts

```bash
# Update image
kubectl set image deployment/backend backend=yourusername/backend:v1.1.0

# Check rollout status
kubectl rollout status deployment/backend

# Pause rollout
kubectl rollout pause deployment/backend

# Resume rollout
kubectl rollout resume deployment/backend
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Or delete individually
kubectl delete deployment backend frontend
kubectl delete svc backend frontend
kubectl delete hpa backend-hpa frontend-hpa
kubectl delete configmap backend-config frontend-config
kubectl delete secret backend-secret
```
