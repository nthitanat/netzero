/**
 * OpenAI Vector Store Test Script
 * 
 * This script demonstrates how to:
 * 1. Upload a file to OpenAI
 * 2. Create a vector store
 * 3. Add the file to the vector store
 * 4. Retrieve vector store information
 * 
 * Based on: https://platform.openai.com/docs/api-reference/vector-stores
 */

require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testVectorStore() {
  try {
    console.log('🚀 Starting Vector Store Test\n');

    // Step 1: Upload file
    console.log('📤 Step 1: Uploading file to OpenAI...');
    const filePath = path.join(__dirname, 'sample-data.txt');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants'
    });

    console.log(`✅ File uploaded successfully!`);
    console.log(`   File ID: ${file.id}`);
    console.log(`   Filename: ${file.filename}`);
    console.log(`   Size: ${file.bytes} bytes\n`);

    // Step 2: Create vector store
    console.log('📦 Step 2: Creating vector store...');
    const vectorStore = await openai.vectorStores.create({
      name: 'NetZero Test Vector Store',
      file_ids: [file.id],
      expires_after: {
        anchor: 'last_active_at',
        days: 7
      }
    });

    console.log(`✅ Vector store created successfully!`);
    console.log(`   Vector Store ID: ${vectorStore.id}`);
    console.log(`   Name: ${vectorStore.name}`);
    console.log(`   Status: ${vectorStore.status}`);
    console.log(`   File counts: ${JSON.stringify(vectorStore.file_counts)}\n`);

    // Step 3: Wait for processing (vector stores process files asynchronously)
    console.log('⏳ Step 3: Waiting for file processing...');
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const updatedStore = await openai.vectorStores.retrieve(vectorStore.id);
      
      if (updatedStore.status === 'completed') {
        console.log(`✅ File processing completed!`);
        console.log(`   Processed files: ${updatedStore.file_counts.completed}`);
        console.log(`   Total files: ${updatedStore.file_counts.total}\n`);
        break;
      } else if (updatedStore.status === 'failed') {
        console.log(`❌ File processing failed!`);
        console.log(`   Failed files: ${updatedStore.file_counts.failed}\n`);
        break;
      }
      
      attempts++;
      console.log(`   Status: ${updatedStore.status} (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }

    // Step 4: List files in vector store
    console.log('📋 Step 4: Listing files in vector store...');
    const vectorStoreFiles = await openai.vectorStores.files.list(vectorStore.id);
    
    console.log(`✅ Files in vector store:`);
    for (const file of vectorStoreFiles.data) {
      console.log(`   - File ID: ${file.id}`);
      console.log(`     Status: ${file.status}`);
    }
    console.log('');

    // Step 5: Retrieve vector store details
    console.log('🔍 Step 5: Retrieving vector store details...');
    const storeDetails = await openai.vectorStores.retrieve(vectorStore.id);
    
    console.log(`✅ Vector Store Details:`);
    console.log(`   ID: ${storeDetails.id}`);
    console.log(`   Name: ${storeDetails.name}`);
    console.log(`   Status: ${storeDetails.status}`);
    console.log(`   Created at: ${new Date(storeDetails.created_at * 1000).toISOString()}`);
    console.log(`   File counts:`, JSON.stringify(storeDetails.file_counts, null, 2));
    console.log('');

    // Summary
    console.log('🎉 Test completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   File ID: ${file.id}`);
    console.log(`   Vector Store ID: ${vectorStore.id}`);
    console.log(`   Status: ${storeDetails.status}`);
    console.log('');
    console.log('💡 You can now use this vector store with OpenAI Assistants API');
    console.log('   or for file search functionality.\n');

    // Optional: Clean up (uncomment if you want to delete after testing)
    // console.log('🧹 Cleaning up...');
    // await openai.vectorStores.del(vectorStore.id);
    // console.log('✅ Vector store deleted');

  } catch (error) {
    console.error('❌ Error during vector store test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
console.log('═══════════════════════════════════════════════');
console.log('  OpenAI Vector Store Test');
console.log('═══════════════════════════════════════════════\n');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY is not set');
  console.error('   Please create a .env file with your API key\n');
  process.exit(1);
}

testVectorStore();
