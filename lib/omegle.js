var request = require('request');
var ee = require('events').EventEmitter;
var util = require('util');
var qs = require('querystring');

var Omegle = function() 
	{
		ee.call(this);
		var useragent = 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0';
		var url = 'http://front1.omegle.com';
		var gotID = false;
		var isConnected = false;
		var _this = this;
		var lastEvent = 'aaa';
		this.id='';
		var typing = false;
		var randID = function(){
			var charset='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
			var str='';
			for(i=0; i<8; ++i)
				str+=charset.charAt(Math.floor((Math.random() * (charset.length+1))));
			return str;
		}
		
		var getResponse = function(path, data, callback, method='POST'){
			var qsArr = ['/status','/start'];
			var options = {
			  url: url+path,
			  headers: {
				'User-Agent': useragent,
				'Connection': 'keep-alive',
				'Referer' : 'http://www.omegle.com',
				'Origin' :'http://www.omegle.com',
				'Host' : url,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length' : 0
			  },
			  method: method
			};
			if (qsArr.indexOf(path)>-1)
			{
				options['qs'] = data;
			}
			else
			{
				options.headers['Content-Length'] = qs.stringify(data).length;
				options['form'] = qs.stringify(data);
			}
		
			request(options, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				//if(path=='/events')console.log(options.qs)
				return callback(body,null);
			  }
			  else
			  {
				//console.log('Error: '+ path +'\t'+error);
				return callback(false,error);
			  }
			});
		}

		this.connect=function(){
			this.updateServer();
			var data = {
				rcs: 1,
				firstevents: 1,
				lang: 'en',
				randid: randID(),
				spid:''
				};
			getResponse('/start',data, function(body,error){
				if(body)
				{
					_this.id=JSON.parse(body).clientID;
					gotID = true;
					_this.emit('gotID', _this.id);
					emitEvents(JSON.parse(body).events)
					_this.getEvents();
				}
				else
					_this.emit('omerror', 'connect(): '+error);
			});
		}

		this.getEvents=function(){
			var data={id:_this.id};
			
			getResponse('/events',data, function(events,error){
				if(events)
				{
					var ev = JSON.parse(events);
					//console.log('Events: '+ev);
					emitEvents(ev);
					if(gotID)
						_this.getEvents();
				}
				else
				{
					_this.emit('omerror', 'getEvents(): '+error);
					if(gotID)
						_this.getEvents();
				}
			});
		}
		
		var emitEvents = function(ev){
		
			for(i=0;i<ev.length;++i)
			{
				var currentEvent = ev[i][0];
				lastEvent = currentEvent;
				if(currentEvent=='waiting')
					_this.emit('waiting');
				else if(currentEvent=='connected')
				{
					isConnected = true;
					_this.emit('connected');
				}
				else if(currentEvent=='error')
				{
					isConnected = false;
					gotID = false;
					_this.emit('error', ev[i][1]);
				}
				else if(currentEvent=='connectionDied')
				{
					isConnected = false;
					gotID = false;
					_this.emit('connectionDied');
				}
				else if(currentEvent=='antinudeBanned')
				{
					isConnected = false;
					gotID = false;
					_this.emit('antinudeBanned');
				}
				else if(currentEvent=='typing')
				{
					typing = true;
					_this.emit('typing');
				}
				else if(currentEvent=='stoppedTyping')
					_this.emit('stoppedTyping');
				else if(currentEvent=='gotMessage')
				{
					if(typing)
						_this.emit('stoppedTyping');
					_this.emit('gotMessage',ev[i][1]);
				}
				else if(currentEvent=='strangerDisconnected')
				{
					isConnected = false;
					gotID = false;
					_this.emit('strangerDisconnected');
				}
				
			}
		
		}
		
		this.updateServer=function(){
			getResponse('/status',{nocache:Math.random(),randid:randID()},function(statusBody,error){
				if(statusBody)
				{
					url='http://'+JSON.parse(statusBody).servers[0];
					_this.emit('serverUpdated', url);
				}
				else
				{
					_this.emit('omerror', 'updateServer(): '+ error);
				}
			},'GET');
		}
	
		this.send = function(msg){
			if(gotID&&isConnected)
			{
				var data={msg:msg,id:_this.id};
				getResponse('/send',data, function(body,error){
					if(body)
					{
						if(body!='win')
							_this.emit('omerror', 'send(): '+ body);
					}
					else
						_this.emit('omerror', 'send(): '+error);
				});
			}
			else
			{
				_this.emit('omerror', 'send(): Not connected to '+(gotID?'a stranger yet.':'the server.'));
			}
		}
	
		this.startTyping = function(){
			if(gotID&&isConnected)
			{
				var data={id:_this.id};
				getResponse('/typing',data, function(body,error){
					if(body)
					{
						if(body!='win')
							_this.emit('omerror', 'Couldn\'t send the typing event. Response from server: '+ body);
					}
					else
						_this.emit('omerror', error);
				});
			}
			else
				_this.emit('omerror', 'Couldn\'t send the typing event. Not connected to '+(gotID?'a stranger yet.':'the server.'));
		}
		
		this.stopTyping = function(){
			if(gotID&&isConnected)
			{
				var data={id:_this.id};
				getResponse('/stoppedtyping',data, function(body,error){
					if(body)
					{
						if(body!='win')
							_this.emit('omerror', 'Couldn\'t send the stoppedtyping event. Response from server: '+ body);
					}
					else
						_this.emit('omerror', error);
				});
			}
			else
				_this.emit('omerror', 'Couldn\'t send the stoppedtyping event. Not connected to '+(gotID?'a stranger yet.':'the server.'));
		}
		
		this.stopLookingForCommonLikes = function(callback){
			if(lastEvent=='waiting')
			{
				var data={id:_this.id};
				getResponse('/stoplookingforcommonlikes',data, function(body,error){
					if(body)
					{
						if(body!='win')
							_this.emit('omerror', 'Something went wrong. Response from server: '+ body);
					}
					else
						_this.emit('omerror', error);
					
					if(callback)
						callback(body);
				});
			}
			else
				_this.emit('omerror','stopLookingForCommonLikes: ' + lastEvent +  (isConnected?'Already connected to a stranger':'Current event is not \'waiting\'. Current event: '+lastEvent));
		}
	
		this.slfcl = this.stopLookingForCommonLikes;
		
		this.disconnect = function(){
			if(gotID&&isConnected)
			{
				var data={id:_this.id};
				getResponse('/disconnect',data, function(body,error){
					if(body)
					{
						if(body!='win')
							_this.emit('omerror', 'Couldn\'t send the disconnect event. Response from server: '+ body);
						isConnected = false;
						gotID = false;
					}
					else
						_this.emit('omerror', error);
				});
			}
			else
				_this.emit('omerror', 'Couldn\'t send the disconnect event. Not connected to '+(gotID?'a stranger yet.':'the server.'));
		}
		
	}

util.inherits(Omegle, ee);

module.exports = Omegle;