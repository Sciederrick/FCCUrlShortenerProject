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
  const original_url = typeof(req.body.url) === 'string' && req.body.url.length > 0 ? req.body.url : false;
  if (original_url) {
    dns.lookup(new URL(original_url).host, (err, _) => {
      if (err) {
        res.json({ error: 'invalid url' });
      }

      let last_url = fs.readFileSync('./urls.txt', { encoding:'utf8', flag:'r' });
      last_url = Number(last_url);
      last_url++;

      let URLs = new URLsModel();
      URLs.shortUrl = last_url.toString();
      URLs.originalUrl = original_url;              
      URLs.save((err) => {
        if(err){
          res.status(500).send(err._message)
        }else{
          try {
            fs.writeFileSync('./urls.txt', last_url.toString(), { encoding: 'utf8' });
            res.json({ original_url:original_url, short_url: last_url });
          } catch(_) {
            res.status(500).json({ error: 'something went wrong', });
          }
        }
      });
    });
  } else {
    res.json({ error: 'invalid url' });
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
