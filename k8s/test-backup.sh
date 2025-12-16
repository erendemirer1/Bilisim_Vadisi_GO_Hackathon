#!/bin/bash
# Backup CronJob Manual Test Script

set -e

echo "🧪 Testing Backup CronJobs..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if CronJobs are deployed
echo "📋 Step 1: Checking CronJob definitions..."
if kubectl get cronjob redis-backup &>/dev/null; then
    echo -e "${GREEN}✅ redis-backup CronJob exists${NC}"
else
    echo -e "${RED}❌ redis-backup CronJob not found${NC}"
    echo "   Deploy with: kubectl apply -f k8s/backup-cronjob.yaml"
    exit 1
fi

if kubectl get cronjob db-backup &>/dev/null; then
    echo -e "${GREEN}✅ db-backup CronJob exists${NC}"
else
    echo -e "${RED}❌ db-backup CronJob not found${NC}"
    exit 1
fi

echo ""

# 2. Check backup PVC
echo "💾 Step 2: Checking backup storage..."
if kubectl get pvc backup-storage &>/dev/null; then
    echo -e "${GREEN}✅ backup-storage PVC exists${NC}"
    kubectl get pvc backup-storage
else
    echo -e "${RED}❌ backup-storage PVC not found${NC}"
    exit 1
fi

echo ""

# 3. Manual trigger - Redis backup
echo "🔄 Step 3: Manually triggering Redis backup..."
kubectl create job --from=cronjob/redis-backup redis-backup-manual-test || echo "Job already exists, deleting..."
kubectl delete job redis-backup-manual-test --ignore-not-found=true
sleep 2
kubectl create job --from=cronjob/redis-backup redis-backup-manual-test

echo "⏳ Waiting for Redis backup job to complete (timeout: 60s)..."
kubectl wait --for=condition=complete job/redis-backup-manual-test --timeout=60s || {
    echo -e "${YELLOW}⚠️ Job didn't complete in 60s, checking status...${NC}"
    kubectl get job redis-backup-manual-test
    kubectl get pods -l job-name=redis-backup-manual-test
}

# Show logs
echo ""
echo "📜 Redis Backup Job Logs:"
echo "------------------------"
kubectl logs job/redis-backup-manual-test || echo "No logs available"

echo ""

# 4. Manual trigger - DB backup (only if backend PVC exists)
echo "🔄 Step 4: Checking if backend PVC exists for DB backup..."
if kubectl get pvc backend-pvc &>/dev/null; then
    echo -e "${GREEN}✅ backend-pvc exists, triggering DB backup...${NC}"
    
    kubectl delete job db-backup-manual-test --ignore-not-found=true
    sleep 2
    kubectl create job --from=cronjob/db-backup db-backup-manual-test
    
    echo "⏳ Waiting for DB backup job to complete (timeout: 60s)..."
    kubectl wait --for=condition=complete job/db-backup-manual-test --timeout=60s || {
        echo -e "${YELLOW}⚠️ Job didn't complete in 60s, checking status...${NC}"
        kubectl get job db-backup-manual-test
        kubectl get pods -l job-name=db-backup-manual-test
    }
    
    # Show logs
    echo ""
    echo "📜 DB Backup Job Logs:"
    echo "----------------------"
    kubectl logs job/db-backup-manual-test || echo "No logs available"
else
    echo -e "${YELLOW}⚠️ backend-pvc not found, skipping DB backup test${NC}"
    echo "   This is normal if backend hasn't created database yet"
fi

echo ""

# 5. Check backup files
echo "📂 Step 5: Checking backup files..."
echo "Creating temporary pod to inspect backup storage..."

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: backup-inspector
spec:
  containers:
  - name: inspector
    image: alpine:latest
    command: ['sh', '-c', 'sleep 3600']
    volumeMounts:
    - name: backup
      mountPath: /backup
  volumes:
  - name: backup
    persistentVolumeClaim:
      claimName: backup-storage
  restartPolicy: Never
EOF

echo "⏳ Waiting for inspector pod..."
kubectl wait --for=condition=Ready pod/backup-inspector --timeout=30s

echo ""
echo "📁 Backup files in storage:"
echo "---------------------------"
kubectl exec backup-inspector -- ls -lh /backup/ || echo "No files yet or error accessing"

echo ""
echo "🧹 Cleaning up test resources..."
kubectl delete pod backup-inspector --ignore-not-found=true
kubectl delete job redis-backup-manual-test --ignore-not-found=true
kubectl delete job db-backup-manual-test --ignore-not-found=true

echo ""
echo -e "${GREEN}✅ Backup test completed!${NC}"
echo ""
echo "📅 CronJob Schedules:"
echo "  - Redis backup: Every day at 02:00 (0 2 * * *)"
echo "  - DB backup: Every day at 02:30 (30 2 * * *)"
echo ""
echo "🔍 Monitor CronJobs with:"
echo "  kubectl get cronjobs"
echo "  kubectl get jobs"
echo "  kubectl logs job/<job-name>"
