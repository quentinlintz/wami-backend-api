const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
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

// Get a new, random challenge to tomorrow
app.post('/new', async (req, res, next) => {
  // Check if the challenge for tomorrow has been already created
  // await client;

  // Get tomorrow's date
  let today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setMonth(today.getMonth() + 1);
  let date =
    tomorrow.getMonth() +
    '-' +
    tomorrow.getDate() +
    '-' +
    tomorrow.getFullYear();

  // Get one random object word
  const answer = _.sampleSize(nouns)[0];

  // Request a set of hints and take a subset
  try {
    const response = await axios.request(options(answer));
    const hints = _.sampleSize(response.data.associations_array, TOTAL_HINTS);

    const challengeData = {
      id: uuidv4(),
      date,
      answer,
      hints,
    };

    // Add the new challenge information to the table
    // await dynamodb
    //   .put({
    //     TableName: process.env.CHALLENGE_TABLE_NAME,
    //     Item: challengeData,
    //   })
    //   .promise();

    return res.status(200).json(challengeData);
  } catch (error) {
    return res.status(400).json({ error: error.toString() });
  }
});

module.exports.handler = serverless(app);
