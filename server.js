var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var EventEmitter = require('events');
var server = express();

server.use(bodyParser.urlencoded({ extended: false }))
server.use(express.static('./'))

var em = new EventEmitter();
em.setMaxListeners(0);

server.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
});
server.get('/sender', (req, res) => {
	res.sendFile(path.join(__dirname + '/send.html'));
});
server.post('/sender', (req, res) => {
	var msg = req.body.message;
	em.emit('newMessage', msg);
	res.send('received');
});
server.get('/ssevents', (req, res) => {
	initialiseSSE(req, res);
});

function initialiseSSE(req, res) {
	em.on('newMessage', (msg) => {
		var message = msg;
		res.write('event: ohyeah\n');
        res.write('data: ' + JSON.stringify({ msg : message }) + '\n\n');
	});

    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
    });
    res.write("retry: 10000\n\n");
}

function outputSSE(req, res, data) {
    res.write(data);
}

server.listen(4000);
