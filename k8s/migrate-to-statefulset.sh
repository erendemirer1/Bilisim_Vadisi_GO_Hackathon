#!/bin/bash
set -e

echo "🔄 SQLite Database Migration to StatefulSet"
echo "============================================"

# 1. Mevcut database'i backup al
echo "📦 Step 1: Backing up current database..."
kubectl exec deployment/backend -- cat /data/database.sqlite > /tmp/database-backup.sqlite
echo "✅ Backup saved to /tmp/database-backup.sqlite"

# 2. StatefulSet'i deploy et
echo "🚀 Step 2: Deploying StatefulSet..."
kubectl apply -f k8s/backend-statefulset.yaml
echo "⏳ Waiting for StatefulSet to be ready..."
kubectl wait --for=condition=ready pod/backend-0 --timeout=300s

# 3. Database'i yeni pod'a kopyala
echo "📥 Step 3: Copying database to StatefulSet..."
kubectl cp /tmp/database-backup.sqlite backend-0:/data/database.sqlite

# 4. Backend'i restart et (database'i load etmesi için)
echo "🔄 Step 4: Restarting backend to load database..."
kubectl delete pod backend-0
kubectl wait --for=condition=ready pod/backend-0 --timeout=300s

# 5. Eski deployment'ı sil
echo "🗑️  Step 5: Cleaning up old deployment..."
kubectl delete deployment backend
kubectl delete pvc backend-pvc

echo "✅ Migration completed successfully!"
echo ""
echo "📊 Verify:"
echo "  kubectl get statefulset backend"
echo "  kubectl get pvc"
echo "  kubectl logs backend-0"
