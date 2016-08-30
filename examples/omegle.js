//jshint node:true
var Omegle = require('../index');
var om = new Omegle();

om.on('omerror',function(err){
	console.log('Error: ' + err);
});

om.on('recaptchaRequired',function(challenge){
	//challenge is the link to the recaptcha image.
	console.log(challenge);
	//after solving the captcha, send the answer to omegle by calling
	// om.solveReCAPTCHA(answer);
});

om.on('gotID',function(id){
	console.log('Connected to server as: ' + id);
	setTimeout(function(){
		if(!om.connected()){
			om.stopLookingForCommonLikes(); // or you could call om.slfcl()
			console.log('Connecting to a random stranger instead...');
		}
	},5000);
});

om.on('waiting', function(){
	console.log('Waiting for a stranger.');
});

om.on('serverUpdated',function(server){
	console.log('Server updated to: ' + server);
});

om.on('connected',function(){
	console.log('Connected');
	om.startTyping();
	setTimeout(function(){
		om.stopTyping(); //It's better to check if you're still connected to the stranger when using setTimeout.
		om.send('Hey there :D');
	},3000);
});


om.on('gotMessage',function(msg){
	console.log('Stranger: ' + msg);
});

om.on('commonLikes',function(likes){
	console.log('Common likes: ' + likes);
});

om.on('typing',function(){
	console.log('Stranger is typing...');
});

om.on('stoppedTyping',function(){
	console.log('Stranger stopped typing.');
});

om.on('strangerDisconnected',function(){
	console.log('Stranger has disconnected.');
});

om.on('disconnected',function(){
	console.log('You have disconnected.');
});

var topics = ['bot','nodejs'];
om.connect(topics);

//call om.disconnect() before you call connect() again.