const gm = require('./gameManager');

route = (ws, msg) => {
    switch (msg.type) {
        case "LOGIN":
            if (ws.session.name)
                sendJson(ws, { type: msg.type, status: 'ok', name: ws.session.name });
            else
                sendJson(ws, { type: msg.type, status: 'not login', url: 'https://www.facebook.com/v2.8/dialog/oauth?client_id=' + process.env.appID + '&redirect_uri=' + process.env.redirect + '/api/code?id=' + msg.game + '&scope=user_friends,user_birthday,user_photos' });
            break;
        case "CREATE":
            if (ws.session.name)
                //################# 4. 使用createNewGame( )function，來開一個新遊戲 #################
                sendJson(ws, { type: msg.type, status: 'ok', id: gm.createNewGame(ws), name: ws.session.name });
                //
            else
                sendJson(ws, { type: msg.type, status: "not login" });
            break;
        case "JOIN":
            if (msg.game && ws.session.name) {
                //################# 5. 利用joinGame()function來加入遊戲 #################
                gm.joinGame(ws, msg.game).then((d) => {
                    ws.session.game = msg.game;
                    sendJson(ws, { type: msg.type, status: d.status, id: msg.game });
                    //################# 6. 檢查todo變數 #################
                    if (d.todo == 'notify') {
                        d.notify.forEach((wsToNotify) => {
                            sendJson(wsToNotify, { type: "MATCH", players: d.players });
                        })
                    }
                    //
                });
                //  

            } else {
                sendJson(ws, { type: msg.type, status: "not login or no game id" });
            }
            break;
        case "INFO":
            if (ws.session.name && msg.game) {
                //################# 9. 登入配對完成之後，前端會傳INFO的訊息給伺服器，當兩個玩家都登入後，伺服器開始出題目createQuestion() #################
                gm.info(ws, msg.game).then((d) => {
                    d.data.type = msg.type;
                    ws.gameid = msg.game;
                    sendJson(ws, d.data);
                    if (d.todo == "notify") {
                        sendJson(d.ws[0], { type: "COMPUTING" });
                        sendJson(d.ws[1], { type: "COMPUTING" });
                        gm.createQuestions(msg.game).then(notifyGetReady);
                    }
                });
                //
            }
            break;
        case "READY":
            gm.ready(ws).then((d) => {
                if (d.todo == "notify") {
                    sendJson(d.ws[0], { type: "START", delay: 5 });
                    sendJson(d.ws[1], { type: "START", delay: 5 });
                    setTimeout(sendQuestion, 6000, ws.gameid);
                }
            });
            break;
        case "ANSWER":
            //################# 10. 玩家回答完問題之後要做的事情 #################
            gm.solveQuestion(ws, msg.choose).then((data) => {
                if (data) {
                    var g = gm.getGameByID(ws.gameid);
                    setTimeout(sendResult, 1000, g, g.nowquestion);
                }
            }).catch((e) => { });
            //
            break;
    }
}
sendResult = (game, nq) => {
    if (game.nowquestion == nq) {
        //################# 11. 先拿到所有答題的結果，再傳給兩個玩家 #################
        var re = { type: "RESULT", data: gm.getResult(game) };
        for (var i = 0; i < 2; i++) {
            re.id = i;
            sendJson(game.players[i].ws, re);
        }
        //
        //################# 12. 兩秒之後出下一題 #################
        setTimeout(sendQuestion, 2000, game.id);
        //
    }
}
sendQuestion = (gameid) => {
    gm.getQuestion(gameid).then((data) => {
        if (data != null) {
            //################# 13. 拿一個新的題目之後傳給玩家 #################
            var s = {
                type: "QUESTION",
                time: data.que.time,
                que: data.que.description,
                ans: data.que.ans,
                id: data.que.id
            };
            sendJson(data.d[0], s);
            sendJson(data.d[1], s);
            var g = gm.getGameByID(gameid);
            setTimeout(sendResult, s.time * 1000, g, g.nowquestion);
            ///
        }
        else {
            //################# 14. 題目都拿完時，用getEndResul() 回傳總分 #################
            var game = gm.getGameByID(gameid);
            var re = { type: "END", data: gm.getEndResult(game) };
            for (var i = 0; i < 2; i++) {
                re.id = i;
                sendJson(game.players[i].ws, re);
            }
            //

        }

    });
}
notifyGetReady = (data) => {
    var s = (data.status == "ok") ? { type: "COMPUTING", finish: true } : { type: "COMPUTING", finish: false };
    sendJson(data.game.players[0].ws, s);
    sendJson(data.game.players[1].ws, s);
}



sendJson = (ws, msg) => {
    ws.send(JSON.stringify(msg));
}
module.exports = {
    route: route
}
