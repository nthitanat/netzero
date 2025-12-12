/**
 * Script to insert sample product survey questions
 */

const { executeQuery } = require('../src/config/database');

const sampleQuestions = [
  {
    question_id: 'q1',
    question_text: 'How sustainable is the material sourcing for this product?',
    scoring_criteria: 'Score 10 if materials are fully renewable/recycled with verified certifications, 7-9 for partially sustainable materials, 4-6 for conventional materials with some eco-friendly aspects, 1-3 for materials with significant environmental impact',
    weight: 1.2
  },
  {
    question_id: 'q2',
    question_text: 'What is the carbon footprint of the production process?',
    scoring_criteria: 'Score 10 for carbon-neutral production with renewable energy, 7-9 for low emissions with some offsets, 4-6 for industry-average emissions, 1-3 for high-emission production methods',
    weight: 1.5
  },
  {
    question_id: 'q3',
    question_text: 'How recyclable or biodegradable is the product at end-of-life?',
    scoring_criteria: 'Score 10 if fully biodegradable or 100% recyclable, 7-9 for mostly recyclable with minor exceptions, 4-6 for partially recyclable, 1-3 for minimal recyclability or biodegradability',
    weight: 1.3
  },
  {
    question_id: 'q4',
    question_text: 'Does the supply chain follow fair labor practices?',
    scoring_criteria: 'Score 10 for certified fair trade and verified ethical labor standards, 7-9 for good labor practices with transparency, 4-6 for basic compliance, 1-3 for questionable or unverified practices',
    weight: 1.0
  },
  {
    question_id: 'q5',
    question_text: 'What is the overall environmental impact of the product lifecycle?',
    scoring_criteria: 'Score 10 for net-positive environmental impact, 7-9 for minimal impact, 4-6 for neutral impact, 1-3 for negative environmental impact',
    weight: 1.4
  }
];

async function insertQuestions() {
  try {
    console.log('📝 Inserting survey questions...');
    
    for (const question of sampleQuestions) {
      const sql = `
        INSERT INTO product_survey_questions 
        (question_id, question_text, scoring_criteria, weight, is_active)
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
          question_text = VALUES(question_text),
          scoring_criteria = VALUES(scoring_criteria),
          weight = VALUES(weight)
      `;
      
      await executeQuery(sql, [
        question.question_id,
        question.question_text,
        question.scoring_criteria,
        question.weight
      ]);
      
      console.log(`✅ Inserted/Updated question: ${question.question_id}`);
    }
    
    console.log('🎉 All questions inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting questions:', error);
    process.exit(1);
  }
}

insertQuestions();
