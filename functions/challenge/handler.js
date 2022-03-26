const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const express = require('express');
const format = require('date-format');
const cors = require('cors');
const axios = require('axios');
const _ = require('lodash');
const nouns = require('./nouns');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const app = express();

const TOTAL_HINTS = 8;

const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGIN,
  optionsSuccessStatus: 200,
};

const options = (entry) => {
  return {
    method: 'GET',
    url: 'https://twinword-word-associations-v1.p.rapidapi.com/associations/',
    params: { entry },
    headers: {
      'x-rapidapi-host': 'twinword-word-associations-v1.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    },
  };
};

app.use(cors(CORS_OPTIONS));

// Get the current daily challenge object from the database
app.get('/challenge', async (req, res, next) => {
  let date;
  console.log(req.query);
  if (req.query.bot !== undefined) {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = parseInt(format('yyyyMMdd', yesterday));
  } else {
    date = parseInt(format('yyyyMMdd', new Date()));
  }

  // Retrieve the current challenge from the database
  try {
    const result = await dynamodb
      .get({
        TableName: process.env.CHALLENGES_TABLE_NAME,
        Key: { date },
      })
      .promise();

    const challengeData = result.Item;

    return res.status(200).json(challengeData);
  } catch (error) {
    return res.status(400).json({ error: error.toString() });
  }
});

// Create a new, random challenge to tomorrow
app.post('/challenge', async (req, res, next) => {
  // Get tomorrow's date in the form of YYYYMMDD as an integer
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = parseInt(format('yyyyMMdd', tomorrow));

  // Get one random object word
  const answer = _.sampleSize(nouns)[0];

  // Request a set of hints and take a subset
  let response;
  let retry = 1;
  do {
    response = await axios.request(options(answer));
    retry += 1;
  } while (
    response.data.associations_array.length <= TOTAL_HINTS &&
    retry <= 10
  );
  const hints = _.sampleSize(response.data.associations_array, TOTAL_HINTS);

  const challengeData = {
    date,
    answer,
    hints,
  };

  try {
    // Add the new challenge information to the table if one for tomorrow doesn't exist
    await dynamodb
      .put({
        TableName: process.env.CHALLENGES_TABLE_NAME,
        Item: challengeData,
        ConditionExpression: 'attribute_not_exists(#challenge_day)',
        ExpressionAttributeNames: { '#challenge_day': 'date' },
      })
      .promise();

    return res.status(200).json(challengeData);
  } catch (error) {
    return res.status(400).json({ error: error.toString() });
  }
});

module.exports.handler = serverless(app);
