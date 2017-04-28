var wsManager;

function WsManager() {
    var self = this;
    var protocol = (window.location.protocol == "https:") ? "wss://" : "ws://";
    self.ws = new WebSocket(protocol + window.location.host + "/ws");
    self.ws.onopen = function () {
        // Web Socket is connected, send data using send()
        console.log("[ws] connected.");
        //################# 2. 連上websocket之後，去做檢查的動作 #################
        self.sendJson(self.ws, {
            type: "LOGIN"
        });
        //

    };
    self.ws.onmessage = function (evt) {
        var msg = JSON.parse(evt.data);
        console.log(msg);
        /*  */
        switch (msg.type) {
            case "LOGIN":
                loginStatus(msg);
                break;
            case "CREATE":
                newgame(msg);
                break;
            case "JOIN":
                checkJoin(msg);
                break;
            case "MATCH":
                match(msg);
                break;
        }

    };
    self.ws.onclose = function () {
        // websocket is closed.
        console.log("ws closed.");
    };
    this.send = (data) => {
        sendJson(self.ws, data);
    }
    this.sendJson = (ws, msg) => {
        ws.send(JSON.stringify(msg));
    }
    loginStatus = (msg, text, url) => {
        if (msg.status == "ok") {
            //################# 3. 這裡是讓玩家加入遊戲 #################
            self.sendJson(self.ws, {
                type: "JOIN",
                game: getUrlParameter("id")
            });
            //
        } else {
            setAlert("<a href='" + msg.url + "' class=\"btn btn-primary btn-lg\" role=button>玩家FB登入</a>");
        }
    }
    newgame = (msg) => {
        if (msg.status == "ok") {
            //################# 7. 這裡是把自己加入遊戲 #################
            self.sendJson(self.ws, {
                type: "JOIN",
                game: msg.id
            });
            //
            var gameurl = window.location.origin + "/?id=" + msg.id;
            setAlert(msg.name + "玩家，你好", "比賽連結", "<div class=\"container col-md-8 col-md-offset-2\" id=\"url\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" placeholder=\"Url\" value=\"" + gameurl + "\"><span class=\"input-group-btn\"><button class=\"btn btn-secondary\" type=\"button\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"複製\" data-delay=\"0\" onclick=\"copyURL()\"><img src=\"\.\/pic\/CopyFilled.png\"></button></span></div></div>");
        }
    }
    checkJoin = (msg) => {
        if (msg.status != "ok") {
            setAlert("無法加入", "ID 無效，產生新的房間...", "");
            //################# 8. 如果加入失敗的話，自己創一個房間 #################
            setTimeout(() => self.sendJson(self.ws, {
                type: "CREATE"
            }), 1000);
            //
        } else
            self.gid = msg.id;
    }
    match = (msg) => {
        var playshow = msg.players[0].name + ' vs ' + msg.players[1].name;
        setTimeout(counter, 1000, playshow, 5);
    }
    counter = (ps, n) => {
        setAlert(ps, "配對成功，將於" + n + "秒後開始遊戲！", "");
        if (n <= 0) {
            window.location = './room.html?id=' + self.gid;
        } else
            setTimeout(counter, 1000, ps, --n);
    }
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};