var sys = require("util"),
	ws = require("./lib/ws/server");
	
var server = ws.createServer({debug:true});

var num = getRandom(10, 20);
var nums = [];
var json = "";

function getRandom(min, max) {
	min = (min || min === 0) ? min : 0;
	max = (max || max === 0) ? max : 0;
	return Math.floor((max - min + 1) * Math.random()) + min;
}

function getNums(num) {
	var nums = [];
	var count = Math.floor(num / 2);
	if(num % 2 == 0) {
		count = Math.floor(num / 2);
	} else {
		nums.push(num);
		count = Math.floor((num - 1) / 2);
	}
	var num1 = 0;
	var num2 = 0;
	for(var i = 0 ; i < count ; i++) {
		num1 = getRandom(1, num - 1);
		nums.push(num1);
		num2 = num - num1;
		nums.push(num2);
	}
	return nums;
}

// Handle WebSocket Requests
server.addListener("connection", function(conn) {
	conn.send("Connection: " + conn.id);
	
	conn.addListener("message", function(message) {
		//conn.broadcast("<" + conn.id + ">" + message);
		//console.log("<" + conn.id + ">" + message);
		if(message == "getData") {
			nums = getNums(num);
			json = '{"num":' + num + ',"nums":[';
			for(var i = 0 ; i < nums.length ; i++) {
				json += nums[i] + ",";
			}
			json = json.substr(0, json.length - 1);
			json += ']}';
			server.broadcast(json);
		}
		if(message == "error") {
			conn.emit("error", "test");
		}
	});
});

server.addListener("error", function() {
	console.log(Array.prototype.join.call(arguments, ", "));
});

server.addListener("disconnected", function() {
	server.broadcast("<" + conn.id + "> disconnected");
});

server.listen(8080);