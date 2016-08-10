# omegle-node - Unofficial node.js API for Omegle

omegle-node is an unofficial API for Omegle which can be used to connect and interact with people on omegle without actually going to the website.

##Installation

    npm install omegle-node

##Usage

Check out `omegle.js` in `examples/` folder to get a hang of how this works.

    cd examples
    
    node omegle
    

###List of events

**`gotID`**: emitted when you're connected to Omegle's server (note that you're not connected to a stranger yet).

Arguments: `id` - The ID assigned to you by Omegle.

**`waiting`**: emitted when you're looking for strangers to connect to. 

**`connected`**: emitted when you're connected to a stranger.

**`typing`**: emitted when the stranger starts typing.

**`stoppedTyping`**: emitted when the stranger stops typing.

**`gotMessage`**: emitted when you receive a message

Arguments: `msg` - Received message.

###Example

```javascript
var Omegle = require('node-omegle');
var om = new Omegle(); //create an instance of `Omegle`

//This will print any errors that might get thrown by functions
om.on('omerror',function(err){
	console.log('error: ' + err);
});

//gotID is emitted when you're connected to Omegle 
om.on('gotID',function(id){
	console.log('connected to the server as: ' + id);
});

//waiting is emitted when you're waiting to connect to a stranger
om.on('waiting', function(){
	console.log('waiting for a stranger.');
});

//emitted when you're connected to a stranger
om.on('connected',function(){
	console.log('connected');
});

//emitted when you get a message
om.on('gotMessage',function(msg){
	console.log('Stranger: ' + msg);
	om.send('Hi'); //used to send a message to the stranger
});

//emitted when the stranger disconnects
om.on('strangerDisconnected',function(){
	console.log('stranger disconnected.');
});

//Once you're subscribed to all the events that you wish to listen to, 
//call connect() to connect to Omegle and start looking for a stranger.
om.connect();
```
