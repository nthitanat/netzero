#!/bin/bash

# MySQL Diagnostic Script for Error 168
# This script checks various MySQL parameters that could cause Error 168

echo "🔍 MySQL Error 168 Diagnostic Script"
echo "====================================="
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

echo "📊 2. Checking MySQL data directory size..."
echo "-------------------------------------------"
sudo docker exec $CONTAINER_NAME du -sh /var/lib/mysql/ 2>/dev/null || echo "⚠️  Could not check MySQL data directory (might be on host)"
echo ""

echo "📊 3. Checking number of tables in database..."
echo "----------------------------------------------"
TABLE_COUNT=$(sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='$DB_NAME';" -s -N 2>/dev/null)
echo "Current tables in $DB_NAME: $TABLE_COUNT"
echo ""

echo "📊 4. Checking InnoDB status..."
echo "-------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'innodb_file_per_table';" 2>/dev/null
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'innodb_data_file_path';" 2>/dev/null
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'innodb_autoextend_increment';" 2>/dev/null
echo ""

echo "📊 5. Checking InnoDB tablespace info..."
echo "----------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SELECT name, file_size/1024/1024 as 'Size_MB', allocated_size/1024/1024 as 'Allocated_MB' FROM information_schema.innodb_sys_tablespaces WHERE name='$DB_NAME/surveys' OR name LIKE 'innodb%';" 2>/dev/null
echo ""

echo "📊 6. Checking open file limits..."
echo "----------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'open_files_limit';" 2>/dev/null
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW GLOBAL STATUS LIKE 'Open_files';" 2>/dev/null
echo ""

echo "📊 7. Checking table limits..."
echo "------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW VARIABLES LIKE 'table_open_cache';" 2>/dev/null
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW GLOBAL STATUS LIKE 'Open_tables';" 2>/dev/null
echo ""

echo "📊 8. Checking MySQL error log (last 20 lines)..."
echo "-------------------------------------------------"
sudo docker exec $CONTAINER_NAME tail -20 /var/log/mysql/error.log 2>/dev/null || echo "⚠️  Could not access MySQL error log"
echo ""

echo "📊 9. Checking existing tables in database..."
echo "---------------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW TABLES;" 2>/dev/null
echo ""

echo "📊 10. Checking if surveys table exists (corrupted)..."
echo "------------------------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW CREATE TABLE surveys;" 2>/dev/null && echo "✅ surveys table exists" || echo "❌ surveys table does not exist"
echo ""

echo "📊 11. Checking MySQL version and engine..."
echo "-------------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SELECT VERSION();" 2>/dev/null
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW ENGINES;" 2>/dev/null
echo ""

echo "📊 12. Checking for InnoDB errors..."
echo "------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SHOW ENGINE INNODB STATUS\G" 2>/dev/null | grep -A 20 "LATEST DETECTED DEADLOCK\|LATEST FOREIGN KEY ERROR"
echo ""

echo "📊 13. Attempting to create surveys table manually..."
echo "----------------------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
CREATE TABLE IF NOT EXISTS surveys_test (
  survey_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Test table creation succeeded - cleaning up..."
    sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "DROP TABLE IF EXISTS surveys_test;" 2>/dev/null
else
    echo "❌ Test table creation failed with same error"
fi
echo ""

echo "📊 14. Checking temp directory space..."
echo "---------------------------------------"
sudo docker exec $CONTAINER_NAME df -h /tmp 2>/dev/null || df -h /tmp
echo ""

echo "✅ Diagnostic complete!"
echo ""
echo "🔍 Common solutions for Error 168:"
echo "1. Disk space full - Run: docker system prune -af"
echo "2. InnoDB tablespace full - Increase innodb_data_file_path"
echo "3. Too many tables - Check table_open_cache setting"
echo "4. Corrupted InnoDB - May need to repair or recreate database"
echo "5. File permissions - Check MySQL data directory permissions"
