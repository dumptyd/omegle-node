# omegle-node - Unofficial node.js API for Omegle

[![NPM](https://nodei.co/npm/omegle-node.png)](https://npmjs.org/package/omegle-node)

[![npm version](https://badge.fury.io/js/omegle-node.png)](https://badge.fury.io/js/omegle-node)

omegle-node is an unofficial API for Omegle which can be used to connect and interact with people on omegle without actually going to the website.

<hr>

## Installation

    npm install omegle-node

<hr>

## Usage

Check out `examples/omegle.js` to get a hang of how this works.

    cd examples
    
    node omegle
    
    
### Events

 - **`gotID`**: emitted when you're connected to Omegle's server (note that you're not connected to a stranger yet). <br> `Argument`: `id` - The ID assigned to you by Omegle.

- **`waiting`**: emitted when you're looking for strangers to connect to. 

- **`connected`**: emitted when you're connected to a stranger.

- **`typing`**: emitted when the stranger starts typing.

- **`stoppedTyping`**: emitted when the stranger stops typing.

- **`gotMessage`**: emitted when you receive a message. <br>`Argument`: `msg` - Received message.

- **`commonLikes`**: emitted when you're connected to a stranger with matching interests. <br>`Argument`: `likes` - Array of matching interests.

- **`disconnected`**: emitted when you disconnect from the chat. This will be emitted when you call `disconnect()`. If you want to reconnect, call `connect()` again only `on` `disconnected` and `strangerDisconnected` event.

- **`strangerDisconnected`**: emitted when the stranger disconnects.
 
- **`connectionDied`**: emitted when connection to the server is lost. Results in disconnection.

- **`omegleError`**: emitted when there's an error on Omegle's side. Results in disconnection. (Note: this is different from `omerror`).<br>`Argument`: `errorMsg` - Error message.

- **`antinudeBanned`**: emitted when you get banned for bad behavior. Bans usually last for 1 to 48 hours. Results in disconnection. 

- **`recaptchaRequired`**: emitted when you're required to solve a ReCAPTCHA. <br>`Argument`: `challenge` - Link to the ReCAPTCHA image.

- **`recaptchaRejected`**: emitted when your answer to the ReCAPTCHA challenge is rejected. <br>`Argument`: `challenge` - Link to the new ReCAPTCHA image.

- **`omerror`**: emitted when there's an error on client-side. For instance, calling `send()` before calling `connect()`.<br>`Argument`: `errorMsg` - Error description. Error messages follow this pattern: `functionName(): error message`.

<hr>

### Functions

- **`connect([topics])`**: Connect to a random stranger. <br>`Argument`: `topics` - Optional. An array of *interests*.

- **`updateServer()`**: Update the server to which all the requests are made. This is called every time `connect()` is called.

- **`send(msg)`**: Send a message to the stranger. <br>`Argument`: `msg` - Message to send.

- **`startTyping()`**: Set your status to `typing`.

- **`stopTyping()`**: Set your status to `stoppedTyping`.

- **`stopLookingForCommonLikes()`**: Pretty self explanatory - Stop looking for common likes. If you hate long ungodly function names, you can use  `slfcl()`, which does the same thing too.

- **`disconnect()`**: Disconnect from the chat.

- **`solveReCAPTCHA(answer)`**: Send the answer to the ReCAPTCHA challenge to Omegle. <br>`Argument`: `answer` - Answer to the challenge.

- **`connected()`**: Returns a boolean value specifying whether you're currently connected to a stranger.

- **`reloadReCAPTCHA()`**: It seems like Omegle has gotten rid of `recaptchaRejected`, so the only way to know whether your ReCAPTCHA answer has been rejected is if you don't get connected to a stranger within a few seconds of submitting your answer. Use this function to reload ReCAPTCHA.
  
  
<hr>

### Variables

- **`useragent`**: Set or get the useragent.

- **`language`**: Set or get the language you speak. Default is `en`.
<hr>

### Example

```javascript
var Omegle = require('omegle-node');
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
<hr>
<br>

## Example scripts

The `examples/` folder contains three scripts:

- **`omegle.js`** - A full-fledged script to demonstrate how the module works.
- **`mitm.js`** - Script showcasing the MITM attack to eavesdrop on two strangers' conversation.
- **`reverse-bot.js`** - An Omegle bot that reverses the received messages and sends them back to the stranger.

<hr><br>

## Please do not use this to create spam bots, there are already enough of those on Omegle.
