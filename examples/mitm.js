//jshint node:true
var Omegle = require('../index');
var om1 = new Omegle(), om2 = new Omegle();

//-----------------------Stranger-1--------------------------//

om1.on('omerror',function(err){
	console.log('Stranger-1 error: ' + err);
});

om1.on('connected',function(){
	console.log('Stranger-1 connected');
});

om1.on('gotMessage',function(msg){
	console.log('Stranger-1: ' + msg);
	om2.send(msg);
});

om1.on('typing',function(){
	om2.startTyping();
});

om1.on('stoppedTyping',function(){
	om2.stopTyping();
});

om1.on('strangerDisconnected',function(){
	console.log('Stranger-1 disconnected.');
	om2.disconnect();
});

//-----------------------Stranger-2--------------------------//

om2.on('omerror',function(err){
	console.log('Stranger-2 error: ' + err);
});

om2.on('connected',function(){
	console.log('Stranger-2 connected');
});

om2.on('gotMessage',function(msg){
	console.log('Stranger-2: ' + msg);
	om1.send(msg);
});

om2.on('typing',function(){
	om1.startTyping();
});

om2.on('stoppedTyping',function(){
	om1.stopTyping();
});

om2.on('strangerDisconnected',function(){
	console.log('Stranger-2 disconnected.');
	om1.disconnect();
});

om1.connect();
om2.connect();