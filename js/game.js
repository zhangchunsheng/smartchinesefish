var SmartFish = (function() {
	var SmartFish = {
		fish: {
			x: 0,
			y: 0,
			width: 60,
			height: 60,
			img: new Image(),
			horizontalSpeed: 2,
			verticalSpeed: 2,
			hitEdge: false,
			getNum: false
		},
		title: {
			x: 0,
			y: 0,
			img: new Image()
		},
		startButton: {
			x: 0,
			y: 0,
			img: new Image()
		},
		backGroundImg: new Image(),
		canvasWidth: 0,
		canvasHeight: 0,
		canvas: {},
		context: {},
		circles: [],
		circlesSpeed: [],
		circle: {
			width: 40,
			height: 40,
			horizontalSpeed: 1,
			verticalSpeed: 1
		},
		coordinates: [],
		connection: {},
		nums: [],
		results: [],
		selectId: 0,
		selected: false,
		num: 0,
		isTouch: 'ontouchstart' in window,
		e_touchstart: this.isTouch ? "touchstart" : "mousedown",
		e_touchmove: this.isTouch ? "touchmove" : "mousemove",
		e_touchend: this.isTouch ? "touchend" : "mouseup"
	};
	return SmartFish;
})();

window.SmartFish = SmartFish || {};

(function(SmartFish) {
	SmartFish.init = function() {
		SmartFish.backGroundImg.src = "../images/seabed.jpg";
		SmartFish.fish.img.src = "../images/greenfish.png";
		SmartFish.canvas = SmartFish.$("canvas");
		canvas.addEventListener(SmartFish.e_touchstart, SmartFish.mousedown);
		canvas.addEventListener(SmartFish.e_touchmove, SmartFish.mousemove);
		canvas.addEventListener(SmartFish.e_touchend, SmartFish.mouseup);
		SmartFish.context = SmartFish.canvas.getContext("2d");
		SmartFish.canvasWidth = SmartFish.canvas.width;
		SmartFish.canvasHeight = SmartFish.canvas.height;
		//初始化smartfish坐标
		SmartFish.fish.x = SmartFish.getRandom(20, 400);
		SmartFish.fish.y = SmartFish.getRandom(20, 220);
		//初始化分数
		SmartFish.setScore(0);
		SmartFish.connect();
		setInterval(SmartFish.draw, 100);
	}
})(SmartFish);

//websocket
(function(SmartFish) {
	SmartFish.connect = function() {
		SmartFish.connection = new WebSocket("ws://localhost:8080");
		SmartFish.connection.onopen = SmartFish.onopen;
		SmartFish.connection.onmessage = SmartFish.onmessage;
		SmartFish.connection.onerror = SmartFish.onerror;
	}
	SmartFish.onopen = function() {
		console.log("onopen");
	}
	SmartFish.onmessage = function(message) {
		//当circles小于等于1的时候getData
		if(SmartFish.nums.length <= 1) {
			SmartFish.connection.send("getData");
			//message.data = '{"num":46,"nums":[1,45,20,26,15,31,43,3,32,14,46,0,26,20,33,13,25,21,42,4,3,43,5,41,39,7,42,4,7,39,12,34,22,24,12,34,30,16,42,4,42,4,42,4,32,14]}';
			console.log("message:" + message.data);
			SmartFish.circles = [];
			SmartFish.results = [];
			var json = eval('(' + message.data.trim() + ')');
			console.log(json);
			SmartFish.num = json.num;
			SmartFish.$("num").innerHTML = SmartFish.num;
			SmartFish.nums = json.nums;
			for(var i = 0 ; i < SmartFish.nums.length ; i++) {
				SmartFish.createCircle(SmartFish.nums[i]);
			}
		}
	}
	SmartFish.onerror = function(error) {
		console.log("error");
	}
})(SmartFish);

