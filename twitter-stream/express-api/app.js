var config = require('./config');
var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
var redis_conn = require("redis");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

var routes = require("./routes/routes.js")(app);

var server = app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port %s...", server.address().port);
});

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  console.log('IO Connect ', socket.id);
  socket.join(config.io.channel);
  socket.on('disconnect', function(){
    console.log('IO Disconnected', socket.id);
  });
});

var redis = redis_conn.createClient(config.redis.url, {no_ready_check: true});

redis.on("error", function (err) {
  console.log("error event - " + err);
});

redis.on('ready', function() {
  redis.subscribe(config.io.channel);
});

redis.on("message", function(channel, message){
  console.log(channel, message);
  io.sockets.in(channel).emit('message', message);
});
