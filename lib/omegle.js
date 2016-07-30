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
		this.id='';
		this.count=0;
		
		this.randID = function(){
			var charset='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
			var str='';
			for(i=0; i<8; ++i)
				str+=charset.charAt(Math.floor((Math.random() * (charset.length+1))));
			return str;
		}
		
		getResponse = function(path, data, callback, method='POST'){
			var qsArr = ['/status','/start'];
			var options = {
			  url: url+path,
			  headers: {
				'User-Agent': useragent,
				'Connection': 'k_thisp-alive',
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
			try 
			{
				request(options, function (error, response, body) {
				  if (!error && response.statusCode == 200) {
					//if(path=='/events')console.log(options.qs)
					return callback(body,null);
				  }
				  else
				  {
					console.log('Error: '+ path +'\t'+error);
					return callback(false,error);
				  }
				});
			}
			catch (e)
			{
				console.log('Error sending request: ' + e);
				return callback(false,e);
			}
		}

		this.connect=function(){
			this.updateServer();
			var data = {
				rcs: 1,
				firstevents: 1,
				lang: 'en',
				group: 'unmon',
				randid: _this.randID,
				spid:''
				};
			getResponse('/start',data, function(body,error){
				if(body)
				{
					_this.id=JSON.parse(body).clientID;
					_this.emit('gotID', _this.id);
					emitEvents(JSON.parse(body).events)
					gotID = true;
					_this.getEvents();
				}
				else
					_this.emit('omerror', error);
			});
			
		}

		this.getEvents=function(){
			var data={id:_this.id};
			
			getResponse('/events',data, function(events,error){
				if(events)
				{
					var ev = JSON.parse(events);
					//console.log('Events: '+ev[0][0]);
					emitEvents(ev);
					if(gotID)
						_this.getEvents();
				}
				else
				{
					_this.emit('omerror', error);
					if(gotID)
						_this.getEvents();
				}
			});
		}
		
		var emitEvents = function(ev){
		
			for(i=0;i<ev.length;++i)
			{
				var a = ev[i][0];
				if(a=='waiting')
					_this.emit('waiting');
				else if(a=='connected')
				{
					_this.emit('connected');
					isConnected = true;
				}
				else if(a=='error')
				{
					_this.emit('error', ev[i][1]);
					isConnected = false;
					gotID = false;
				}
				else if(a=='connectionDied')
				{
					_this.emit('connectionDied');
					isConnected = false;
					gotID = false;
				}
				else if(a=='antinudeBanned')
				{
					_this.emit('antinudeBanned');
					isConnected = false;
					gotID = false;
				}
				else if(a=='typing')
					_this.emit('typing');
				else if(a=='stoppedTyping')
					_this.emit('stoppedTyping');
				else if(a=='gotMessage')
				{
					_this.emit('stoppedTyping');
					_this.emit('gotMessage',ev[i][1]);
				}
				else if(a=='strangerDisconnected')
				{
					_this.emit('strangerDisconnected');
					isConnected = false;
					gotID = false;
				}
			}
			
		
		}
		
		this.updateServer=function(){
			getResponse('/status',{nocache:Math.random(),randid:_this.randID()},function(statusBody,error){
				if(statusBody)
				{
					url='http://'+JSON.parse(statusBody).servers[0];
					_this.emit('serverUpdated', url);
				}
				else
					_this.emit('omerror', 'Couldn\'t get server list. '+ error);
			},'GET');
		}
	
		this.send = function(msg,callback){
			var data={msg:msg,id:_this.id};
			getResponse('/send',data, function(body,error){
				if(body)
				{
					if(body!='win')
						_this.emit('omerror', 'Couldn\'t send the message. Response from server: '+ body);
				}
				else
					_this.emit('omerror', error);
				
				if(callback)
					callback(body);
			});
		}
	
		this.startTyping = function(callback){
			var data={id:_this.id};
			getResponse('/typing',data, function(body,error){
				if(body)
				{
					if(body!='win')
						_this.emit('omerror', 'Couldn\'t send the typing event. Response from server: '+ body);
				}
				else
					_this.emit('omerror', error);
				
				if(callback)
					callback(body);
			});
		}
		
		this.stopTyping = function(callback){
			var data={id:_this.id};
			getResponse('/stoppedtyping',data, function(body,error){
				if(body)
				{
					if(body!='win')
						_this.emit('omerror', 'Couldn\'t send the stoppedtyping event. Response from server: '+ body);
				}
				else
					_this.emit('omerror', error);
				
				if(callback)
					callback(body);
			});
		}
	
	}

util.inherits(Omegle, ee);

module.exports = Omegle;