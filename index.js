var request = require('request');
var events = require('events');
var ee = new events.EventEmitter();
var qs = require('querystring');
var Omegle = function() 
	{
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
		}
		
		getResponse = function(path, data, callback, method='POST'){
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
			  method: method,
			  qs: data
			};
			if (path=='/events') {
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
				spid:'',
				};
			getResponse('/start',data, function(body,error){
				if(body)
				{
					_this.id=JSON.parse(body).clientID;
					ee.emit('gotID', _this.id);
					emitEvents(JSON.parse(body).events)
					gotID = true;
					_this.getEvents();
				}
				else
					ee.emit('omerror', error);
			});
			
		}

		this.getEvents=function(){
			var data={id:_this.id};
			
			getResponse('/events',data, function(events,error){
				if(events)
				{
					console.log('Events: '+events);
					if(gotID)
						_this.getEvents();
				}
				else
				{
					ee.emit('omerror', error);
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
					ee.emit('waiting');
				else if(a=='connected')
				{
					ee.emit('connected');
					isConnected = true;
				}
				else if(a=='error')
				{
					ee.emit('error', ev[i][1]);
					isConnected = false;
					gotID = false;
				}
				else if(a=='connectionDied')
				{
					ee.emit('connectionDied');
					isConnected = false;
					gotID = false;
				}
				else if(a=='antinudeBanned')
				{
					ee.emit('antinudeBanned');
					isConnected = false;
					gotID = false;
				}
				else if(a=='typing')
					ee.emit('typing');
				else if(a=='stoppedTyping')
					ee.emit('stoppedTyping');
				else if(a=='gotMessage')
					ee.emit('gotMessage',ev[i][1]);
				else if(a=='strangerDisconnected')
				{
					ee.emit('strangerDisconnected');
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
					ee.emit('serverUpdated', url);
				}
				else
					ee.emit('omerror', 'Couldn\'t get server list. Error: '+ error);
			},'GET');
		}
	
	}

var om = new Omegle();
om.connect();
ee.on('gotID',function(id){
	console.log('Connected to server as: ' + id);
});

ee.on('serverUpdated',function(server){
	console.log('Server updated to: ' + server);
});

ee.on('connected',function(){
	console.log('Connected');
});

ee.on('omerror',function(err){
	console.log('Omegle error: ' + err);
});