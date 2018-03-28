var mongoose = require('mongoose');
var User = require('../db/user-schema').User;
var express = require('express');
var jwt = require('jsonwebtoken');
var multer = require('multer');
const path = require('path');
var config = require('../config');
var user = express.Router();

// Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
// 1MB = 1000000 bytes
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).any();

function checkFileType(file, cb) {
    // Allowed ext
    const fileTypes = /\.jpeg|\.jpg|\.png|\.gif/;
    // Check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mimeType
    // const mimeType = fileTypes.test(file.mimeType); We can also check for mimetype condition as well

    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: images only');
    }
}

user.post('/signup', function (req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: err
            });
        } else {
            if (req.files === undefined) {
                console.log('No file Selected');
                return res.status(500).send({
                    success: false,
                    message: 'No file Selected'
                });
            } else {
                console.log('File Uploaded!');
                req.body.image = req.files[0].filename;
                var user = new User(req.body);
                user.save(function (err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    res.json(result);
                });
            }
        }
    });
});

user.post('/login', function (req, res) {
    var emailID = req.body.email;
    User.find({
        'email': emailID
    }, function (err, response) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (response && response.length > 0) {
            const payload = {
                userID: response[0]._id,
                userName: response[0].name,
                email: response[0].email,
                isAdmin: response[0].isAdmin,
                imgURL: response[0].image
            };

            jwt.sign({
                payload
            }, config.secret, (err, token) => {
                res.json({
                    payload,
                    token
                });
            });
        } else {
            return res.status(500).send({
                success: false,
                message: 'User not found'
            });
        }
    });
});

module.exports = user;