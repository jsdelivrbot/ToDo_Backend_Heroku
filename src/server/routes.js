var todosRoutes = require('./todos/routes');
var userRoutes = require('./user/user');

module.exports = function routes(app) {
    app.use('/todos', todosRoutes);
    app.use('/api/user', userRoutes);
};
