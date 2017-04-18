var shortid = require('shortid');
var axios = require('axios');
var sh
var gamelist = [];
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
                    game.players.push(ws.session.name);
                    game.ws.push(ws);
                    console.log(game);
                    resolve({ status: 'ok', notify: game.ws, players: game.players, todo: (game.players.length == 2) ? "notify" : "" });
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
module.exports = {
    createNewGame,
    joinGame
}
