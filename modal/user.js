const mongoose = require('mongoose');
const User = new mongoose.Schema({
    email: String,
    username: String,
    firstName: String,
    lastName: String,
    password: String,
    rooms: Array,
});
module.exports = mongoose.model('User', User);
