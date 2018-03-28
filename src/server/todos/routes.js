var mongoose = require('mongoose');
var Todo = require('../db/db').Todo;
var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();


// This middle ware function is responsible to get the Token from Header & Verify the Token
router.use(function (req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        jwt.verify(token, config.secret, (err, authdata) => {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                req.authdata = authdata;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get('/', function (req, res) {
    Todo.find({
        userId: mongoose.Types.ObjectId(req.authdata.payload.userID)
    }, function (err, results) {
        if (err) {
            console.log(err);
        }
        res.send({
            todos: results
        });
    })
});

router.post('/', function (req, res) {
    var taskObj = {};
    var task = [];
    task.push(req.body);
    taskObj.userId = req.authdata.payload.userID;
    taskObj.tasks = task;

    Todo.findOne({
        userId: mongoose.Types.ObjectId(taskObj.userId)
    }, function (err, data) {
        if (!data) {
            // Save the Data
            console.log('In Saving......');
            var todo = new Todo(taskObj);
            todo.save(function (err) {
                if (err) {
                    console.log(err);
                }
                return res.send('ToDo saved');
            });
        } else {
            // Update the data
            console.log('In Updating......');
            Todo.update({
                _id: mongoose.Types.ObjectId(data._id)
            }, {
                $push: {
                    tasks: taskObj.tasks
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('ToDo Updated');
            });
        }
    });
});

router.put('/:id', function (req, res) {
    // Here id is sub document id which we want to update the data
    var id = req.params.id;
    Todo.findOneAndUpdate({
        userId: mongoose.Types.ObjectId(req.authdata.payload.userID),
        "tasks._id": id
    }, {
        $set: {
            "tasks.$.task": req.body.task,
            "tasks.$.isCompleted": req.body.isCompleted,
            "tasks.$.isEditing": req.body.isEditing
        }
    }, {
        new: true
    }, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'Error While updating task'
            });
        } else {
            return res.json(doc);
        }
    });
});

router.delete('/:id', function (req, res) {
    // $pull is used to delete a sub document
    var id = req.params.id;
    Todo.findOneAndUpdate({
        userId: mongoose.Types.ObjectId(req.authdata.payload.userID)
    }, {
        $pull: {
            tasks: {
                _id: id
            }
        }
    }, {
        multi: true
    }, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'Error While Deleting task'
            });
        } else {
            return res.json(doc);
        }
    });
});

module.exports = router;