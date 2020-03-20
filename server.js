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
const https = require('https');
var interval;
var interval2;
var listSender = ['3206875339325393', '4148785151801891'];
var oldValue;
var oldData;
var count = 0

app.get('/', (req, res) => {
    res.send("Home page. Server running okay.");
});

app.get('/webhook', function(req, res) { // Đây là path để validate tooken bên app facebook gửi qua
    if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

app.post('/webhook69', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
    console.log(req.body.entry[0].messaging[0].sender.id);
    console.log(req.body.entry[0].messaging[0].message.text);
    execute(req, res);
    res.status(200).send("OK");
});

app.post('/webhook3', function(req, res) {
    var oldValue;
    var ID = req.body.entry[0].messaging[0].sender.id;
    var message = req.body.entry[0].messaging[0].message.text;

    if (message == "end") {
        sendMessage(ID, "OK end");
        res.status(200).send("OK end");
        console.log("OK end");
        clearInterval(interval);
		clearInterval(interval2);
        return;
    }

    function checkCountry() {
        console.log("-------" + count++ + "---------")
        getCorona().then(function(body) {
            if (oldValue != body) {
                console.log("old value: " + JSON.stringify(oldValue));
                console.log("new value: " + JSON.stringify(body));
                console.log("not equal");
                oldValue = body;

                var jsonBody = JSON.parse(body);
                var returnBody;
                returnBody = "Tình hình Corona\n" +
                    "Thế giới: " + jsonBody.data.global.cases + " ca nhiễm\n" +
                    "Trong đó tử vong: " + jsonBody.data.global.deaths +
                    ", hồi phục: " + jsonBody.data.global.recovered + "\n" +
                    "---------------------------\n" +
                    "Việt Nam: " + jsonBody.data.vietnam.cases + " ca nhiễm\n" +
                    "Trong đó tử vong: " + jsonBody.data.vietnam.deaths +
                    ", hồi phục: " + jsonBody.data.vietnam.recovered;
                //console.log(jsonBody.data);
                //res.status(200).send(returnBody);

                if (listSender.length > 0) {
                    listSender.forEach(senderID => {
                        sendMessage(senderID, returnBody)
                        console.log("Send to " + senderID + " with message " + returnBody)
                    })
                }
            } else {
                console.log("old value: " + JSON.stringify(oldValue));
                console.log("new value: " + JSON.stringify(body));
                console.log("equal");
            }

        }).catch(function(error) {
            console.log(error);
        })
    }
    //checkCountry();
    interval = setInterval(() => checkCountry(), 5000);
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

function execute(req, res) {
    var ID = req.body.entry[0].messaging[0].sender.id;
    var message = req.body.entry[0].messaging[0].message.text;

    if (message == "end") {
        sendMessage(ID, "OK end");
        //res.status(200).send("OK end");
        console.log("OK end");
        clearInterval(interval);
        return;
    }
    check();
    callMainPage()
    interval = setInterval(() => check(), 60000);
    interval2 = setInterval(() => callMainPage(), 1800000);
}


function check() {
    console.log("-------" + i++ + "---------")
    getCorona().then(function(body) {
        if (oldValue != body) {
            console.log("old value: " + JSON.stringify(oldValue));
            console.log("new value: " + JSON.stringify(body));
            console.log("not equal");
            oldValue = body;

            var jsonBody = JSON.parse(body);
            var returnBody;
            returnBody = "Tình hình Corona\n" +
                "Thế giới: " + jsonBody.data.global.cases + " ca nhiễm\n" +
                "Trong đó tử vong: " + jsonBody.data.global.deaths +
                ", hồi phục: " + jsonBody.data.global.recovered + "\n" +
                "---------------------------\n" +
                "Việt Nam: " + jsonBody.data.vietnam.cases + " ca nhiễm\n" +
                "Trong đó tử vong: " + jsonBody.data.vietnam.deaths +
                ", hồi phục: " + jsonBody.data.vietnam.recovered;

            if (listSender.length > 0) {
                listSender.forEach(senderID => {
                    sendMessage(senderID, returnBody)
                    console.log("Send to " + senderID + " with message \n" + returnBody)
                })
            }

        } else {
            console.log("old value: " + JSON.stringify(oldValue));
            console.log("new value: " + JSON.stringify(body));
            console.log("equal");
        }

    }).catch(function(error) {
        console.log(error);
    })
}

function getTime() {
    return new Promise(function(resolve, reject) {
        try {
            request('http://worldtimeapi.org/api/timezone/America/Argentina/Salta', function(error, response, body) {
                if (error) reject(error);
                if (response.statusCode === 200) resolve(body);
            })
        } catch (ex) {
            console.log(ex)
        }
    });
}

function getCorona() {
    return new Promise(function(resolve, reject) {
        request('https://code.junookyo.xyz/api/ncov-moh/data.json', function(error, response, body) {
            try {
                if (error) reject(error);
                if (response.statusCode === 200) resolve(body);
            } catch (ex) {
                console.log(ex)
            }
        })
    });
}

function callMainPage() {
    return new Promise(function(resolve, reject) {
        request('https://mata123.herokuapp.com/', function(error, response, body) {
            try {
                if (error) reject(error);
                console.log(body);
                if (response.statusCode === 200) resolve(body);
            } catch (ex) {
                console.log(ex)
            }
        })
    });
}

function getCorona1() {
    return new Promise(function(resolve, reject) {
        request('https://coronavirus-19-api.herokuapp.com/countries', function(error, response, body) {
            try {
                if (error) reject(error);
                if (response.statusCode === 200) resolve(body);
            } catch (ex) {
                console.log(ex)
            }
        })
    });
}

app.get('/test1', function(req, res) {
    var oldData = [{
        "country": "China",
        "cases": 80894,
        "todayCases": 12,
        "deaths": 3237,
        "todayDeaths": 11,
        "recovered": 69614,
        "active": 8043,
        "critical": 2622
    }, {
        "country": "Italy",
        "cases": 31506,
        "todayCases": 0,
        "deaths": 2503,
        "todayDeaths": 0,
        "recovered": 2941,
        "active": 26062,
        "critical": 2060
    }]
    var newData = [{
        "country": "China",
        "cases": 80894,
        "todayCases": 13,
        "deaths": 3237,
        "todayDeaths": 11,
        "recovered": 69614,
        "active": 8043,
        "critical": 2622
    }, {
        "country": "Italy",
        "cases": 31506,
        "todayCases": 0,
        "deaths": 2503,
        "todayDeaths": 0,
        "recovered": 2941,
        "active": 26062,
        "critical": 2060
    }]
    //console.log(obj1[1])
    //console.log(obj2[1])
	var message = "Corona\n"
	var isUpdated = false;
	    for (i = 0; i < oldData.length; i++) {
			for(j=0; j< newData.length; j++){
				if ((JSON.stringify(oldData[i]) != JSON.stringify(newData[j])) && (oldData[i].country == newData[j].country)) {
					console.log("Old data: " + JSON.stringify(oldData[i]));
					console.log("New data: " + JSON.stringify(newData[j]));
					var oldObject = JSON.parse(JSON.stringify(oldData[i]));
					var newObject = JSON.parse(JSON.stringify(newData[j]));
					Object.keys(oldObject).forEach(function(key) {
						var textMessage = "";
						var upperCase = key.charAt(0).toUpperCase() + key.substring(1);
						if(oldObject[key] != newObject[key]){
							isUpdated = true;
							textMessage += upperCase + ": " + oldObject[key] + " -> " + newObject[key] + "\n";
						}else {
							textMessage += upperCase + ": " + oldObject[key] + "\n";
						}
						message += textMessage;
					})
					message += "----------\n";
					break;

            }
			}
        }
					if(isUpdated){
				sendMessage(listSender[0], message);
			}
    //execute1(req, res);
	console.log(message);
	
    res.status(200).send(message);
});


app.post('/webhook', function(req, res) {
    execute1(req, res);
    res.status(200).send("OK");
});

function execute1(req, res) {
	var ID = req.body.entry[0].messaging[0].sender.id;
    var message = req.body.entry[0].messaging[0].message.text;

    if (message == "end") {
        sendMessage(ID, "OK end");
        console.log("OK end");
        clearInterval(interval);
		clearInterval(interval2);
        return;
    }
    checkCountry();
    callMainPage()
    interval = setInterval(() => checkCountry(), 30000);
    interval2 = setInterval(() => callMainPage(), 1800000);
}

function checkCountry() {
    console.log("-------" + count++ + "---------")
    getCorona1().then(function(body) {
        var newData = JSON.parse(body);
        if (oldData == null) {
            oldData = newData;
            return;
        }
		if (newData == null) {
            return;
        }
		var isUpdated = false;
		var message = "<--- Corona status --->\n";
	    for (i = 0; i < oldData.length; i++) {
			for(j=0; j< newData.length; j++){
				if ((JSON.stringify(oldData[i]) != JSON.stringify(newData[j])) && (oldData[i].country == newData[j].country)) {
					console.log("Old data: " + JSON.stringify(oldData[i]));
					console.log("New data: " + JSON.stringify(newData[j]));
					var oldObject = JSON.parse(JSON.stringify(oldData[i]));
					var newObject = JSON.parse(JSON.stringify(newData[j]));
					Object.keys(oldObject).forEach(function(key) {
						var textMessage = "";
						var upperCase = key.charAt(0).toUpperCase() + key.substring(1);
						if(oldObject[key] != newObject[key]){
							isUpdated = true;
							textMessage += upperCase + ": " + oldObject[key] + " -> " + newObject[key] + "\n";
						}else {
							textMessage += upperCase + ": " + oldObject[key] + "\n";
						}
						message += textMessage;
					})
					message += "----------\n";
					break;

            }
			}

        }
		if(isUpdated){
			sendMessage(listSender[0], message);
		}
		oldData = newData;
    }).catch(function(error) {
        console.log(error);
    })
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
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
            return body;
        } else {
			sendMessage(senderId, "sending with error" + body)
            console.log(body)
        }
    });
}

app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
    console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});
