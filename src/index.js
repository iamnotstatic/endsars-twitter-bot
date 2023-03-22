const express = require('express');
require('./bot');

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to the Official Twitter Bot for #EndSARS',
    link: 'https://twitter.com/endsarsbot_',
    github: 'https://github.com/iamnotstatic/endsars-twitter-bot',
    creator: 'https://twitter.com/iamnotstatic',
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
