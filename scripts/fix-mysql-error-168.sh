#!/bin/bash

# Quick Fix Script for MySQL Error 168
# Attempts common solutions

echo "🔧 MySQL Error 168 Fix Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DB_USER="netzeroadmin"
DB_PASS="x8A3dyDnpeN3KLDp"
DB_NAME="netzero"
CONTAINER_NAME="netzero-server"

echo "⚠️  This script will attempt to fix MySQL Error 168"
echo "   by trying various solutions."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "🧹 Step 1: Clean up Docker system..."
echo "------------------------------------"
sudo docker system df
echo ""
read -p "Run docker system prune? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo docker system prune -f
    echo "✅ Docker cleanup complete"
fi

echo ""
echo "🔍 Step 2: Check for orphaned surveys table..."
echo "----------------------------------------------"
SURVEYS_EXISTS=$(sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW TABLES LIKE 'surveys';" -s -N 2>/dev/null)
if [ ! -z "$SURVEYS_EXISTS" ]; then
    echo "⚠️  surveys table exists but might be corrupted"
    read -p "Drop and recreate surveys table? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "DROP TABLE IF EXISTS surveys;" 2>&1
        echo "✅ Dropped surveys table"
    fi
else
    echo "✅ No surveys table found"
fi

echo ""
echo "🔍 Step 3: Check MySQL InnoDB status..."
echo "---------------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SET GLOBAL innodb_fast_shutdown=0;" 2>/dev/null
echo "✅ Set InnoDB fast shutdown to 0"

echo ""
echo "🔄 Step 4: Restart MySQL container..."
echo "-------------------------------------"
read -p "Restart netzero-server container? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo docker restart $CONTAINER_NAME
    echo "⏳ Waiting for container to start..."
    sleep 10
    echo "✅ Container restarted"
fi

echo ""
echo "🧪 Step 5: Test table creation..."
echo "---------------------------------"
sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
CREATE TABLE IF NOT EXISTS surveys (
  survey_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ surveys table created successfully!"
    echo ""
    echo "📋 Creating related tables..."
    
    # Create questions table
    sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
    CREATE TABLE IF NOT EXISTS questions (
      question_id INT AUTO_INCREMENT PRIMARY KEY,
      survey_id INT NOT NULL,
      question_text TEXT NOT NULL,
      question_type ENUM('text', 'multiple_choice', 'yes_no', 'rating', 'checkbox') DEFAULT 'text',
      order_in_survey INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>&1
    
    echo "✅ questions table created"
    
    # Create responses table
    sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
    CREATE TABLE IF NOT EXISTS responses (
      response_id INT AUTO_INCREMENT PRIMARY KEY,
      survey_id INT NOT NULL,
      user_id INT NULL,
      respondent_id VARCHAR(255) NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>&1
    
    echo "✅ responses table created"
    
    # Create answers table
    sudo docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
    CREATE TABLE IF NOT EXISTS answers (
      answer_id INT AUTO_INCREMENT PRIMARY KEY,
      response_id INT NOT NULL,
      question_id INT NOT NULL,
      answer_text TEXT NULL,
      answer_choice_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (response_id) REFERENCES responses(response_id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 2>&1
    
    echo "✅ answers table created"
    echo ""
    echo "🎉 All survey tables created successfully!"
else
    echo "❌ Still unable to create surveys table"
    echo ""
    echo "🔍 Please check the diagnostic output above for more details"
    echo "   You may need to:"
    echo "   1. Check disk space: df -h"
    echo "   2. Check MySQL logs: sudo docker logs netzero-server --tail 100"
    echo "   3. Restart the entire stack: cd /www/netzero-deploy && sudo docker compose down && sudo docker compose up -d"
fi

echo ""
echo "✅ Fix script complete!"
