require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// AZ: parse POST body
let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



// if keeping short urls in memory, then can Array.push input urls and look up url in array
//   could push only when new
// if keeping short urls in db, then look up most recently used short url and increment
let arrayOfPostedURLs = new Array()

function getShortURL(inputURL) {
  let indexOfInputURLInArrayOfPostedURLs = arrayOfPostedURLs.indexOf(inputURL)
  let shortURL
  if (indexOfInputURLInArrayOfPostedURLs == -1) {
    arrayOfPostedURLs.push(inputURL)
    shortURL = arrayOfPostedURLs.length - 1
  } else {
    shortURL = indexOfInputURLInArrayOfPostedURLs
  }
  return shortURL
}

function shortURLIsValid (shortURL) {
  return ((Number.isInteger(shortURL)) &&
          (shortURL < arrayOfPostedURLs.length) &&
          (shortURL >= 0))
}

function getOriginalURL(shortURLString) {
  let shortURL = parseInt(shortURLString)
  if (shortURLIsValid(shortURL)) {
    let originalURL = arrayOfPostedURLs[shortURL]
    return originalURL
  } else {
    return false
  }
}

function urlIsValid(urlPosted) {
  const regex = /^http/;
  let urlPostedMatchesRegex = regex.test(urlPosted)
  if (urlPostedMatchesRegex) {
    //  dns.lookup(urlPosted, callback)
    return true
  }
  return false
}

app.post('/api/shorturl', function (req, res) {
  let urlPosted = req.body.url
  console.log(`urlPosted: ${urlPosted}`)
  if (urlIsValid(urlPosted)) {
    let shortURL = getShortURL(urlPosted)
    console.log(`shortURL: ${shortURL}`)
    let jsonResponseObject = {
      original_url : urlPosted,
      short_url : shortURL
    }
    res.json(jsonResponseObject)
  } else {
    console.log('invalid url')
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', function (req, res) {
  let shortURLString = req.params.short_url
  console.log(`shortURLString: ${shortURLString}`)
  let originalURL = getOriginalURL(shortURLString)
  console.log(`originalURL: ${originalURL}`)
  if (originalURL) {
    console.log(`redirecting to ${originalURL}`)
    res.redirect(originalURL)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
