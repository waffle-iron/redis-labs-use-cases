var io = require('socket.io-client');
var serverUrl = 'http://localhost:3000';
var conn = io.connect(serverUrl);

conn.on("connect", function (socket) {
  console.log("Connected!");
});

conn.on('message', function (message){
  console.log(message);
});
