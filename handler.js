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

app.use(cors(CORS_OPTIONS));

// Get the current daily challenge object from the database
app.get('/random', async (req, res, next) => {
  // Get one random object word
  const answer = _.sampleSize(nouns)[0];

  axios
    .get('https://api.datamuse.com/words?rel_jjb=' + answer)
    .then((json) => {
      const allHints = json.data;
      let hints = [];

      for (let i = 0; i < TOTAL_HINTS; i++) {
        allHints[i] !== undefined
          ? hints.push(allHints[i].word)
          : hints.push('');
      }

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
