const APP_SECRET = 'f2f2d7de0f2ecd2835d52f0cf6df1775';
const VALIDATION_TOKEN = 'TokenTuyChon';
const PAGE_ACCESS_TOKEN = 'EAANjW5tGXRgBAISyPQXwqRe7ZAhS4ajCsbOtXZAHucYkTRLZCuZB8YHm0xxS0Ra5ZBlnbwOf3gciy6c06ZAMVWRjhQyabhUEEsh6CjjVBveGpRnqBgdqejhix78I1nzlHgYtF9sQe4EZCJdZBgglrmfEaEgBW8xpHnZC7oszKH5Pio29MFPvT8Gk2';
//const PAGE_ACCESS_TOKEN = 'EAANjW5tGXRgBALvRQc5HZAq6OdUWcuwklu8VJ6igZBLaHL9ZBctbapCVZCjelNahUkzJ1y90OkJma1JHyZBzTa69hCRVW7FCah0BN2w5YDxMLZB9UZBwL7DAsWIk295U6Vtan9JlhQjCIZCvKhQZBIIwTHApdz3L8DgI8Xf2CFCU4HQvCJlJHWqxkhgyvUgLIo3dX03IbwhEUWZCkrNlmHqSGS';
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
 
app = express().use(bodyParser.json());
var server = http.createServer(app);
var request = require("request");
var a;
var interval;
var listSender = ['3206875339325393', '4148785151801891'];
 
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
	console.log(req.body.entry[0].messaging[0].sender.id);
	console.log(req.body.entry[0].messaging[0].message.text);
});

var i = 1
app.post('/webhook3', function(req, res) {
	
	var oldValue;
	var ID = req.body.entry[0].messaging[0].sender.id;
	var message = req.body.entry[0].messaging[0].message.text;
	
	if(message == "end"){
		sendMessage(ID, "OK end");
		res.status(200).send("OK end");
		console.log("OK end");
		clearInterval(interval);
		return;
	}
	
	function check1() {
		console.log("-------" + i++ + "---------")
		getCorona1().then(function(body){
			if (oldValue != body){
				console.log("old value: " + JSON.stringify(oldValue));
				console.log("new value: " + JSON.stringify(body));
				console.log("not equal");
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
				//console.log(jsonBody.data);
				//res.status(200).send(returnBody);
				
				if(listSender.length > 0){
					listSender.forEach(senderID => {
						sendMessage(senderID, returnBody) 
						console.log("Send to " + senderID + " with message "  + returnBody)
					})
				}
				
			} else {
				console.log("old value: " + JSON.stringify(oldValue));
				console.log("new value: " + JSON.stringify(body));
				console.log("equal");
			}
			
		}).catch(function(error){
			console.log(error);
		})
	}
	//check1();
	interval = setInterval(() => check1(), 5000);
});

app.get('/checkSender', (req, res) => {
	res.send(listSender);
});

app.post('/addSender', function(req, res) {
	var id = req.body.senderid;
	res.status(200).send("Added: " + id);
	listSender.push(id)
});

app.post('/deleteSender', function(req, res) {
	var id = req.body.senderid;
	listSender = listSender.filter(item => item !== id)
	res.status(200).send("Deleted: " + id);
});

app.post('/webhook4', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
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
	//interval = setInterval(() => check(), 10000);
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
		try{
         request('http://worldtimeapi.org/api/timezone/America/Argentina/Salta', function(error, response, body) {
            if (error) reject(error);
            if (response.statusCode === 200) resolve(body);
		})}catch(ex){console.log(ex)}
});
}

function getCorona1() {
    return new Promise(function (resolve, reject) {

         request('https://code.junookyo.xyz/api/ncov-moh/data.json', function(error, response, body) {
			try{
            if (error) reject(error);
            if (response.statusCode === 200) resolve(body);
			}catch(ex){console.log(ex)}
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