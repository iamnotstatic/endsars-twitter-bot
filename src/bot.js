const needle = require('needle');
const Twit = require('twit');

require('dotenv').config();

const token = process.env.TWITTER_API_BEARER_TOKEN;
const consumer_key = process.env.TWITTER_CONSUMER_KEY;
const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
const access_token = process.env.TWITTER_ACCESS_TOKEN;
const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const url = process.env.TWITTER_API_URL;

const streamURL = `${url}/tweets/search/stream`;
const rulesURL = `${url}/tweets/search/stream/rules`;

const T = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
});

const rules = [
  { value: '#EndSARS' },
  { value: '#EndSWAT' },
  { value: '#EndPoliceBrutality' },
  { value: '#EndNigeriaNow' },
  { value: '#EndEFCC' },
  { value: '#EndNigeriaNowToSaveLives' },
  { value: '#INECElectionResult' },
  { value: '#EndBadGovernanceInNigeria' },
  { value: '#EndSARSProtest' },
];

// Set stream rules
const setRules = async () => {
  const data = {
    add: rules,
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
};

const getAllRules = async () => {
  const response = await needle('get', rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log('Error:', response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
};

const deleteAllRules = async (rules) => {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
};

// Stream Tweets
const stream = async (retryAttempt) => {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000, // 20 seconds
  });

  stream
    .on('data', async (data) => {
      try {
        const json = JSON.parse(data);

        if (json.data) {
          const id = json.data.id;

          // retweet
          T.post('statuses/retweet/:id', { id }, (err, data, response) => {});

          // like
          T.post('favorites/create', { id }, (err, data, response) => {});
        }
        // A successful connection resets retry count.
        retryAttempt = 0;
      } catch (e) {
        if (
          data.detail ===
          'This stream is currently at the maximum allowed connection limit.'
        ) {
          console.log(
            'The maximum number of concurrent connections to the Twitter API stream is currently in use.'
          );
        }
      }
    })
    .on('err', (error) => {
      if (error.code !== 'ECONNRESET') {
        console.log(error.code);
        process.exit(1);
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn('A connection error occurred. Reconnecting...');
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    });

  return stream;
};

(async () => {
  console.log('Starting bot...');

  let currentRules;

  try {
    // Gets the complete list of rules currently applied to the stream
    currentRules = await getAllRules();

    // Delete all rules. Comment the line below if you want to keep your existing rules.
    await deleteAllRules(currentRules);

    // Add rules to the stream. Comment the line below if you don't want to add new rules.
    await setRules();
  } catch (e) {
    //console.log(e);
  }

  // Listen to the stream.
  await stream(0);
})();