//绘画
(function(SmartFish) {
	SmartFish.draw = function() {
		var context = SmartFish.context;
		context.clearRect(0, 0, SmartFish.canvasWidth, SmartFish.canvasHeight);
		context.save();
		//绘制背景
		context.drawImage(SmartFish.backGroundImg, 0, 0, SmartFish.canvasWidth, SmartFish.canvasHeight);
		//绘制smartfish
		var random = SmartFish.getRandom(1, 30);
		if(!SmartFish.fish.hitEdge || !SmartFish.fish.getNum) {
			if(random == 2 || random == 6) {
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			} else if(random == 1 || random == 7) {
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
			}
		}
		SmartFish.fish.x = SmartFish.fish.x + SmartFish.fish.horizontalSpeed;
		SmartFish.fish.y = SmartFish.fish.y + SmartFish.fish.verticalSpeed;
		//console.log("SmartFish.fish.x:" + SmartFish.fish.x);
		context.translate(SmartFish.fish.x + (SmartFish.fish.width/2), SmartFish.fish.y + (SmartFish.fish.height/2));
		if(SmartFish.fish.horizontalSpeed > 0) {
			context.rotate(Math.PI);
		} else {
			context.rotate(0);
		}
		context.drawImage(SmartFish.fish.img, -(SmartFish.fish.width/2), -(SmartFish.fish.height/2), SmartFish.fish.width, SmartFish.fish.height);
		SmartFish.updateCircle();
		/*if(SmartFish.hasFishCircleCollide()) {
			SmartFish.updateFishAndCircle();
		}*/
		SmartFish.fish.hitEdge = false;
		SmartFish.hasFishHitEdge();
		context.restore();
		if(SmartFish.nums.length <= 1) {
			SmartFish.connection.send("getData");
		}
	}
	SmartFish.createCircle = function(num) {
		var count = SmartFish.circles.length;
		var circle = document.createElement('div');
		circle.id = "circle_" + count;
		circle.className = "circle";
		var coordinate = SmartFish.getXY();
		//var coordinates = SmartFish.coordinates;
		//coordinate = SmartFish.setXY(coordinate, coordinates);
		//console.log(coordinate);
		circle.style.left = coordinate.x + "px";
		circle.style.top = coordinate.y + "px";
		circle.left = coordinate.x;
		circle.top = coordinate.y;
		circle.horizontalSpeed = SmartFish.circle.horizontalSpeed;
		circle.verticalSpeed = SmartFish.circle.verticalSpeed;
		circle.hitEdge = false;
		circle.hasCollide = false;
		circle.selected = false;
		circle.hasCollided = false;//被碰撞
		circle.unselectable = "on";
		circle.num = num;
		var html = num;
		circle.innerHTML = html;
		document.body.appendChild(circle);
		SmartFish.coordinates.push(coordinate);
		circle.addEventListener(SmartFish.e_touchstart, SmartFish.circle_mousedown);
		//circle.addEventListener(SmartFish.e_touchmove, SmartFish.circle_mousemove);
		circle.addEventListener(SmartFish.e_touchend, SmartFish.circle_mouseup);
		SmartFish.circles.push(circle);
	}
	SmartFish.addCircle = function(num, id, left, top) {
		var circle = document.createElement('div');
		circle.id = id;
		circle.className = "circle";
		circle.style.left = left + "px";
		circle.style.top = top + "px";
		circle.left = left;
		circle.top = left;
		circle.horizontalSpeed = SmartFish.circle.horizontalSpeed;
		circle.verticalSpeed = SmartFish.circle.verticalSpeed;
		circle.hitEdge = false;
		circle.hasCollide = false;
		circle.selected = true;
		circle.hasCollided = false;//被碰撞
		circle.unselectable = "on";
		circle.num = num;
		var html = num;
		circle.innerHTML = html;
		document.body.appendChild(circle);
		circle.addEventListener("mousedown", SmartFish.circle_mousedown);
		//circle.addEventListener("mousemove", SmartFish.circle_mousemove);
		circle.addEventListener("mouseup", SmartFish.circle_mouseup);
		SmartFish.circles.push(circle);
		return circle;
	}
	SmartFish.updateCircle = function() {
		var random = 0;
		var left = 0;
		var top = 0;
		for(var i = 0 ; i < SmartFish.circles.length ; i++) {
			//console.log("SmartFish.circles[i].selected:" + SmartFish.circles[i].selected);
			if(SmartFish.circles[i].selected || SmartFish.circles[i].hasCollided)
				continue;
			//随机circle方向
			random = SmartFish.getRandom(1, 30);
			if(!SmartFish.circles[i].hitEdge || !SmartFish.circles[i].hasCollide) {
				if(random == 2 || random == 6) {
					SmartFish.circles[i].horizontalSpeed = -SmartFish.circles[i].horizontalSpeed;
				} else if(random == 1 || random == 7) {
					SmartFish.circles[i].verticalSpeed = -SmartFish.circles[i].verticalSpeed;
				}
			}
			//console.log("SmartFish.circles[i].horizontalSpeed: " + SmartFish.circles[i].horizontalSpeed);
			left = SmartFish.circles[i].left + SmartFish.circles[i].horizontalSpeed;
			top = SmartFish.circles[i].top + SmartFish.circles[i].verticalSpeed;
			SmartFish.circles[i].style.left = left + "px";
			SmartFish.circles[i].style.top = top + "px";
			SmartFish.circles[i].left = left;
			SmartFish.circles[i].top = top;
			SmartFish.circles[i].hitEdge = false;
			SmartFish.circles[i].hasCollide = false;
			//是否发生碰撞
			for(var j = i ; j < SmartFish.circles.length ; j++) {
				//SmartFish.hasCircleCollide(SmartFish.circles[i], SmartFish.circles[j]);
			}
			//是否到达边缘
			SmartFish.hasCircleHitEdge(SmartFish.circles[i]);
		}
	}
	SmartFish.hasFishHitEdge = function() {
		//smartfish碰到右边边界
		if(SmartFish.fish.x > SmartFish.canvasWidth - SmartFish.fish.width) {
			if(SmartFish.fish.horizontalSpeed > 0) {
				SmartFish.fish.hitEdge = true;
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			}
		}
		//smartfish碰到左边边界
		if(SmartFish.fish.x < -10) {
			if(SmartFish.fish.horizontalSpeed < 0) {
				SmartFish.fish.hitEdge = true;
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			}
		}
		//smartfish碰到下面边界
		if(SmartFish.fish.y > SmartFish.canvasHeight - SmartFish.fish.height) {
			if(SmartFish.fish.verticalSpeed > 0) {
				SmartFish.fish.hitEdge = true;
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
			}
		}
		//smartfish碰到上边边界
		if(SmartFish.fish.y < 0) {
			if(SmartFish.fish.verticalSpeed < 0) {
				SmartFish.fish.hitEdge = true;
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
			}
		}
	}
	SmartFish.hasCircleHitEdge = function(circle) {
		//circle碰到右边边界
		if(circle.left > SmartFish.canvasWidth - SmartFish.circle.width) {
			if(circle.horizontalSpeed > 0) {
				circle.hitEdge = true;
				circle.horizontalSpeed = -circle.horizontalSpeed;
			}
		}
		//circle碰到左边边界
		if(circle.left < -10) {
			if(circle.horizontalSpeed < 0) {
				circle.hitEdge = true;
				circle.horizontalSpeed = -circle.horizontalSpeed;
			}
		}
		//circle碰到下面边界
		if(circle.top > SmartFish.canvasHeight - SmartFish.circle.height) {
			if(circle.verticalSpeed > 0) {
				circle.hitEdge = true;
				circle.verticalSpeed = -circle.verticalSpeed;
			}
		}
		//circle碰到上边边界
		if(circle.top < 0) {
			if(circle.verticalSpeed < 0) {
				circle.hitEdge = true;
				circle.verticalSpeed = -circle.verticalSpeed;
			}
		}
	}
	//碰撞检测
	SmartFish.hasCircleCollide = function(circle1, circle2) {
		var x1 = circle1.left + SmartFish.circle.width / 2;
		var y1 = circle1.top + SmartFish.circle.width / 2;
		var x2 = circle2.left + SmartFish.circle.width / 2;
		var y2 = circle2.top + SmartFish.circle.width / 2;
		//a^2+b^2=c^2
		var r = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
		if(r < SmartFish.circle.width) {
			circle1.hasCollide = true;
			circle1.horizontalSpeed = -circle1.horizontalSpeed;
			circle1.verticalSpeed = -circle1.verticalSpeed;
			circle2.hasCollide = true;
			circle2.horizontalSpeed = -circle2.horizontalSpeed;
			circle2.verticalSpeed = -circle2.verticalSpeed;
		}
	}
	//获得被碰撞circle
	SmartFish.getCircleCollided = function(circle) {
		var x1 = circle.left + SmartFish.circle.width / 2;
		var y1 = circle.top + SmartFish.circle.width / 2;
		var x2 = 0;
		var y2 = 0;
		var r = 0;
		for(var i = 0 ; i < SmartFish.circles.length ; i++) {
			if(circle.id == SmartFish.circles[i].id)
				continue;
			x2 = SmartFish.circles[i].left + SmartFish.circle.width / 2;
			y2 = SmartFish.circles[i].top + SmartFish.circle.width / 2;
			r = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
			if(r < SmartFish.circle.width - 10) {
				circle.hasCollided = true;
				return SmartFish.circles[i];
			}
		}
		return null;
	}
	//smartfish和circle碰撞
	SmartFish.hasFishCircleCollide = function() {
		var flag = false;
		if(SmartFish.results.length > 0) {
			var x1 = SmartFish.fish.x + SmartFish.fish.width / 2;
			var y1 = SmartFish.fish.y + SmartFish.fish.height / 2;
			var x2 = SmartFish.results[0].left + SmartFish.circle.width / 2;
			var y2 = SmartFish.results[0].top + SmartFish.circle.width / 2;
			var r = 0;
			r = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
			console.log("r:" + r);
			if(r < (SmartFish.fish.width / 2 + SmartFish.circle.width / 2)) {
				flag = true;
			}
			if(SmartFish.results.length == 1) {
				
			} else {
				var left = SmartFish.results[1].left;
				var top = SmartFish.results[1].top;
				SmartFish.calculateFishDirection(left, top);
			}
		}
		return flag;
	}
	//重新排列数组
	SmartFish.calculateResult = function(circle1, circle2) {
		var value1 = parseInt(circle1.innerHTML);
		var value2 = parseInt(circle2.innerHTML);
		var id1 = circle1.id;
		var id2 = circle2.id;
		var left = circle1.left;
		var top = circle1.top;
		document.body.removeChild(circle1);
		document.body.removeChild(circle2);
		var circles = [];
		for(var i = 0 ; i < SmartFish.circles.length ; i++) {
			if(SmartFish.circles[i].id == id1 || SmartFish.circles[i].id == id2)
				continue;
			circles.push(SmartFish.circles[i]);
		}
		SmartFish.circles = circles;
		SmartFish.nums.shift();
		circle = SmartFish.addCircle((value1 + value2), id1, left, top);
		if((value1 + value2) == SmartFish.num) {
			SmartFish.fish.x = left;
			SmartFish.fish.y = top;
			SmartFish.results.push(circle);
			SmartFish.calculateFishDirection(left, top);
			SmartFish.updateFishAndCircle();
		} else {
			
		}
		//SmartFish.updateFishAndCircle();
	}
	//重新计算smartfish游动方向
	SmartFish.calculateFishDirection = function(left, top) {
		SmartFish.fish.getNum = true;
		//如果smartfish在左上方
		if(SmartFish.fish.x < left + SmartFish.circle.width / 2 && SmartFish.fish.y < top + SmartFish.circle.width / 2) {
			if(SmartFish.fish.horizontalSpeed < 0)
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			if(SmartFish.fish.verticalSpeed < 0)
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
		}
		//如果smartfish在右上方
		if(SmartFish.fish.x > left + SmartFish.circle.width / 2 && SmartFish.fish.y < top + SmartFish.circle.width / 2) {
			if(SmartFish.fish.horizontalSpeed > 0)
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			if(SmartFish.fish.verticalSpeed < 0)
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
		}
		//如果smartfish在左下方
		if(SmartFish.fish.x < left + SmartFish.circle.width / 2 && SmartFish.fish.y > top + SmartFish.circle.width / 2) {
			if(SmartFish.fish.horizontalSpeed < 0)
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			if(SmartFish.fish.verticalSpeed > 0)
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
		}
		//如果smartfish在右下方
		if(SmartFish.fish.x > left + SmartFish.circle.width / 2 && SmartFish.fish.y > top + SmartFish.circle.width / 2) {
			if(SmartFish.fish.horizontalSpeed > 0)
				SmartFish.fish.horizontalSpeed = -SmartFish.fish.horizontalSpeed;
			if(SmartFish.fish.verticalSpeed > 0)
				SmartFish.fish.verticalSpeed = -SmartFish.fish.verticalSpeed;
		}
	}
	//更新smartfish和circle
	SmartFish.updateFishAndCircle = function() {
		if(SmartFish.results.length > 0) {
			var circle = SmartFish.results[0];
			var id = circle.id;
			SmartFish.setScore(10);
			document.body.removeChild(circle);
			var circles = [];
			for(var i = 0 ; i < SmartFish.circles.length ; i++) {
				if(SmartFish.circles[i].id == id)
					continue;
				circles.push(SmartFish.circles[i]);
			}
			SmartFish.circles = circles;
			SmartFish.results.shift();
			SmartFish.nums.shift();
			if(SmartFish.results.length == 1) {
				SmartFish.fish.getNum = false;
			} else {
				
			}
		} else {
			SmartFish.fish.getNum = false;
		}
	}
	//获得被选中的circle
	SmartFish.getCircle = function(coordinate) {
		
	}
	//获得分数
	SmartFish.getScore = function() {
		var result = SmartFish.$("result");
		return result.dataset["score"];
	}
	//设置分数
	SmartFish.setScore = function(score) {
		var result = SmartFish.$("result");
		score = parseInt(SmartFish.getScore()) + score;
		result.dataset["score"] = score;
		result.innerHTML = "分数：" + score;
	}
})(SmartFish);

