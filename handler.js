const serverless = require('serverless-http');
const express = require('express');
const app = express();

// Get the current daily challenge object from the database
app.get('/daily', (req, res, next) => {
  return res.status(200).json({
    message: 'Hello from root!',
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

module.exports.handler = serverless(app);
