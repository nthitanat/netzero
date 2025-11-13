#!/usr/bin/env node

/**
 * Script to initialize Chula NetZero Survey
 * This script creates a comprehensive survey for the Chulalongkorn NetZero project
 */

require('dotenv').config();
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_PREFIX = process.env.API_PREFIX || '/api';
const API_VERSION = process.env.API_VERSION || 'v1';
const SURVEY_API_URL = `${BASE_URL}${API_PREFIX}/${API_VERSION}/surveys`;
const AUTH_API_URL = `${BASE_URL}${API_PREFIX}/${API_VERSION}/auth`;

// Admin user for survey creation
const ADMIN_USER = {
  email: process.env.SURVEY_ADMIN_EMAIL || 'admin@netzero.com',
  password: process.env.SURVEY_ADMIN_PASSWORD || 'password123',
  firstName: 'Survey',
  lastName: 'Administrator',
  role: 'admin'
};

// Survey configuration
const SURVEY_DATA = {
  name: "chula-netzero",
  description: "แบบสำรวจการมีส่วนร่วมและความพึงพอใจต่อโครงการ NetZero ของจุฬาลงกรณ์มหาวิทยาลัย",
  start_date: "2025-11-11 00:00:00",
  end_date: "2025-12-31 23:59:59",
  questions: [
    // 🧾 ข้อมูลผู้เข้าร่วมและคำยินยอม
    {
      question_text: "ข้าพเจ้ายินยอมเข้าร่วมการวิจัย",
      question_type: "yes_no",
      order_in_survey: 1
    },
    
    // 👥 คัดกรองและบทบาท
    {
      question_text: "ความสัมพันธ์กับจุฬาฯ (เลือกได้หลายข้อ)",
      question_type: "checkbox",
      order_in_survey: 2
    },
    {
      question_text: "ใน 6 เดือนที่ผ่านมา เคยใช้งานเว็บไซต์ NetZero หรือไม่",
      question_type: "yes_no",
      order_in_survey: 3
    },
    {
      question_text: "ใน 12 เดือนที่ผ่านมา เคยเข้าร่วมกิจกรรม NetZero/ความยั่งยืนหรือไม่",
      question_type: "yes_no",
      order_in_survey: 4
    },
    
    // 👤 ข้อมูลประชากรตัวอย่าง
    {
      question_text: "อายุ (ปี)",
      question_type: "text",
      order_in_survey: 5
    },
    {
      question_text: "เพศ",
      question_type: "text",
      order_in_survey: 6
    },
    {
      question_text: "จังหวัด/พื้นที่",
      question_type: "text",
      order_in_survey: 7
    },
    {
      question_text: "สังกัด (คณะ/หน่วยงาน/องค์กร)",
      question_type: "text",
      order_in_survey: 8
    },
    {
      question_text: "อุปกรณ์หลัก",
      question_type: "multiple_choice",
      order_in_survey: 9
    },
    {
      question_text: "เครือข่ายหลัก",
      question_type: "multiple_choice",
      order_in_survey: 10
    },
    
    // 📣 การรับรู้และการสื่อสาร
    {
      question_text: "ทราบว่าจุฬาฯ มุ่งสู่ Net-Zero ภายในปี 2050",
      question_type: "rating",
      order_in_survey: 11
    },
    {
      question_text: "เห็นการสื่อสาร NetZero ใน 3 เดือนที่ผ่านมา",
      question_type: "rating",
      order_in_survey: 12
    },
    {
      question_text: "จำกลยุทธ์สำคัญของ NetZero ได้อย่างน้อยหนึ่งประเด็น",
      question_type: "rating",
      order_in_survey: 13
    },
    {
      question_text: "ข้อความสื่อสารชี้ชัดวิธีที่ประชาชน/ชุมชนมีส่วนร่วมได้",
      question_type: "rating",
      order_in_survey: 14
    },
    {
      question_text: "ทราบข่าวครั้งแรกรับจากช่องทางใด (ปลายเปิด)",
      question_type: "text",
      order_in_survey: 15
    },
    
    // 💻 ความใช้ได้และประสบการณ์เว็บไซต์
    {
      question_text: "ทำภารกิจสำคัญที่สุดบนเว็บสำเร็จ",
      question_type: "rating",
      order_in_survey: 16
    },
    {
      question_text: "โดยรวม งานนั้นง่ายเพียงใด (1 ยากมาก – 7 ง่ายมาก)",
      question_type: "rating",
      order_in_survey: 17
    },
    {
      question_text: "เว็บไซต์ใช้งานง่าย",
      question_type: "rating",
      order_in_survey: 18
    },
    {
      question_text: "โครงร่าง/ป้ายกำกับ/เมนูชัดเจน",
      question_type: "rating",
      order_in_survey: 19
    },
    {
      question_text: "เวลาโหลดอยู่ในเกณฑ์ยอมรับได้",
      question_type: "rating",
      order_in_survey: 20
    },
    {
      question_text: "ทำงานได้ดีบนอุปกรณ์ของฉัน",
      question_type: "rating",
      order_in_survey: 21
    },
    {
      question_text: "เว็บช่วยให้ทำสิ่งที่ต้องการได้",
      question_type: "rating",
      order_in_survey: 22
    },
    {
      question_text: "ฉันมั่นใจเมื่อใช้เว็บไซต์นี้",
      question_type: "rating",
      order_in_survey: 23
    },
    
    // ⚙️ TAM/UTAUT: ประโยชน์ การใช้ได้ง่าย เจตนา
    {
      question_text: "เว็บไซต์เป็นประโยชน์ต่อเป้าหมายความยั่งยืนของฉัน",
      question_type: "rating",
      order_in_survey: 24
    },
    {
      question_text: "เรียนรู้การใช้เว็บไซต์ได้ง่าย",
      question_type: "rating",
      order_in_survey: 25
    },
    {
      question_text: "ตั้งใจจะใช้เว็บไซต์อีกใน 3 เดือนข้างหน้า",
      question_type: "rating",
      order_in_survey: 26
    },
    {
      question_text: "ความน่าจะแนะนำเว็บไซต์ (0–10)",
      question_type: "rating",
      order_in_survey: 27
    },
    
    // 🤝 การมีส่วนร่วมและร่วมออกแบบ
    {
      question_text: "บทบาทของฉันมากกว่าแค่รับข้อมูล (มีส่วนร่วมเชิงคุณค่า)",
      question_type: "rating",
      order_in_survey: 28
    },
    {
      question_text: "มีโอกาสเป็นหุ้นส่วน/ออกแบบร่วมกับทีมจุฬาฯ",
      question_type: "rating",
      order_in_survey: 29
    },
    {
      question_text: "เสียงของชุมชนมีอิทธิพลต่อการตัดสินใจ",
      question_type: "rating",
      order_in_survey: 30
    },
    {
      question_text: "ข้อมูล/ผลลัพธ์โปร่งใสและเข้าถึงได้",
      question_type: "rating",
      order_in_survey: 31
    },
    {
      question_text: "ระดับการมีส่วนร่วม (Arnstein)",
      question_type: "multiple_choice",
      order_in_survey: 32
    },
    
    // 🌐 การสอดคล้องกับ 4I & USR/SCOPE
    {
      question_text: "เสริม Impactful Growth (ผลกระทบชุมชน/SDGs)",
      question_type: "rating",
      order_in_survey: 33
    },
    {
      question_text: "สร้าง Integrated Growth (บูรณาการความร่วมมือ)",
      question_type: "rating",
      order_in_survey: 34
    },
    {
      question_text: "สนับสนุน Internal Growth (การเรียนรู้/บุคลากร/วิจัย)",
      question_type: "rating",
      order_in_survey: 35
    },
    {
      question_text: "ช่วย International Growth (ความร่วมมือ/ภาพลักษณ์นานาชาติ)",
      question_type: "rating",
      order_in_survey: 36
    },
    {
      question_text: "สะท้อน USR/SCOPE (จริยธรรม ความโปร่งใส ประโยชน์สาธารณะ)",
      question_type: "rating",
      order_in_survey: 37
    },
    
    // 📚 การเรียนรู้ ความไว้วางใจ และการเปลี่ยนพฤติกรรม
    {
      question_text: "ฉันเพิ่มความรู้เรื่อง NetZero/Climate Action",
      question_type: "rating",
      order_in_survey: 38
    },
    {
      question_text: "ฉันเชื่อมั่นข้อมูล/รายงาน (ทะเบียนต้นไม้ การใช้เงินบริจาค)",
      question_type: "rating",
      order_in_survey: 39
    },
    {
      question_text: "หลังการมีส่วนร่วม ฉันเปลี่ยนพฤติกรรมอย่างน้อยหนึ่งอย่าง",
      question_type: "rating",
      order_in_survey: 40
    },
    {
      question_text: "มีแนวโน้มเข้าร่วมกิจกรรม NetZero ต่อไป",
      question_type: "rating",
      order_in_survey: 41
    },
    {
      question_text: "รู้สึกเชื่อมโยงกับขบวนการความยั่งยืนของจุฬาฯ มากขึ้น",
      question_type: "rating",
      order_in_survey: 42
    },
    {
      question_text: "การกระทำเพื่อความยั่งยืนล่าสุดของคุณ (ปลายเปิด)",
      question_type: "text",
      order_in_survey: 43
    },
    
    // 🌳 Tree Passport & Big Tree Map
    {
      question_text: "เข้าใจวัตถุประสงค์ของการลงทะเบียนต้นไม้ (Tree Passport)",
      question_type: "rating",
      order_in_survey: 44
    },
    {
      question_text: "พร้อมลงทะเบียนต้นไม้ที่ปลูก/ดูแล",
      question_type: "rating",
      order_in_survey: 45
    },
    {
      question_text: "คุณสมบัติแผนที่ (ค้นหา/กรอง/รายละเอียด) ชัดเจนและมีประโยชน์",
      question_type: "rating",
      order_in_survey: 46
    },
    {
      question_text: "ไม่มีข้อกังวลสำคัญด้านความเป็นส่วนตัวของข้อมูลต้นไม้",
      question_type: "rating",
      order_in_survey: 47
    },
    {
      question_text: "ควรแสดงข้อมูลอะไรบนแต่ละต้นไม้ (ปลายเปิด)",
      question_type: "text",
      order_in_survey: 48
    },
    
    // 💰 ความโปร่งใสด้านการบริจาคและการจับคู่ความช่วยเหลือ
    {
      question_text: "ความต้องการความช่วยเหลือถูกสื่อสาร/จับคู่กับผู้รับได้ชัดเจน",
      question_type: "rating",
      order_in_survey: 49
    },
    {
      question_text: "สามารถติดตามเส้นทางเงิน/สิ่งของบริจาคไปสู่ผลลัพธ์ได้",
      question_type: "rating",
      order_in_survey: 50
    },
    {
      question_text: "ระบบกระตุ้นให้บริจาค/อาสามากขึ้น",
      question_type: "rating",
      order_in_survey: 51
    },
    {
      question_text: "สิ่งใดจะเพิ่มความเชื่อมั่นในการบริจาค/อาสา (ปลายเปิด)",
      question_type: "text",
      order_in_survey: 52
    },
    
    // 🤖 Mobile Learning Sphere และ AI สนับสนุน
    {
      question_text: "โมเดล Mobile Learning/Road-show ช่วยให้ชุมชนมีส่วนร่วมง่ายขึ้น",
      question_type: "rating",
      order_in_survey: 53
    },
    {
      question_text: "คำแนะนำโดย AI ช่วยให้ลงมือทำได้ดีขึ้น",
      question_type: "rating",
      order_in_survey: 54
    },
    {
      question_text: "เข้าใจการใช้ข้อมูลส่วนบุคคลเมื่อโต้ตอบกับ AI",
      question_type: "rating",
      order_in_survey: 55
    },
    {
      question_text: "ต้องการสื่อสอน/เวิร์กช็อป/ทรัพยากรเพิ่มเติม",
      question_type: "rating",
      order_in_survey: 56
    },
    
    // 🚧 อุปสรรคและการสนับสนุน
    {
      question_text: "ข้อจำกัดด้านเวลาเป็นอุปสรรค",
      question_type: "rating",
      order_in_survey: 57
    },
    {
      question_text: "การเข้าถึงอินเทอร์เน็ต/อุปกรณ์เป็นอุปสรรค",
      question_type: "rating",
      order_in_survey: 58
    },
    {
      question_text: "ภาษา/การช่วยการเข้าถึงเป็นอุปสรรค",
      question_type: "rating",
      order_in_survey: 59
    },
    {
      question_text: "ทราบช่องทางขอความช่วยเหลือ/รายงานปัญหา",
      question_type: "rating",
      order_in_survey: 60
    },
    {
      question_text: '"1 สิ่ง" ที่ควรปรับปรุงมากที่สุดคืออะไร (ปลายเปิด)',
      question_type: "text",
      order_in_survey: 61
    },
    
    // 🌈 ภาพรวม
    {
      question_text: "ความพึงพอใจต่อโครงการ NetZero โดยรวม",
      question_type: "rating",
      order_in_survey: 62
    },
    {
      question_text: "ความพึงพอใจต่อเว็บไซต์ NetZero โดยรวม",
      question_type: "rating",
      order_in_survey: 63
    },
    {
      question_text: "ต้องการรับข่าวสารในอนาคตหรือไม่",
      question_type: "yes_no",
      order_in_survey: 64
    },
    {
      question_text: "อีเมล (ไม่บังคับ)",
      question_type: "text",
      order_in_survey: 65
    }
  ]
};

