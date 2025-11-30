# OpenAI Vector Store Test Project

A simple Node.js test project to demonstrate uploading files to OpenAI Vector Store API.

## 📋 Overview

This project tests the OpenAI Vector Store API by:
1. Uploading a text file to OpenAI
2. Creating a vector store
3. Adding the file to the vector store
4. Monitoring processing status
5. Retrieving vector store information

## 🔗 Documentation Reference

Based on the official OpenAI API documentation:
- [Vector Stores API](https://platform.openai.com/docs/api-reference/vector-stores/object)
- [Files API](https://platform.openai.com/docs/api-reference/files)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd test-vector-store
npm install
```

### 2. Configure API Key

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

## 🚀 Usage

Run the test script:

```bash
npm test
```

Or directly with Node:

```bash
node test-vector-store.js
```

## 📁 Project Structure

```
test-vector-store/
├── package.json              # Project dependencies
├── test-vector-store.js      # Main test script
├── sample-data.txt           # Sample text file to upload
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
└── README.md                 # This file
```

## 📝 What the Script Does

### Step 1: Upload File
- Uploads `sample-data.txt` to OpenAI
- Returns a file ID for reference

### Step 2: Create Vector Store
- Creates a new vector store with a name
- Attaches the uploaded file to the vector store

### Step 3: Monitor Processing
- Polls the vector store status
- Waits for file processing to complete

### Step 4: List Files
- Lists all files in the vector store
- Shows file status

### Step 5: Retrieve Details
- Gets complete vector store information
- Displays metadata and file counts

## 🎯 Expected Output

```
═══════════════════════════════════════════════
  OpenAI Vector Store Test
═══════════════════════════════════════════════

🚀 Starting Vector Store Test

📤 Step 1: Uploading file to OpenAI...
✅ File uploaded successfully!
   File ID: file-xxxxx
   Filename: sample-data.txt
   Size: 1234 bytes

📦 Step 2: Creating vector store...
✅ Vector store created successfully!
   Vector Store ID: vs_xxxxx
   Name: NetZero Test Vector Store
   Status: in_progress
   File counts: {"total":1,"completed":0,"in_progress":1}

⏳ Step 3: Waiting for file processing...
✅ File processing completed!
   Processed files: 1
   Total files: 1

📋 Step 4: Listing files in vector store...
✅ Files in vector store:
   - File ID: file-xxxxx
     Status: completed

🔍 Step 5: Retrieving vector store details...
✅ Vector Store Details:
   ID: vs_xxxxx
   Name: NetZero Test Vector Store
   Status: completed
   Created at: 2025-11-22T...
   File counts: {
     "total": 1,
     "completed": 1,
     "in_progress": 0,
     "failed": 0,
     "cancelled": 0
   }

🎉 Test completed successfully!

📝 Summary:
   File ID: file-xxxxx
   Vector Store ID: vs_xxxxx
   Status: completed

💡 You can now use this vector store with OpenAI Assistants API
   or for file search functionality.
```

## 🔧 Customization

### Upload Your Own File

Replace `sample-data.txt` with any text file you want to test.

### Clean Up Resources

Uncomment the cleanup section in `test-vector-store.js` to automatically delete the vector store after testing:

```javascript
// Optional: Clean up (uncomment if you want to delete after testing)
console.log('🧹 Cleaning up...');
await openai.beta.vectorStores.del(vectorStore.id);
console.log('✅ Vector store deleted');
```

## 📚 Use Cases

Vector stores are useful for:
- Building RAG (Retrieval Augmented Generation) systems
- Creating AI assistants with file search capabilities
- Implementing knowledge bases
- Enabling semantic search across documents

## ⚠️ Notes

- This is a standalone test project, **not included in docker-compose**
- Vector store processing is asynchronous and may take a few seconds
- Files must be uploaded with `purpose: 'assistants'`
- Supported file types include: `.txt`, `.pdf`, `.doc`, `.docx`, `.json`, `.csv`, etc.

## 🔗 Related APIs

- **Assistants API**: Use vector stores with AI assistants
- **File Search Tool**: Enable file search in assistant conversations
- **Embeddings API**: Lower-level vector search capabilities

## 📖 Additional Resources

- [OpenAI Platform Documentation](https://platform.openai.com/docs)
- [Vector Stores Guide](https://platform.openai.com/docs/assistants/tools/file-search)
- [API Reference](https://platform.openai.com/docs/api-reference)
