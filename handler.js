const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const _ = require('lodash');
const nouns = require('./nouns');
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
app.get('/random', async (req, res, next) => {
  // Get one random object word
  const answer = _.sampleSize(nouns)[0];

  axios
    .request(options(answer))
    .then((response) => {
      console.log(response);
      const hints = _.sampleSize(response.data.associations_array, TOTAL_HINTS);

      const challengeData = {
        answer,
        hints,
      };

      return res.status(200).json(challengeData);
    })
    .catch((err) => {
      return next(err);
    });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

module.exports.handler = serverless(app);
