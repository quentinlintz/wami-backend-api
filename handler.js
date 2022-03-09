const serverless = require('serverless-http');
const express = require('express');
const app = express();
const axios = require('axios');
const friendlyWords = require('friendly-words');
const _ = require('lodash');

// Get the current daily challenge object from the database
app.get('/daily', async (req, res, next) => {
  // Get one random object word
  const answer = _.sampleSize(friendlyWords.objects)[0];

  axios
    .get('https://api.datamuse.com/words?rel_jja=' + answer)
    .then((allHints) => {
      let hints = [];

      // Push the first 5 hints into the array
      for (let i = 0; i < 5; i++) {
        const word = allHints.data[i].word;
        word !== undefined ? hints.push(word) : hints.push('');
      }

      hints = hints.reverse();

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
