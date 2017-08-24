//jshint node:true
//jshint esversion:6
var request = require('request');
var ee = require('events').EventEmitter;
var util = require('util');
var qs = require('querystring');
var Omegle = function () {
	ee.call(this);
	this.useragent = 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0';
	this.language = 'en';
	var url = 'front1.omegle.com';
	var workingServers=[];
	var gotID = false;
	var isConnected = false;
	var _this = this;
	var lastEvent = ''; //stopLookingForCommonLikes only works when this is set to 'waiting'.
	var id = '';
	var typing = false;
	var challenge = ''; // to store recaptcha challenge.
	var challengeLink = '';
	//to check if the client is connected to the server
	this.connected = function () {
		return isConnected;
	};
	var randID = function () {
		var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
		var str = '';
		for (var i = 0; i < 8; ++i) str += charset.charAt(Math.floor((Math.random() * (charset.length + 1))));
		return str;
	};
	var getResponse = function (path, data, callback, method = 'POST') {
		var qsArr = ['/status', '/start']; //these paths use qs, others take urlencoded data.
		var options = {
			url: 'https://' + url + path,
			headers: {
				'User-Agent': this.useragent,
				'Connection': 'keep-alive',
				'Referer': 'http://www.omegle.com',
				'Origin': 'http://www.omegle.com',
				'Host': url,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': 0
			},
			method: method
		};
		if (qsArr.indexOf(path) > -1) {
			options['qs'] = data;
		}
		else {
			options.headers['Content-Length'] = qs.stringify(data).length;
			options['form'] = qs.stringify(data);
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				if(workingServers.indexOf(url) < 0){
					workingServers.push(url);
				}
				return callback(body, null);
			}
			else {
				var index = workingServers.indexOf(url);
				if (index > -1) {
					workingServers.splice(index, 1);	//so that we don't use it again
				}
				return callback(false, error);
			}
		});
	};
	this.connect = function (topics = false) {
		this.updateServer();
		var data = {
			rcs: 1,
			firstevents: 1,
			lang: this.language,
			randid: randID(),
			spid: ''
		};
		if (topics) data['topics'] = formatTopics(topics);
		getResponse('/start', data, function (body, error) {
			if (body) {
				id = JSON.parse(body).clientID;
				gotID = true;
				_this.emit('gotID', id);
				emitEvents(JSON.parse(body).events);
				_this.getEvents();
			}
			else _this.emit('omerror', 'connect(): ' + error);
		});
	};
	var formatTopics = function (topicsArr) {
		var top = '[';
		for (var i = 0; i < topicsArr.length; ++i) top += '"' + topicsArr[i] + '",';
		top = top.slice(0, -1);
		top += ']';
		return top;
	};
	this.getEvents = function () {
		var data = {
			id: id
		};
		if (!gotID && !isConnected) return;
		getResponse('/events', data, function (events, error) {
			if (events) {
				var ev = JSON.parse(events);
				emitEvents(ev);
				if (gotID) _this.getEvents();
			}
			else {
				_this.emit('omerror', 'getEvents(): ' + error);
				if (gotID) _this.getEvents();
			}
		});
	};
	var emitEvents = function (ev) {
		if (!ev) return;
		var eventsArr = ['waiting', 'connected', 'error', 'connectionDied', 'antinudeBanned', 'typing',
							'stoppedTyping', 'gotMessage', 'strangerDisconnected', 'recaptchaRequired',
							'recaptchaRejected', 'commonLikes'];
		for (var i = 0; i < ev.length; ++i) {
			var currentEvent = ev[i][0];
			if (eventsArr.indexOf(currentEvent) < 0) continue;
			lastEvent = currentEvent;
			if (currentEvent == 'waiting') _this.emit('waiting');
			else if (currentEvent == 'connected') {
				challengeLink = '';
				challenge = '';
				isConnected = true;
				_this.emit('connected');
			}
			else if (currentEvent == 'error') {
				reset();
				_this.emit('omegleError', +ev[i][1]);
			}
			else if (currentEvent == 'connectionDied') {
				reset();
				_this.emit('connectionDied');
			}
			else if (currentEvent == 'antinudeBanned') {
				reset();
				_this.emit('antinudeBanned');
			}
			else if (currentEvent == 'typing') {
				typing = true;
				_this.emit('typing');
			}
			else if (currentEvent == 'stoppedTyping') _this.emit('stoppedTyping');
			else if (currentEvent == 'gotMessage') {
				if (typing) _this.emit('stoppedTyping');
				for (var j = 1; j < ev[i].length; ++j) _this.emit('gotMessage', ev[i][j]);
			}
			else if (currentEvent == 'strangerDisconnected') {
				reset();
				_this.emit('strangerDisconnected');
			}
			else if (currentEvent == 'recaptchaRequired') evalCaptcha(ev[i][1]);
			else if (currentEvent == 'recaptchaRejected') evalCaptcha(ev[i][1]);
			else if (currentEvent == 'commonLikes') _this.emit('commonLikes', ev[i][1]);
		}
	};
	var evalCaptcha = function (pchallengeLink) {
		challengeLink = pchallengeLink;
		var url = 'http://www.google.com/recaptcha/api/challenge?k=' + pchallengeLink;
		request.get(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var close = body.indexOf('}');
				//I give up. JSON.parse, you have failed me, or maybe I'm just dumb.
				eval(body.substring(0, close + 1)); // jshint ignore:line
				challenge = RecaptchaState.challenge; // jshint ignore:line
				_this.emit('recaptchaRequired', 'http://www.google.com/recaptcha/api/image?c=' + challenge);
			}
		});
	};
	this.reloadReCAPTCHA = function () {
		if (challengeLink) evalCaptcha(challengeLink);
	};
	this.updateServer = function (server) {
		if (server) {
			url=server;
			return false;
		}
		getResponse('/status', {
			nocache: Math.random(),
			randid: randID()
		}, function (statusBody, error) {
			if (statusBody) {
				var response;
				try {
					response = JSON.parse(statusBody);
				}
				catch(err) {
					_this.emit('omerror', 'updateServer(): ' + err);
					return;
				}
				url = response.servers[0] + '.omegle.com';
				_this.emit('serverUpdated', url);
			}
			else {
				_this.emit('omerror', 'updateServer(): ' + error);
				//this url didn't work, if updateServer() is called again, it's going to throw this error again
				if(workingServers.length > 0){
					url = workingServers[workingServers.length - 1];
				}
			}
		}, 'GET');
	};
	this.send = function (msg) {
		if (gotID && isConnected) {
			var data = {
				msg: msg,
				id: id
			};
			getResponse('/send', data, function (body, error) {
				if (body) {
					if (body != 'win') _this.emit('omerror', 'send(): ' + body);
				}
				else _this.emit('omerror', 'send(): ' + error);
			});
		}
		else {
			_this.emit('omerror', 'send(): Not connected to ' + (gotID ? 'a stranger yet.' : 'the server.'));
		}
	};
	this.startTyping = function () {
		if (gotID && isConnected) {
			var data = {
				id: id
			};
			getResponse('/typing', data, function (body, error) {
				if (body) {
					if (body != 'win') _this.emit('omerror', 'startTyping(): Couldn\'t send the typing event. Response from server: ' + body);
				}
				else _this.emit('omerror', 'startTyping(): ' + error);
			});
		}
		else _this.emit('omerror', 'startTyping(): Couldn\'t send the typing event. Not connected to ' + (gotID ? 'a stranger yet.' : 'the server.'));
	};
	this.stopTyping = function () {
		if (gotID && isConnected) {
			var data = {
				id: id
			};
			getResponse('/stoppedtyping', data, function (body, error) {
				if (body) {
					if (body != 'win') _this.emit('omerror', 'stopTyping(): Couldn\'t send the stoppedtyping event. Response from server: ' + body);
				}
				else _this.emit('omerror', error);
			});
		}
		else _this.emit('omerror', 'stopTyping(): Couldn\'t send the stoppedtyping event. Not connected to ' + (gotID ? 'a stranger yet.' : 'the server.'));
	};
	this.stopLookingForCommonLikes = function (callback) {
		if (lastEvent == 'waiting' && !challengeLink) {
			var data = {
				id: id
			};
			getResponse('/stoplookingforcommonlikes', data, function (body, error) {
				if (body) {
					if (body != 'win') _this.emit('omerror', 'stopLookingForCommonLikes(): Something went wrong. Response from server: ' + body);
				}
				else _this.emit('omerror', error);
				if (callback) callback(body);
			});
		}
		//else
		//	_this.emit('omerror','stopLookingForCommonLikes: ' + (isConnected?'Already connected to a stranger':'Current event is not \'waiting\'. Current event: '+lastEvent));
	};
	this.slfcl = this.stopLookingForCommonLikes;
	this.disconnect = function () {
		if (gotID && isConnected) {
			var data = {
				id: id
			};
			getResponse('/disconnect', data, function (body, error) {
				if (body) {
					if (body != 'win') _this.emit('omerror', 'disconnect(): Couldn\'t send the disconnect event. Response from server: ' + body);
					reset();
				}
				else _this.emit('omerror', 'disconnect(): ' + error);
			});
		}
		else _this.emit('omerror', 'disconnect(): Couldn\'t send the disconnect event. Not connected to ' + (gotID ? 'a stranger yet.' : 'the server.'));
	};
	// I haven't tested this, because I'd first have to get banned to be able to test this, but it should work.
	// Nevermind, I got banned today, turns out I implemented recaptcha handling totally wrong. Now it's working.
	this.solveReCAPTCHA = function (answer) {
		if (gotID && challenge) {
			var data = {
				id: id,
				challenge: challenge,
				response: answer
			};
			getResponse('/recaptcha', data, function (body, error) {
				if (error) _this.emit('omerror', 'solveReCAPTCHA(): ' + error);
			});
		}
		else _this.emit('omerror', 'solveReCAPTCHA(): Not connected to the server or there\'s no ReCAPTCHA.');
	};
	var reset = function () {
		isConnected = false;
		gotID = false;
		lastEvent = '';
		id = '';
		typing = false;
		challenge = '';
		_this.emit('disconnected');
	};
	//TODO: Chat log support
};
util.inherits(Omegle, ee);
module.exports = Omegle;
