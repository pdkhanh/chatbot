const APP_SECRET = 'f2f2d7de0f2ecd2835d52f0cf6df1775';
const VALIDATION_TOKEN = 'TokenTuyChon';
const PAGE_ACCESS_TOKEN = 'EAANjW5tGXRgBAFBzCdKU6v4DzvlJ9XsJ3EsJJ20YyR5jLZBDvutmY1tIZBDG7zkQuZCkmCUj0BlkURLEktyQ5rJXgPVFcvUqS4uzwtx5CW3mjAT5sENYz3ZCs6Q90bFVHgICuoAbAzy5mtyQQg6TkspgkN64N1ANpK6oznZBf3kZCbB55uU8UI';
 
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
 
app = express().use(bodyParser.json());
var server = http.createServer(app);
var request = require("request");
 
app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});
 
app.get('/webhook', function(req, res) { // Đây là path để validate tooken bên app facebook gửi qua
  if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});
 
app.post('/webhook', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
	getCorona();
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
	  var senderName = message.sender.last_name;
      if (message.message) {
        if (message.message.text) {
          var text = message.message.text;
          sendMessage(senderId, "Hello " + senderName +"!! I'm a bot. Your message: " + text);
		  console.log(text);
        }
      }
    }
  }
  res.status(200).send("OK");
});

const https = require('https');

function getCorona(){
	http.get('http://code.junookyo.xyz/api/ncov-moh/data.json', (resp) => {
	  let data = '';

	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
		data += chunk;
	  });

	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
		console.log("data: " + JSON.parse(data).explanation);
	  });

	}).on("error", (err) => {
	  console.log("Error: " + err.message);
	});
}
 
// Đây là function dùng api của facebook để gửi tin nhắn
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}
 
app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");
 
server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});