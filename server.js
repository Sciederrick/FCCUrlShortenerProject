require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const db = require('./db');
const URLsModel = require('./models/URLs');
const fs = require('fs')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended:true }));

app.use(cors());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  let original_url = req.body.url;
  try {
    original_url = new URL(original_url);
    if (
      !(
        (original_url.protocol === 'http:' || original_url.protocol === 'https:') && 
        original_url.host.split('.'))) {
          throw { code: 'ERR_INVALID_URL' };
        }
    dns.lookup(original_url.host, (err, _) => {
      if (err) {
        throw null;
      }

      let last_url = fs.readFileSync('./urls.txt', { encoding:'utf8', flag:'r' });
      last_url = Number(last_url);
      last_url++;

      let URLs = new URLsModel();
      URLs.shortUrl = last_url.toString();
      URLs.originalUrl = original_url.href;              
      URLs.save((err) => {
        if(err){
          throw err;
        }else{
          fs.writeFileSync('./urls.txt', last_url.toString(), { encoding: 'utf8' });
          res.json({ original_url:original_url, short_url: last_url });
        }
      });
    });
  } catch (err) {
    if (err.code === 'ERR_INVALID_URL') res.json({ error: 'invalid url' });
    res.json({ error: err });
  }
});

app.get('/api/shorturl/:url', async(req, res) => {
  try {
    const original_url = await URLsModel.find({ shortUrl: req.params.url.toString() }, 'originalUrl').exec();
    if (original_url) {
      res.redirect(original_url[0].originalUrl);
    } else {
      throw 'url does not exist';
    }
  } catch(err) {
    res.status(500).json({ error: 'something went wrong', msg: err });
  }
});

app.listen(port, function() {
  db.init();
  console.log(`Listening on port ${port}`);
});
