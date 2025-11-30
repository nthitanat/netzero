#!/bin/bash

# MySQL Diagnostic Script for Error 168 (Remote version - no sudo prompts)
# This script checks various MySQL parameters that could cause Error 168

echo "🔍 MySQL Error 168 Diagnostic Script (Remote)"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Connection details
DB_USER="netzeroadmin"
DB_PASS="x8A3dyDnpeN3KLDp"
DB_NAME="netzero"
CONTAINER_NAME="netzero-server"

echo "📊 1. Checking disk space..."
echo "----------------------------"
df -h | grep -E "Filesystem|/var|/$"
echo ""

echo "📊 2. Checking Docker containers status..."
echo "------------------------------------------"
docker ps -a | grep netzero || echo "⚠️  Docker permission denied - trying without sudo"
echo ""

echo "📊 3. Checking number of tables in database..."
echo "----------------------------------------------"
TABLE_COUNT=$(docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='$DB_NAME';" -s -N 2>/dev/null)
if [ -z "$TABLE_COUNT" ]; then
    echo "❌ Could not connect to MySQL - checking container status..."
    docker ps | grep $CONTAINER_NAME
else
    echo "Current tables in $DB_NAME: $TABLE_COUNT"
fi
echo ""

echo "📊 4. Checking existing tables in database..."
echo "---------------------------------------------"
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW TABLES;" 2>/dev/null || echo "❌ Could not list tables"
echo ""

echo "📊 5. Checking if surveys table exists..."
echo "-----------------------------------------"
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW CREATE TABLE surveys;" 2>/dev/null && echo "✅ surveys table exists" || echo "❌ surveys table does not exist"
echo ""

echo "📊 6. Checking MySQL version and storage engine..."
echo "--------------------------------------------------"
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SELECT VERSION();" 2>/dev/null
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SELECT @@default_storage_engine;" 2>/dev/null
echo ""

echo "📊 7. Checking InnoDB status..."
echo "-------------------------------"
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'innodb_file_per_table';" 2>/dev/null
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'innodb_data_file_path';" 2>/dev/null
echo ""

echo "📊 8. Checking open file limits..."
echo "----------------------------------"
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'open_files_limit';" 2>/dev/null
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW GLOBAL STATUS LIKE 'Open_files';" 2>/dev/null
echo ""

echo "📊 9. Attempting to create surveys table manually..."
echo "----------------------------------------------------"
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
CREATE TABLE IF NOT EXISTS surveys_test (
  survey_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Test table creation succeeded - cleaning up..."
    docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "DROP TABLE IF EXISTS surveys_test;" 2>/dev/null
else
    echo "❌ Test table creation failed"
fi
echo ""

echo "📊 10. Checking recent MySQL errors from container logs..."
echo "----------------------------------------------------------"
docker logs $CONTAINER_NAME --tail 50 2>&1 | grep -i "error\|survey" | tail -20
echo ""

echo "📊 11. Checking temp directory space..."
echo "---------------------------------------"
df -h /tmp
echo ""

echo "✅ Diagnostic complete!"
echo ""
echo "💡 Next steps:"
echo "1. If Docker permission denied: Add user to docker group or use 'sudo bash diagnose-mysql.sh'"
echo "2. If table creation failed: Run 'bash fix-mysql-error-168-remote.sh'"
echo "3. Check container logs: docker logs netzero-server --tail 100"
