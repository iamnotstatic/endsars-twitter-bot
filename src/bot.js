const Twit = require('twit');

const T = new Twit({
  consumer_key: process.env.APPLICATION_CONSUMER_KEY_HERE,
  consumer_secret: process.env.APPLICATION_CONSUMER_SECRET_HERE,
  access_token: process.env.ACCESS_TOKEN_HERE,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET_HERE,
});


// start stream and track tweets
const stream = T.stream('statuses/filter', {
  track: ['#SARSMUSTEND', '#EnsSARS', '#EndsSARS']
});

// use this to log errors from requests
const  responseCallback =(err, data, response) => {
  //console.log(data.errors);
}

// let waitTime = 60 * 60 * 1000;

// event handler

stream.on('tweet', (tweet) => {
  // retweet
  T.post('statuses/retweet/:id', { id: tweet.id_str }, responseCallback);
  // like
  T.post('favorites/create', { id: tweet.id_str }, responseCallback);
});