//事件
(function(SmartFish) {
	SmartFish.click = function() {
		
	}
	SmartFish.circle_mousedown = function(e) {
		//console.log(this);
		if(e.touches)
			e = e.touches[0];
		e.preventDefault();
		SmartFish.selectId = this.id;
		SmartFish.selected = true;
		startX = e.pageX;
		startY = e.pageY;
		this.selected = true;
	}
	SmartFish.circle_mousemove = function(e) {
		if(e.touches)
			e = e.touches[0];
		e.preventDefault();
		if(this.selected) {
			this.style.left = (e.x - e.offsetX) + "px";
			this.style.top = (e.y - e.offsetY) + "px";
			this.left = e.x - e.offsetX;
			this.top = e.y - e.offsetY;
			this.hitEdge = false;
			this.hasCollide = false;
		}
	}
	SmartFish.circle_mouseup = function(e) {
		if(e.touches)
			e = e.touches[0];
		e.preventDefault();
		SmartFish.selectId = "";
		SmartFish.selected = false;
		this.selected = false;
		var circle = SmartFish.getCircleCollided(this);
		if(circle) {
			SmartFish.calculateResult(this, circle);
		}
	}
	SmartFish.mousedown = function(e) {
		
	}
	SmartFish.mousemove = function(e) {
		if(e.touches)
			e = e.touches[0];
		e.preventDefault();
		if(SmartFish.selected) {
			var circle = SmartFish.$(SmartFish.selectId);
			//console.log(circle);
			//console.log("e.x: " + e.x);
			var newX = e.x - e.x;
			var newY = e.x - e.y;
			if(newX == 0) {
				circle.style.left = e.x + "px";
			} else if(newX > 0) {
				circle.style.left = (e.x + SmartFish.circle.width / 2) + "px";
			} else if(newY < 0) {
				circle.style.left = (e.x - SmartFish.circle.width / 2) + "px";
			}
			if(newY == 0) {
				circle.style.top = e.y + "px";
			} else if(newY > 0) {
				circle.style.top = (e.y + SmartFish.circle.width / 2) + "px";
			} else if(newY < 0) {
				circle.style.top = (e.y - SmartFish.circle.width / 2) + "px";
			}
			circle.left = e.x;
			circle.top = e.y;
			circle.hitEdge = false;
			circle.hasCollide = false;
		}
	}
	SmartFish.mouseup = function(e) {
		if(SmartFish.selected) {
			var circle = SmartFish.$(SmartFish.selectId);
			SmartFish.selectId = "";
			SmartFish.selected = false;
			circle.selected = false;
		}
	}
})(SmartFish);

//函数
(function(SmartFish) {
	//获得随机数
	SmartFish.getRandom = function(min, max) {
		min = (min || min === 0) ? min : 0;
		max = (max || max === 0) ? max : 0;
		return Math.floor((max - min + 1) * Math.random()) + min;
	}
	//获得坐标
	SmartFish.getXY = function() {
		var x = SmartFish.getRandom(10, 440);
		var y = SmartFish.getRandom(10, 270);
		return {x: x, y: y};
	}
	SmartFish.setXY = function(coordinate, coordinates) {
		for(var i = 0 ; i < coordinates.length ; i++) {
			if(coordinate.x > coordinates[i].x - 20 && coordinate.x < coordinates[i].x + 20) {
				var coordinate = SmartFish.getXY();
				return SmartFish.setXY(coordinate, coordinates);
			}
			if(coordinate.y > coordinates[i].y - 20 && coordinate.y < coordinates[i].y + 20) {
				var coordinate = SmartFish.getXY();
				return SmartFish.setXY(coordinate, coordinates);
			}
		}
		return coordinate;
	}
	SmartFish.$ = function(id) {
		return document.getElementById(id);
	}
})(SmartFish);

SmartFish.init();