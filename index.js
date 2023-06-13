require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const urlDatabase = {};

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// API endpoint for URL shortening
app.post('/api/shorturl', (req, res) => {
  const longUrl = req.body.url;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  if (!urlRegex.test(longUrl)) {
    res.status(400).json({error: 'invalid url'});
    return;
  }

  // Validate the URL using dns.lookup()
  const hostname = new URL(longUrl).hostname;
  dns.lookup(hostname, (err) => {
    if(err) {
      res.status(400).json({error: 'invalid url'});
      return;
    }

    const shortUrl = Object.keys(urlDatabase).length + 1;
    urlDatabase[shortUrl] = longUrl;

    res.json(
      {
        original_url: longUrl, 
        short_url: shortUrl
      }
    );
  });
});

// Redirect to the original URL
app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;
  const longUrl = urlDatabase[shortUrl];

  if (longUrl) {
    res.redirect(301, longUrl);
  } else {
    res.status(404).json({error: 'URL not found'});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