// Helper function to make HTTP requests
function makeRequest(url, data, method = 'POST', headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = data ? JSON.stringify(data) : '';
    
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };
    
    if (postData) {
      defaultHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: { ...defaultHeaders, ...headers }
    };
    
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: response,
            headers: res.headers 
          });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Function to authenticate and get token
async function authenticateAdmin() {
  try {
    console.log('🔐 Authenticating admin user...');
    console.log(`📧 Email: ${ADMIN_USER.email}`);
    
    // First, try to register the admin user (might fail if already exists)
    let userExists = false;
    try {
      console.log('📝 Attempting to register admin user...');
      const registerUrl = `${AUTH_API_URL}/register`;
      const registerResponse = await makeRequest(registerUrl, ADMIN_USER);
      
      if (registerResponse.status === 201 && registerResponse.data.success) {
        console.log('✅ Admin user registered successfully');
      } else {
        console.log(`ℹ️  Registration response: ${registerResponse.status} - ${registerResponse.data.message}`);
        userExists = true;
      }
    } catch (error) {
      // Registration might fail if user already exists - that's okay
      console.log('ℹ️  Admin user likely already exists, continuing with login...');
      userExists = true;
    }
    
    // Now login to get the token
    console.log('🔑 Attempting to login...');
    const loginUrl = `${AUTH_API_URL}/login`;
    const loginData = {
      email: ADMIN_USER.email,
      password: ADMIN_USER.password
    };
    
    const loginResponse = await makeRequest(loginUrl, loginData);
    
    console.log(`📊 Login response status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      console.log('✅ Authentication successful');
      const token = loginResponse.data.data.token;
      console.log(`🎟️  Token obtained (length: ${token ? token.length : 0})`);
      return token;
    } else {
      console.error(`❌ Login failed with status ${loginResponse.status}`);
      console.error(`   Response: ${JSON.stringify(loginResponse.data)}`);
      throw new Error(`Authentication failed: ${loginResponse.data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error(`💥 Authentication error: ${error.message}`);
    throw new Error(`Authentication error: ${error.message}`);
  }
}

async function createSurvey() {
  try {
    console.log('🚀 Starting Chula NetZero Survey Creation');
    console.log('=====================================\n');
    
    console.log(`📡 API URL: ${SURVEY_API_URL}`);
    console.log(`📋 Survey Name: ${SURVEY_DATA.name}`);
    console.log(`📝 Total Questions: ${SURVEY_DATA.questions.length}\n`);
    
    // Authenticate first
    const token = await authenticateAdmin();
    
    if (!token) {
      throw new Error('No authentication token received');
    }
    
    // Create the survey with authentication
    console.log('⏳ Creating survey with authentication...');
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };
    
    console.log(`🔗 Making POST request to: ${SURVEY_API_URL}`);
    console.log(`🎟️  Using token: ${token ? token.substring(0, 20) + '...' : 'NO TOKEN'}`);
    
    const response = await makeRequest(SURVEY_API_URL, SURVEY_DATA, 'POST', authHeaders);
    
    console.log(`📊 Survey creation response status: ${response.status}`);
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Survey created successfully!');
      console.log(`📊 Survey ID: ${response.data.data.survey_id}`);
      console.log(`📅 Start Date: ${response.data.data.start_date}`);
      console.log(`📅 End Date: ${response.data.data.end_date}`);
      console.log(`❓ Questions Created: ${response.data.data.questions ? response.data.data.questions.length : 0}`);
      
      console.log('\n🔗 Survey Access URLs:');
      console.log(`   View Survey: GET ${SURVEY_API_URL}/${response.data.data.survey_id}`);
      console.log(`   Submit Response: POST ${SURVEY_API_URL}/${response.data.data.survey_id}/submit`);
      console.log(`   Analytics: GET ${SURVEY_API_URL}/${response.data.data.survey_id}/analytics`);
      
      console.log('\n🎯 Survey Categories:');
      console.log('   🧾 ข้อมูลผู้เข้าร่วมและคำยินยอม (Q1)');
      console.log('   👥 คัดกรองและบทบาท (Q2-Q4)');
      console.log('   👤 ข้อมูลประชากรตัวอย่าง (Q5-Q10)');
      console.log('   📣 การรับรู้และการสื่อสาร (Q11-Q15)');
      console.log('   💻 ความใช้ได้และประสบการณ์เว็บไซต์ (Q16-Q23)');
      console.log('   ⚙️  TAM/UTAUT: ประโยชน์ การใช้ได้ง่าย เจตนา (Q24-Q27)');
      console.log('   🤝 การมีส่วนร่วมและร่วมออกแบบ (Q28-Q32)');
      console.log('   🌐 การสอดคล้องกับ 4I & USR/SCOPE (Q33-Q37)');
      console.log('   📚 การเรียนรู้ ความไว้วางใจ และการเปลี่ยนพฤติกรรม (Q38-Q43)');
      console.log('   🌳 Tree Passport & Big Tree Map (Q44-Q48)');
      console.log('   💰 ความโปร่งใสด้านการบริจาคและการจับคู่ความช่วยเหลือ (Q49-Q52)');
      console.log('   🤖 Mobile Learning Sphere และ AI สนับสนุน (Q53-Q56)');
      console.log('   🚧 อุปสรรคและการสนับสนุน (Q57-Q61)');
      console.log('   🌈 ภาพรวม (Q62-Q65)');
      
      return {
        success: true,
        surveyId: response.data.data.survey_id,
        data: response.data.data
      };
      
    } else {
      console.error(`❌ Survey creation failed with status ${response.status}`);
      console.error(`   Response: ${JSON.stringify(response.data)}`);
      throw new Error(`API returned success: false - ${response.data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('\n💥 Error creating survey:');
    console.error(`   ${error.message}`);
    console.error('   Please ensure the API server is running at:', BASE_URL);
    
    if (error.message.includes('Authentication')) {
      console.error('\n🔐 Authentication Tips:');
      console.error('   - Check if the server is properly configured');
      console.error('   - Ensure the database is initialized');
      console.error('   - Try running: npm run db:ensure');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🌱 Chula NetZero Survey Initialization Script');
  console.log('============================================\n');
  
  const result = await createSurvey();
  
  if (result.success) {
    console.log('\n🎉 Survey initialization completed successfully!');
    console.log('   The Chula NetZero survey is now ready for responses.');
    process.exit(0);
  } else {
    console.log('\n❌ Survey initialization failed.');
    console.log('   Please check the error details above and try again.');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled promise rejection:');
  console.error(error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:');
  console.error(error.message);
  process.exit(1);
});

// Run the script
main();