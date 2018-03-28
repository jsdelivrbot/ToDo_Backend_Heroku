var mongoose = require('mongoose');

var User = mongoose.model('User', {
    name: String,
    password: String,
    email: String,
    isAdmin: Boolean,
    image: String
});

module.exports.User = User;