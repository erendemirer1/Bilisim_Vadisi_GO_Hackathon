#!/bin/bash
set -e

echo "🚀 GKE Cluster Setup Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
CLUSTER_NAME="hackathon-cluster"
ZONE="europe-west1-b"
MACHINE_TYPE="e2-medium"
NUM_NODES=3

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Cluster Name: $CLUSTER_NAME"
echo "  Zone: $ZONE"
echo "  Machine Type: $MACHINE_TYPE"
echo "  Nodes: $NUM_NODES"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Install it first.${NC}"
    exit 1
fi

# Check if logged in
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No GCP project set. Run: gcloud auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI ready${NC}"
echo ""

# Step 1: Enable required APIs
echo "🔧 Step 1: Enabling required APIs..."
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
echo -e "${GREEN}✅ APIs enabled${NC}"
echo ""

# Step 2: Create GKE cluster
echo "🏗️  Step 2: Creating GKE cluster..."
echo "This will take 5-10 minutes..."

if gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE &>/dev/null; then
    echo -e "${YELLOW}⚠️  Cluster already exists. Skipping creation.${NC}"
else
    gcloud container clusters create $CLUSTER_NAME \
      --zone=$ZONE \
      --num-nodes=$NUM_NODES \
      --machine-type=$MACHINE_TYPE \
      --disk-size=20GB \
      --enable-autoscaling \
      --min-nodes=2 \
      --max-nodes=5 \
      --enable-autorepair \
      --enable-autoupgrade \
      --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
      --workload-pool=$PROJECT_ID.svc.id.goog
    
    echo -e "${GREEN}✅ Cluster created${NC}"
fi
echo ""

# Step 3: Get credentials
echo "🔑 Step 3: Configuring kubectl..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE
echo -e "${GREEN}✅ kubectl configured${NC}"
echo ""

# Step 4: Create namespace (optional)
echo "📦 Step 4: Setting up Kubernetes resources..."
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✅ Namespace ready${NC}"
echo ""

# Step 5: Deploy ConfigMap and Secrets
echo "🔐 Step 5: Deploying ConfigMap and Secrets..."

# Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# Create Secret (you'll need to update with real values)
echo -e "${YELLOW}⚠️  Make sure to update k8s/secret.yaml with real values${NC}"
kubectl apply -f k8s/secret.yaml

echo -e "${GREEN}✅ ConfigMap and Secrets deployed${NC}"
echo ""

# Step 6: Deploy Redis
echo "📊 Step 6: Deploying Redis..."
kubectl apply -f k8s/redis-deployment.yaml
echo -e "${GREEN}✅ Redis deployed${NC}"
echo ""

# Step 7: Deploy Backend
echo "🔧 Step 7: Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
echo -e "${GREEN}✅ Backend deployed${NC}"
echo ""

# Step 8: Deploy Frontend
echo "🎨 Step 8: Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
echo -e "${GREEN}✅ Frontend deployed${NC}"
echo ""

# Step 9: Deploy HPA
echo "📈 Step 9: Deploying Horizontal Pod Autoscaler..."
kubectl apply -f k8s/hpa.yaml
echo -e "${GREEN}✅ HPA deployed${NC}"
echo ""

# Step 10: Deploy Monitoring
echo "📊 Step 10: Deploying Monitoring..."
kubectl apply -f k8s/lock-monitoring.yaml
kubectl apply -f k8s/performance-monitoring.yaml
echo -e "${GREEN}✅ Monitoring deployed${NC}"
echo ""

# Step 11: Deploy Backup CronJobs
echo "💾 Step 11: Deploying Backup CronJobs..."
kubectl apply -f k8s/backup-cronjob.yaml
echo -e "${GREEN}✅ Backup CronJobs deployed${NC}"
echo ""

# Step 12: Wait for deployments
echo "⏳ Step 12: Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/backend || true
kubectl wait --for=condition=available --timeout=300s deployment/frontend || true
kubectl wait --for=condition=available --timeout=300s deployment/lock-monitor || true
echo ""

# Step 13: Get status
echo "📊 Deployment Status:"
echo "===================="
kubectl get pods
echo ""
kubectl get services
echo ""
kubectl get hpa
echo ""

# Step 14: Get external IPs
echo "🌐 External Access:"
echo "===================="
FRONTEND_IP=$(kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")
BACKEND_IP=$(kubectl get service backend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")

echo "Frontend: http://$FRONTEND_IP"
echo "Backend: http://$BACKEND_IP:3000"
echo ""

if [ "$FRONTEND_IP" == "Pending..." ]; then
    echo -e "${YELLOW}⏳ External IPs are being assigned. Check again in 2-3 minutes:${NC}"
    echo "   kubectl get services -w"
fi
echo ""

# Step 15: Print useful commands
echo "🔍 Useful Commands:"
echo "===================="
echo "# View logs"
echo "kubectl logs -f deployment/backend"
echo "kubectl logs -f deployment/frontend"
echo ""
echo "# Scale deployment"
echo "kubectl scale deployment backend --replicas=5"
echo ""
echo "# Port forward for local testing"
echo "kubectl port-forward service/backend 3000:3000"
echo "kubectl port-forward service/frontend 8080:80"
echo ""
echo "# Check HPA status"
echo "kubectl get hpa"
echo "kubectl describe hpa backend-hpa"
echo ""
echo "# View monitoring"
echo "kubectl port-forward service/lock-monitor 9150:9150"
echo "# Then visit: http://localhost:9150/metrics"
echo ""

echo -e "${GREEN}✅ GKE Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update k8s/secret.yaml with real DB_PASSWORD and JWT_SECRET"
echo "2. Update frontend/backend services to LoadBalancer type if needed"
echo "3. Push to main branch to trigger automatic deployment"
echo "4. Setup domain and SSL certificate (optional)"
