console.log(Date.now()+" - Camera server booting up...");

var config = require('./config.json');
var io = require('socket.io-client');
console.log(Date.now()+" - Initiating connection...");
var socket = io.connect(config.server, {secure: true ,rejectUnauthorized: false});
var fs = require('fs');
const Raspistill = require('node-raspistill').Raspistill;

var options = {
	noFileSave: true,
	encoding: "jpg",
	width: 640,
	height: 480
};
console.log(Date.now()+" - Initiating camera...");
const camera = new Raspistill(options);
console.log(Date.now()+" - Camera ready.");
var msBetweenFrames = 3000;

socket.on("connect", () => {
	console.log(Date.now()+" - Connected to the server!");
	socket.emit("cameraJoin", {'key': config.key, 'password' : config.password});
	camera.stop();
	camera.timelapse(msBetweenFrames, 0, (image) => {
		// got image from camera, do something
		console.log(Date.now() + " - sent photo to "+config.key);
		var data = image.toString("base64");
		socket.emit("photoFromCamera",{data});
	});
});

socket.on('disconnect', (reason) => {
	console.log(Date.now()+" - Disconnected from server. Stopping camera capture.");
	camera.stop();
  if (reason === 'io server disconnect') {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
});

socket.on("requestToConnect", (receivedPW, fn) => {
	console.log("client requested to connect.");
	if (password.length > 0) {
		if (password == receivedPW) {
			fn("success");
		} else {
			fn("incorrect password");
		}
	} else { // there's no password
		fn("success");
	}
});