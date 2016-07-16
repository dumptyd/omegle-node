var request = require('request');
var events = require('events');
var ee = new events.EventEmitter();

var Omegle = function() 
	{
		var useragent = 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)';
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
				'Connection': 'Keep-Alive'
			  },
			  method: method,
			  qs: data
			};
			try 
			{
				request(options, function (error, response, body) {
				  if (!error && response.statusCode == 200) {
					return callback(body,null);
				  }
				  else
				  {
					console.log('Error: '+ path +'\n'+error);
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
				group: 'unmon'
				};
			getResponse('/start',data, function(body,error){
				if(body)
				{
					this.id=JSON.parse(body).clientID;
					ee.emit('gotID', this.id);
					emitEvents(JSON.parse(body).events)
					gotID = true;
				}
				else
					ee.emit('omerror', error);
			});
			
		}

		this.getEvents=function(){
			//var data={id:}
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
		
		this.updateServer=function()
		{
			getResponse('/status',{nocache:Math.random(),randid:_this.randID()},function(statusBody,error){
				if(statusBody)
				{
					url=JSON.parse(statusBody).servers[0];
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

ee.on('omerror',function(err){
	console.log('Omegle error: ' + err);
});
