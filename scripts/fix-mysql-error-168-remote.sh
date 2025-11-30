#!/bin/bash

# Quick Fix Script for MySQL Error 168 (Remote version - automatic)
# Attempts to fix the issue without interactive prompts

echo "🔧 MySQL Error 168 Fix Script (Remote)"
echo "======================================="
echo ""

DB_USER="netzeroadmin"
DB_PASS="x8A3dyDnpeN3KLDp"
DB_NAME="netzero"
CONTAINER_NAME="netzero-server"

echo "🧹 Step 1: Cleaning up Docker system..."
echo "---------------------------------------"
docker system prune -f
echo "✅ Docker cleanup complete"
echo ""

echo "🔍 Step 2: Checking for orphaned surveys table..."
echo "--------------------------------------------------"
SURVEYS_EXISTS=$(docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW TABLES LIKE 'surveys';" -s -N 2>/dev/null)
if [ ! -z "$SURVEYS_EXISTS" ]; then
    echo "⚠️  surveys table exists but might be corrupted - dropping..."
    docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "DROP TABLE IF EXISTS answers, responses, questions, surveys;" 2>&1
    echo "✅ Dropped survey-related tables"
else
    echo "✅ No surveys table found"
fi
echo ""

echo "🔄 Step 3: Restarting MySQL container..."
echo "----------------------------------------"
docker restart $CONTAINER_NAME
echo "⏳ Waiting for container to start..."
sleep 10
echo "✅ Container restarted"
echo ""

echo "🧪 Step 4: Creating survey tables..."
echo "------------------------------------"

# Create surveys table
echo "Creating surveys table..."
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
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
    
    # Create questions table
    echo "Creating questions table..."
    docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
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
    echo "Creating responses table..."
    docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
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
    echo "Creating answers table..."
    docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "
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
    echo ""
    echo "📋 Verifying tables..."
    docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -D$DB_NAME -e "SHOW TABLES;" 2>/dev/null
    echo ""
    echo "✅ Fix complete! You can now run the survey initialization script."
    
else
    echo "❌ Still unable to create surveys table"
    echo ""
    echo "🔍 Checking detailed error information..."
    docker logs $CONTAINER_NAME --tail 50 2>&1 | grep -i "error" | tail -10
    echo ""
    echo "💡 Possible solutions:"
    echo "   1. Check MySQL container health: docker ps -a"
    echo "   2. Check MySQL logs: docker logs netzero-server --tail 100"
    echo "   3. Try restarting all containers: cd /www/netzero-deploy && docker compose restart"
    echo "   4. If all else fails, recreate containers: docker compose down && docker compose up -d"
    exit 1
fi

echo ""
echo "✅ Fix script complete!"
