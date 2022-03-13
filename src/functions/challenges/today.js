const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const express = require('express');
const format = require('date-format');
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
  const date = parseInt(format('yyyyMMdd', new Date()));

  // Retrieve the current challenge from the database
  try {
    const result = await dynamodb
      .get({
        TableName: process.env.CHALLENGES_TABLE_NAME,
        Key: { date },
      })
      .promise();

    challengeData = result.Item;

    return res.status(200).json(challengeData);
  } catch (error) {
    return res.status(400).json({ error: error.toString() });
  }
});

module.exports.handler = serverless(app);
