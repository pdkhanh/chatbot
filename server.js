const APP_SECRET = 'f2f2d7de0f2ecd2835d52f0cf6df1775';
const VALIDATION_TOKEN = 'TokenTuyChon';
const PAGE_ACCESS_TOKEN = 'EAANjW5tGXRgBAFBzCdKU6v4DzvlJ9XsJ3EsJJ20YyR5jLZBDvutmY1tIZBDG7zkQuZCkmCUj0BlkURLEktyQ5rJXgPVFcvUqS4uzwtx5CW3mjAT5sENYz3ZCs6Q90bFVHgICuoAbAzy5mtyQQg6TkspgkN64N1ANpK6oznZBf3kZCbB55uU8UI';
 
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
 
app = express().use(bodyParser.json());
var server = http.createServer(app);
var request = require("request");
var a;
 
app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});
 
app.get('/webhook', function(req, res) { // Đây là path để validate tooken bên app facebook gửi qua
  if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});
 
app.post('/webhook1', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
	var request = require('request');
	request('https://code.junookyo.xyz/api/ncov-moh/data.json', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var jsonBody = JSON.parse(body);
		var returnBody;
		returnBody = "Tình hình Corona\n"
					+ "Thế giới: " + jsonBody.data.global.cases + " ca nhiễm\n"
					+ "Trong đó tử vong: " + jsonBody.data.global.deaths
					+ ", hồi phục: " + jsonBody.data.global.recovered + "\n"
					+ "--------------------------- \n"
					+ "Việt Nam: " + jsonBody.data.vietnam.cases + " ca nhiễm\n"
					+ "Trong đó tử vong: " + jsonBody.data.vietnam.deaths
					+ ", hồi phục: " + jsonBody.data.vietnam.recovered;
		console.log(jsonBody.data);
		res.status(200).send(returnBody);
		
		var senderId = req.body.entry[0].messaging[0].sender.id;
		console.log(senderId)
		
		setInterval(() => sendMessage(senderId, returnBody), 20000);
	  }
	})
});


app.post('/webhook', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
	var oldValue;
	var ID = req.body.entry[0].messaging[0].sender.id;
	var message = req.body.entry[0].messaging[0].message.text;
	
	if(message == "end"){
		sendMessage(ID, "OK end");
		res.status(200).send("OK end");
		return;
	}
	
	function check() {
		getCorona1().then(function(body){
			if (oldValue != body){
				console.log("old value: " + JSON.stringify(oldValue));
				console.log("new value: " + JSON.stringify(body));
				oldValue = body;
				
				var jsonBody = JSON.parse(body);
				var returnBody;
				returnBody = "Tình hình Corona\n"
							+ "Thế giới: " + jsonBody.data.global.cases + " ca nhiễm\n"
							+ "Trong đó tử vong: " + jsonBody.data.global.deaths
							+ ", hồi phục: " + jsonBody.data.global.recovered + "\n"
							+ "---------------------------\n"
							+ "Việt Nam: " + jsonBody.data.vietnam.cases + " ca nhiễm\n"
							+ "Trong đó tử vong: " + jsonBody.data.vietnam.deaths
							+ ", hồi phục: " + jsonBody.data.vietnam.recovered;
				console.log(jsonBody.data);
				res.status(200).send(returnBody);
				
				var senderId = req.body.entry[0].messaging[0].sender.id;
				console.log(senderId)
				sendMessage(senderId, returnBody)
				
			} else {
				console.log("old value: " + JSON.stringify(oldValue));
				console.log("new value: " + JSON.stringify(body));
				console.log("equal");
			}
			
		}).catch(function(error){
			//do something on error
		})
	}
	setInterval(() => check(), 40000);
});

var interval;
app.post('/webhook3', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
	var oldValue;
	var ID = req.body.entry[0].messaging[0].sender.id;
	var message = req.body.entry[0].messaging[0].message.text;
	
	if(message == "end"){
		sendMessage(ID, "OK end");
		res.status(200).send("OK end");
		clearInterval(interval);
		return;
	}
	
	function check() {
		getTime().then(function(body){
			if (oldValue != body){
				console.log("old value: " + JSON.stringify(oldValue));
				console.log("new value: " + JSON.stringify(body));
				oldValue = body;
				
				var jsonBody = JSON.parse(body);
				var returnBody = jsonBody.unixtime;

				//res.status(200).send(returnBody);
				
				var senderId = req.body.entry[0].messaging[0].sender.id;
				console.log(senderId)
				sendMessage(senderId, returnBody)
				
			} else {
				console.log("old value: " + JSON.stringify(oldValue));
				console.log("new value: " + JSON.stringify(body));
				console.log("equal");
			}
			
		}).catch(function(error){
			//do something on error
		})
	}
	interval = setInterval(() => check(), 10000);
});



const https = require('https');

function getCorona(){
	var request = require('request');
	request('https://code.junookyo.xyz/api/ncov-moh/data.json', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		return body;
	  }
	})
}

function getTime() {
    return new Promise(function (resolve, reject) {
         request('http://worldtimeapi.org/api/timezone/America/Argentina/Salta', function(error, response, body) {
            if (error) reject(error);
            if (response.statusCode === 200) resolve(body);
})
});
}

function getCorona1() {
    return new Promise(function (resolve, reject) {
         request('https://code.junookyo.xyz/api/ncov-moh/data.json', function(error, response, body) {
            if (error) reject(error);
            if (response.statusCode === 200) resolve(body);
})
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
  }, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		console.log(body)
		return body;
	  } else {
		  console.log(body)
  }});
}
 
app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");
 
server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});