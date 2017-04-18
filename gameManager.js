var shortid = require('shortid');
var axios = require('axios');
var sh
var gamelist = [];
cleargame = () => {
    gamelist.forEach((g, i, l) => {
        if (g.expire < (new Date()).getTime()) {
            l.splice(index, 1);
        }
    });
    setTimeout(cleargame, 5 * 60 * 1000);
}
cleargame();
createNewGame = (ws) => {
    var id = shortid.generate();
    gamelist.push({
        id: id,
        host: ws.session.fbid,
        expire: (new Date()).getTime() + 10 * 60 * 1000, // 10 分鐘後到期,
        players: [],
        status: 'wait',
        ws: []
    });
    return id;
}
joinGame = (ws, gameid) => {
    return new Promise((resolve) => {
        var game = null;
        gamelist.forEach((g) => {
            if (g.id == gameid) {
                game = g;
            }
        })
        if (game == null) {
            resolve({ status: 'id not found' });
            return;
        }
        if (game.status == 'wait' && game.players.length <= 2) {
            checkFriend(ws.session.key, ws.session.fbid, game.host).then((data) => {
                if (data) {
                    game.players.push({ name: ws.session.name, id: ws.session.fbid });
                    game.ws.push(ws);
                    //console.log(game);
                    if (game.players.length == 2) {
                        resolve({ status: 'ok', notify: game.ws, players: game.players, todo: "notify" });
                    }
                    else
                        resolve({ status: 'ok', notify: game.ws, players: game.players, todo: "" });

                }
                else
                    resolve({ status: 'not friend' });
            })
        }
        else
            resolve({ status: 'can not join' });

    });

}
checkFriend = (token, fbid, target) => {
    return new Promise((resolve) => {
        if (fbid == target) {
            resolve(true);
        }
        else {
            var params = {
                access_token: token,
                uid: target
            };
            axios.get('https://graph.facebook.com/v2.8/me/friends', { params }).then((res) => {
                console.log(res.data);
                resolve(res.data.data.length > 0);
            })

        }

    });

}
info = (ws, gameid) => {
    return new Promise((resolve) => {
        var game = null;
        gamelist.forEach((g) => {
            if (g.id == gameid) {
                game = g;
            }
        })
        if (game == null) {
            resolve({ data: { status: 'id not found' } });
            return;
        }
        var find = false;
        game.players.forEach((p) => {
            if (p.id == ws.session.fbid && p.ws == null && !find) {
                find = true;
                p.ws = ws;
                var sendinfo = [{ name: game.players[0].name, id: game.players[0].id },
                { name: game.players[1].name, id: game.players[1].id }];
                if (game.players[0].ws && game.players[1].ws) {
                    // 開始準備題目
                    resolve({ data: { status: 'ok', players: sendinfo }, todo: "notify", ws: [game.players[0].ws, game.players[1].ws] });
                }
                else {
                    resolve({ data: { status: 'ok', players: sendinfo }, todo: "" });
                }
            }
        })
        resolve({ data: { status: 'not join' } });


    });
}
module.exports = {
    createNewGame,
    joinGame,
    info
}
