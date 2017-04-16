const gm = require('./gameManager');

route = (ws, msg) => {
    switch (msg.type) {
        case "LOGIN":
            if (ws.session.name)
                sendJson(ws, { type: msg.type, status: 'ok', name: ws.session.name });
            else
                sendJson(ws, { type: msg.type, status: 'not login', url: 'https://www.facebook.com/v2.8/dialog/oauth?client_id=' + process.env.appID + '&redirect_uri=' + process.env.redirect + '/api/code&scope=user_posts' });
            break;
        case "CREATE":
            if (ws.session.id)
                sendJson(ws, { type: msg.type, status: 'ok', id: gm.createNewGame(ws.session.id), name: ws.session.name });
            else
                sendJson(ws, { type: msg.type, statu: "not login" });
            break;
    }
}
sendJson = (ws, msg) => {
    ws.send(JSON.stringify(msg));
}
module.exports = {
    route: route
}
