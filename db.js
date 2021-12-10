const { connect, connection } = require('mongoose');
const db = {};

db.init = () => {
  connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = connection;
  db.on('error', console.error.bind(console, '[mongodb] connection error:'));
  db.once('open', ()=>{
    //We're connected
    console.log('\x1b[35m%s\x1b[0m', 'Status 200 => OK[mongoDB]');
  });
}

module.exports = db;