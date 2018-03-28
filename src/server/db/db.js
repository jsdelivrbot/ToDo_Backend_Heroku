var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    userId: String,
    tasks: [{
        task: String,
        isCompleted: Boolean,
        isEditing: Boolean
    }]
});

module.exports.Todo = Todo;
