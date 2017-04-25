var shortid = require('shortid');
var axios = require('axios');
var qm = require("./question");
var sh
var gamelist = [];
cleargame = () => {
    gamelist.forEach((g, i, l) => {
        if (g.expire < (new Date()).getTime()) {
            l.splice(i, 1);
        }
    });
    setTimeout(cleargame, 5 * 60 * 1000);
}
cleargame();
createQuestions = (gameid) => {
    return new Promise((resolve) => {
        var game = getGameByID(gameid);
        if (game) {
            /// Create question
            qm.getQuestion(game.players[0].ws.session.key, game.players[1].ws.session.key).then((q) => {
                game.questions = q;
                game.nowquestion = 0;
                resolve({ status: "ok", game });
            });


        }
        else {
            resolve({ status: "no game id" });
        }
    })

}
solveQuestion = (ws, ans) => {
    return new Promise((resolve, reject) => {
        var game = getGameByID(ws.gameid);
        if (game) {
            var player = null;
            game.players.forEach((p) => {
                if (p.id == ws.session.fbid && p.ready == false && player == null) {
                    p.ready = true;
                    player = p;
                }
            });
            if (player == null)
                resolve(false);
            else {
                player.result[game.nowquestion] = {
                    ans: ans,
                    time: (new Date()).getTime()
                };
                game.questions[game.nowquestion].hasAns++;
                //console.log(player.result[game.nowquestion]);
                if (game.questions[game.nowquestion].hasAns == 2)
                    resolve(true);
                else
                    resolve(false);
            }
        }
        else {
            reject();
            console.log("no game id error");
        }
    });
}
getResult = (game) => {
    var re = [];
    for (var i = 0; i < 2; i++) {
        var que = game.questions[game.nowquestion];
        var player_que = game.players[i].result[game.nowquestion];
        if (player_que == null)
            player_que = { score: 0 };
        else {

            if (player_que.ans != que.currect)
                player_que.score = 0;
            else {
                var lasttime = (que.timeout - player_que.time) / 1000;
                if (lasttime <= 0)
                    player_que.score = 0;
                else
                    player_que.score = (lasttime > que.time / 3) ? que.score : (que.score / 3) + (que.score / 3) * lasttime / (que.time / 3);
            }
        }
        re.push({ player: game.players[i].id, ans: player_que.ans, score: player_que.score });

    }        
    game.nowquestion++;
    return re;

}
getQuestion = (gameid) => {
    return new Promise((resolve, reject) => {
        var game = getGameByID(gameid);
        if (game) {
            if (game.nowquestion >= game.questions.length) {
                resolve();
            } else {
                var wss = [game.players[0].ws, game.players[1].ws];
                game.players[0].result = [];
                game.players[1].result = [];
                game.players[0].ready = false;
                game.players[1].ready = false;
                if (game.nowquestion < game.questions.length) {
                    game.questions[game.nowquestion].timeout = (new Date()).getTime() + (game.questions[game.nowquestion].time * 1000) + 1000;
                    game.questions[game.nowquestion].hasAns = 0;
                    resolve({ d: wss, que: game.questions[game.nowquestion] });
                }
                else
                    resolve({ d: wss, que: null });
            }

        }
        else {
            reject();
            console.log("no game id error");
        }
    });
}
getGameByID = (id) => {
    var game = null;
    gamelist.forEach((g) => {
        if (g.id == id) {
            game = g;
        }
    })
    return game;
}

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
ready = (ws) => {
    return new Promise((resolve, reject) => {
        var game = getGameByID(ws.gameid);
        if (game) {
            var find = false;
            game.players.forEach((p) => {
                if (p.id == ws.session.fbid && !find && !p.ready) {
                    find = true;
                    p.ready = true;
                }
            })
            if (game.players[0].ready && game.players[1].ready)
                resolve({ todo: 'notify', ws: [game.players[0].ws, game.players[1].ws] });
            else
                resolve({ todo: '' });
        }
        else {
            reject();
            console.log("no game id error");
        }
    });
}
module.exports = {
    createNewGame,
    joinGame,
    info,
    createQuestions,
    getGameByID,
    ready,
    getQuestion,
    solveQuestion,
    getResult
}
