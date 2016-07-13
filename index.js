var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var url = 'http://front1.omegle.com/start';
var useragent = 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)';

function getResponse(path,data)
{
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

function connect()
{
	var data = {
		rcs: 1,
        firstevents: 1,
        lang: 'en'
		};
	var body = getResponse('/start',data);
	if(!body)
		eventEmitter.emit('connecting',JSON.parse(body).clientID);
}

function getEvents()
{
	var data={id:}
}

connect();

eventEmitter.on('connecting',function(id){
	console.log('Connected as: ' + id);
});

