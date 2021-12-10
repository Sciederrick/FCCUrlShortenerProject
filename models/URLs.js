const mongoose = require('mongoose');

//Schema
const URLs = mongoose.Schema;
const URLsSchema = new URLs({
    shortUrl: {type: String, required: true},
    originalUrl: {type: String, required:true},
}, { timestamp: true, _id: true, autoIndex: true });

//Model
module.exports = mongoose.model('URLs', URLsSchema);