//jshint node:true
var Omegle = require('../index');
var om = new Omegle();
om.on('omerror',function(err){
	console.log('error: ' + err);
});

om.on('gotID',function(id){
	console.log('connected to the server as: ' + id);
});

om.on('waiting', function(){
	console.log('waiting for a stranger.');
});

om.on('connected',function(){
	console.log('connected');
});

om.on('gotMessage',function(msg){
	console.log('Stranger: ' + msg);
	var reverse = msg.split("").reverse().join("");
	om.send(reverse);
	console.log('Bot: '+reverse);
});

om.on('strangerDisconnected',function(){
	console.log('stranger disconnected.');
});
om.connect();
