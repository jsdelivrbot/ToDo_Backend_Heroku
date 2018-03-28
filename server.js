var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var debug = require('debug')('expressdebug:server');
var app = express();
var routes = require('./src/server/routes');

var PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://nagendra:1234qwer@ds117469.mlab.com:17469/learning');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Mongo DB Connected Successfully");
});


app.use(function (req, res, next) {
    //set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
routes(app);


app.listen(PORT, () => {
    console.log(`Server Running on PORT ${PORT}`);
});
