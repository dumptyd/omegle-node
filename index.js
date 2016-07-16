var request = require('request');
var events = require('events');
var ee = new events.EventEmitter();

var Omegle = function() 
	{
		var useragent = 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)';
		var url = 'http://front1.omegle.com';
		var _this = this;
		this.id='';
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
			
			request(options, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				return callback(body,null);
			  }
			  else
			  {
				console.log('Error: '+ path +'\n'+error);
				return callback(false,error);
			  }
			})
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
					ee.emit('gotID', body);
				}
				else
					ee.emit('error', error);
			});
			
		}

		this.getEvents=function(){
			//var data={id:}
		}
		
		this.updateServer=function()
		{
			getResponse('/status',{nocache:Math.random(),randid:_this.randID()},function(statusBody,error){
				if(statusBody)
				{
					url=JSON.parse(statusBody).servers[0];
				}
				else
					ee.emit('error', 'Couldn\'t get server list. Error: '+ error);
			},'GET');
		}
	}

var om = new Omegle();
om.connect();
ee.on('gotID',function(id){
	console.log('Connected to server as: ' + id);
});
