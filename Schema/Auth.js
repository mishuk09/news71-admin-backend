const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String
});

const Auth = mongoose.model('Auth', userSchema);

module.exports = Auth;
