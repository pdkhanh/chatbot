const APP_SECRET = 'f2f2d7de0f2ecd2835d52f0cf6df1775';
const VALIDATION_TOKEN = 'TokenTuyChon';
const PAGE_ACCESS_TOKEN = 'EAANjW5tGXRgBAGUFzyTSAgrp7ZACNxBXaUIQoqp8uRTGhtqyLtBxB6fwPd3q4fLGRN31CG1bxZCRLSfcgqXSQAnUVrP3cbeOrlxI4gFfDGn3jyTsQAu5VDRK1uJnqiZCCYQnYcMPespdhcJjl5ks9ewD3LYB7J2h1biFi7ZAbcu65MF4UQCmMWRGFbniiLvFIlFi2YZB2SAZDZD';
 
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
 
app.post('/webhook', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
	try{
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
		sendMessage(senderId, returnBody);
	  }
	})}catch(ex){
		console.log(ex);
	}
	
});

const https = require('https');

function getCorona(){
	var request = require('request');
	request('https://graph.facebook.com/109954373962352/feed?message=test123&access_token=EAACEvKxJsRABABr3hwv4p9hH8d1VqncictuQwBx1FaMjZBaRBZCSlxRyWZBB0KjAwBig2nOD7DY2dKLczJZCWtjTJZBj5GOICZAlLes2kNz96HLDaAZCnXdBiIQZBaxO4NWO8V6T5cYv85tEupWSAhBLe1AOFZC8fo2M0NTue6PWj2b1QnvgUeH14bsaV1nhs0fZAKGmZAsdwtuvwZDZD', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		console.log(body)
		return body;
	  }
	})
}

function postFB(message){
	
	const id = '109954373962352';
	const access_token = 'EAACEvKxJsRABAKKALBpNZAgCplnvKqe5ugr96jQlbFZA8M2b8niq3HSzQu7i9ViE4QB8F0xNT5w4If7pXXBeQn4kSOe1sSg4L3KCZBZA1OMlvT0o6w5ZAPrSiZBURhsZA37B2inltMLg1GnCB8A4BOIjEleJEOSMJiwfZCZCHihPwo5REoe0FTaZAp975Tb6rlfZC9aX3avcCehKAZDZD';

	const postTextOptions = {
	  method: 'POST',
	  uri: `https://graph.facebook.com/v2.8/${id}/feed`,
	  qs: {
		access_token: access_token,
		message: message
	  }
	};
	console.log("loop");
	
	request(postTextOptions);
	
}

function prepareMessage(){
	
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
	  }
	});
}
 
app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");
 
server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});