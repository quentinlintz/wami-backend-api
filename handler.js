const serverless = require('serverless-http');
const express = require('express');
const app = express();
const axios = require('axios');
const friendlyWords = require('friendly-words');
const _ = require('lodash');

// Get the current daily challenge object from the database
app.get('/random', async (req, res, next) => {
  // Get one random object word
  const answer = _.sampleSize(friendlyWords.objects)[0];

  axios
    .get('https://api.datamuse.com/words?rel_jja=' + answer)
    .then((json) => {
      const allHints = _.sampleSize(json.data, 5);
      let hints = [];

      for (let i = 0; i < allHints.length; i++) {
        hints.push(allHints[i].word);
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
