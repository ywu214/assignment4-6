const mongoose = require('mongoose');
const Room = new mongoose.Schema({
    title: String,
    price: String,
    detail: String,
    location: String,
    picture: String
});
module.exports = mongoose.model('Room', Room);
