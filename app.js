var express = require('express');
var http = require('http');
var session = require('express-session');
var request = require('request');
var app = express();
var WebSocket = require('ws');
var wsc = require('./wsConnect');
var port = process.env.port || 1337;
var sessionParser = session({
    secret: process.env.sessionKEY,
    cookie: {
        maxAge: 10 * 60 * 1000
    },
    resave: true,
    saveUninitialized: true
});
app.use(sessionParser);
app.get('/api/code', (req, res) => {
    request('https://graph.facebook.com/v2.8/oauth/access_token?client_id=' + process.env.appID + '&redirect_uri=' + process.env.redirect + '/api/code?id=' + req.query.id + '&client_secret=' + process.env.appKEY + '&code=' + req.query.code, (error, response, body) => {
        
        var userdata = JSON.parse(body);
        req.session.key = userdata.access_token;
        /*  */
        getUser(userdata.access_token).then((data) => {
            req.session.name = data.name;
            req.session.fbid = data.id;
            var url = (req.query.id != 'undefined')? '../?id=' + req.query.id : '../';
            res.redirect(url);
        });
    });
});
function getUser(key) {
    return new Promise((resolve, reject) => {
        request('https://graph.facebook.com/v2.8/me?fields=id%2Cname&access_token=' + key, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    });
}
app.use('/', express.static('static'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });
wss.on('connection', function connection(ws) {
    sessionParser(ws.upgradeReq, {}, function () {
        var session = ws.upgradeReq.session;
        ws.session = session;
    });
    //################# 1. 伺服器接收到'message'指令之後要做的事 #################
    ws.on('message', function incoming(data) {
        var msg = { type: null };
        try {
            msg = JSON.parse(data);
        } catch (e) { }
        if (msg.type == null) {
            ws.close();
        }
        else {
            wsc.route(ws, msg);
        }

    });
    //  
});

server.listen(port, function listening() {
    console.log('Listening on %d', server.address().port);
});
