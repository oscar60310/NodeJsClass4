const gm = require('./gameManager');

route = (ws, msg) => {
    switch (msg.type) {
        case "LOGIN":
            if (ws.session.name)
                sendJson(ws, { type: msg.type, status: 'ok', name: ws.session.name });
            else
                sendJson(ws, { type: msg.type, status: 'not login', url: 'https://www.facebook.com/v2.8/dialog/oauth?client_id=' + process.env.appID + '&redirect_uri=' + process.env.redirect + '/api/code?id=' + msg.game + '&scope=user_posts,user_friends' });
            break;
        case "CREATE":
            if (ws.session.name)
                sendJson(ws, { type: msg.type, status: 'ok', id: gm.createNewGame(ws), name: ws.session.name });
            else
                sendJson(ws, { type: msg.type, status: "not login" });
            break;
        case "JOIN":
            if (msg.game && ws.session.name) {
                gm.joinGame(ws, msg.game).then((d) => {
                    ws.session.game = msg.game;
                    sendJson(ws, { type: msg.type, status: d.status, id: msg.game });
                    if (d.todo == 'notify') {
                        d.notify.forEach((wsToNotify) => {
                            sendJson(wsToNotify, { type: "MATCH", players: d.players });
                        })
                    }
                });

            } else {
                sendJson(ws, { type: msg.type, status: "not login or no game id" });
            }
            break;
        case "INFO":
            if (ws.session.name && msg.game) {
                gm.info(ws,msg.game).then((d) => {
                    d.data.type = msg.type;
                    sendJson(ws,d.data);
                    if(d.todo == "notify"){
                        sendJson(d.ws[0], {type:"COMPUTING"});
                        sendJson(d.ws[1], {type:"COMPUTING"});
                    }
                });
            }
            break;
    }
}
sendJson = (ws, msg) => {
    ws.send(JSON.stringify(msg));
}
module.exports = {
    route: route
}
