var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var url = 'http://front1.omegle.com/start';
var useragent = 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)';


var Omegle = {
	
	this.id='';
	
	this.randID = function(){
		var charset=[];
		var str='';
		for(i=0; i<8; ++i)
	}
	
	this.getResponse = function(path,data){
		var options = {
		  url: url+path,
		  headers: {
			'User-Agent': useragent,
			'Connection': 'Keep-Alive'
		  },
		  method: 'POST',
		  qs: data
		};
		
		request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			return body;
		  }
		  else
		  {
			console.log('Error: '+ path);
			return false;
		  }
		})
	}

	this.connect=function(){
		var data = {
			rcs: 1,
			firstevents: 1,
			lang: 'en'
			};
		var body = getResponse('/start',data);
		if(!body)
		{
			this.id=JSON.parse(body).clientID;
			eventEmitter.emit('connecting');
		}
	}

	this.getEvents=function(){
		var data={id:}
	}
}

var om = new Omegle();
om.connect();
eventEmitter.on('connecting',function(){
	console.log('Connected as: ' + om.id);
});

