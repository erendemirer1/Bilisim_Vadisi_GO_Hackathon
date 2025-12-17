#!/bin/bash
# Monitoring Stack Test Script

set -e

echo "📊 Testing Monitoring Stack..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check Redis deployment
echo "🔍 Step 1: Checking Redis deployment..."
if kubectl get statefulset redis &>/dev/null; then
    echo -e "${GREEN}✅ Redis StatefulSet exists${NC}"
    kubectl get pods -l app=redis
    
    # Check Redis is ready
    if kubectl wait --for=condition=ready pod -l app=redis --timeout=30s 2>/dev/null; then
        echo -e "${GREEN}✅ Redis is ready${NC}"
    else
        echo -e "${YELLOW}⚠️ Redis pod not ready yet${NC}"
    fi
else
    echo -e "${RED}❌ Redis StatefulSet not found${NC}"
    echo "   Deploy with: kubectl apply -f k8s/redis-deployment.yaml"
    exit 1
fi

echo ""

# 2. Check Redis metrics service
echo "📊 Step 2: Checking Redis metrics service..."
if kubectl get svc redis-metrics &>/dev/null; then
    echo -e "${GREEN}✅ redis-metrics service exists${NC}"
    
    # Test Redis exporter
    echo "Testing Redis exporter metrics..."
    kubectl port-forward svc/redis-metrics 9121:9121 &>/dev/null &
    PF_PID=$!
    sleep 2
    
    if curl -s http://localhost:9121/metrics | head -5; then
        echo -e "${GREEN}✅ Redis exporter responding${NC}"
    else
        echo -e "${YELLOW}⚠️ Redis exporter not accessible${NC}"
    fi
    
    kill $PF_PID 2>/dev/null || true
else
    echo -e "${RED}❌ redis-metrics service not found${NC}"
fi

echo ""

# 3. Check Lock Monitoring
echo "🔐 Step 3: Checking lock monitoring..."
if kubectl get deployment lock-monitor &>/dev/null; then
    echo -e "${GREEN}✅ Lock monitor deployment exists${NC}"
    kubectl get pods -l app=lock-monitor
    
    # Check if ready
    if kubectl wait --for=condition=ready pod -l app=lock-monitor --timeout=30s 2>/dev/null; then
        echo -e "${GREEN}✅ Lock monitor is ready${NC}"
        
        # Test metrics endpoint
        echo "Testing lock monitor metrics..."
        kubectl port-forward svc/lock-monitor 9150:9150 &>/dev/null &
        PF_PID=$!
        sleep 2
        
        if curl -s http://localhost:9150/metrics; then
            echo -e "${GREEN}✅ Lock monitor metrics responding${NC}"
        else
            echo -e "${YELLOW}⚠️ Lock monitor metrics not accessible${NC}"
        fi
        
        kill $PF_PID 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠️ Lock monitor pod not ready yet${NC}"
    fi
else
    echo -e "${RED}❌ Lock monitor deployment not found${NC}"
    echo "   Deploy with: kubectl apply -f k8s/lock-monitoring.yaml"
fi

echo ""

# 4. Check Prometheus (if using docker-compose)
echo "📈 Step 4: Checking Prometheus..."
if command -v docker-compose &>/dev/null; then
    if docker ps | grep -q hack-prometheus; then
        echo -e "${GREEN}✅ Prometheus container running${NC}"
        
        # Test Prometheus API
        if curl -s http://localhost:9090/api/v1/status/config | jq -r '.status' 2>/dev/null | grep -q "success"; then
            echo -e "${GREEN}✅ Prometheus API responding${NC}"
            
            # Check targets
            echo ""
            echo -e "${BLUE}Prometheus Targets:${NC}"
            curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | "\(.labels.job): \(.health)"' 2>/dev/null || echo "Could not fetch targets"
        else
            echo -e "${YELLOW}⚠️ Prometheus API not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Prometheus not running (use docker-compose up -d)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ docker-compose not available, skipping Prometheus check${NC}"
fi

echo ""

# 5. Check Grafana (if using docker-compose)
echo "📊 Step 5: Checking Grafana..."
if command -v docker-compose &>/dev/null; then
    if docker ps | grep -q hack-grafana; then
        echo -e "${GREEN}✅ Grafana container running${NC}"
        echo "   Access: http://localhost:3001 (admin/admin123)"
        
        # Test Grafana API
        if curl -s -u admin:admin123 http://localhost:3001/api/health | jq -r '.database' 2>/dev/null | grep -q "ok"; then
            echo -e "${GREEN}✅ Grafana API responding${NC}"
            
            # Check datasources
            echo ""
            echo -e "${BLUE}Grafana Datasources:${NC}"
            curl -s -u admin:admin123 http://localhost:3001/api/datasources | jq -r '.[] | "\(.name): \(.type)"' 2>/dev/null || echo "Could not fetch datasources"
        else
            echo -e "${YELLOW}⚠️ Grafana API not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Grafana not running (use docker-compose up -d)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ docker-compose not available, skipping Grafana check${NC}"
fi

echo ""

# 6. Test Redis connection from within cluster
echo "🔌 Step 6: Testing Redis connectivity..."
cat <<EOF | kubectl apply -f - >/dev/null 2>&1
apiVersion: v1
kind: Pod
metadata:
  name: redis-test
spec:
  containers:
  - name: redis
    image: redis:7-alpine
    command: ['sh', '-c', 'sleep 300']
  restartPolicy: Never
EOF

echo "Waiting for test pod..."
kubectl wait --for=condition=Ready pod/redis-test --timeout=30s 2>/dev/null || true

if kubectl exec redis-test -- redis-cli -h redis ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis connectivity from pod: OK${NC}"
    
    # Test SET/GET
    kubectl exec redis-test -- redis-cli -h redis SET test-key "monitoring-test" >/dev/null 2>&1
    VALUE=$(kubectl exec redis-test -- redis-cli -h redis GET test-key 2>/dev/null)
    if [ "$VALUE" = "monitoring-test" ]; then
        echo -e "${GREEN}✅ Redis SET/GET: OK${NC}"
    fi
    kubectl exec redis-test -- redis-cli -h redis DEL test-key >/dev/null 2>&1
else
    echo -e "${RED}❌ Redis connectivity failed${NC}"
fi

kubectl delete pod redis-test --ignore-not-found=true >/dev/null 2>&1

echo ""

# 7. Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Monitoring Stack Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Kubernetes Resources:"
echo "  - Redis StatefulSet"
echo "  - Redis Metrics Service (port 9121)"
echo "  - Lock Monitor Deployment"
echo "  - Lock Monitor Metrics (port 9150)"
echo ""
echo "Docker Compose (Local Dev):"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001 (admin/admin123)"
echo "  - Redis: localhost:6379"
echo ""
echo "Metrics Endpoints:"
echo "  - Backend: http://localhost:3000/metrics"
echo "  - Redis: http://localhost:9121/metrics"
echo "  - Lock Monitor: http://localhost:9150/metrics"
echo ""
echo "Useful Commands:"
echo "  kubectl get pods -l app=redis"
echo "  kubectl logs -l app=lock-monitor -c monitor"
echo "  kubectl port-forward svc/lock-monitor 9150:9150"
echo "  curl http://localhost:9150/metrics"
echo ""
echo -e "${GREEN}✅ Monitoring test completed!${NC}"
