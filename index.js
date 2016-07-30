var Omegle = require('./lib/omegle.js');
var om = new Omegle();
om.connect();
om.on('gotID',function(id){
	console.log('Connected to server as: ' + id);
});

om.on('serverUpdated',function(server){
	console.log('Server updated to: ' + server);
});

om.on('connected',function(){
	console.log('Connected');
	om.startTyping();
	om.stopTyping();
	om.send('20 f');
});

om.on('omerror',function(err){
	console.log('Omegle error: ' + err);
});

om.on('gotMessage',function(msg){
	console.log('Stranger: ' + msg);
});

om.on('typing',function(){
	console.log('Stranger is typing...');
});

om.on('stoppedTyping',function(){
	console.log('Stranger stoppped typing.');
});

om.on('strangerDisconnected',function(){
	console.log('Stranger disconnected.');
});

