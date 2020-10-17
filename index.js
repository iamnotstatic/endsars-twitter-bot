const express = require('express');

require('./src/bot');

const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to ENDSARS BOt',
    link: 'https://twitter.com/endsarsbot_',
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
