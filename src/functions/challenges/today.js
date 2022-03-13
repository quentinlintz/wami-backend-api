const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const app = express();

const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGIN,
  optionsSuccessStatus: 200,
};

app.use(cors(CORS_OPTIONS));

// Get the current daily challenge object from the database
app.get('/today', async (req, res, next) => {
  // Retrieve the current challenge from the database
  const challengeData = {
    answer: 'test',
    hints: ['test'],
  };

  return res.status(200).json(challengeData);
});

module.exports.handler = serverless(app);
