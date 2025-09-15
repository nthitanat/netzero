const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the web directory
app.use(express.static(path.join(__dirname, 'web')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'web')}`);
});
