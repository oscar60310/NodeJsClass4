var wsManager;

function WsManager() {
    var self = this;
    var protocol = (window.location.protocol == "https:") ? "wss://" : "ws://";
    self.ws = new WebSocket(protocol + window.location.host + "/ws");
    self.ws.onopen = function () {
        // Web Socket is connected, send data using send()
        console.log("[ws] connected.");
        self.sendJson(self.ws, {
            type: "LOGIN"
        });
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
            self.sendJson(self.ws, {
                type: "CREATE"
            });
        } else {
            setAlert("<a href='" + msg.url + "' class=\"btn btn-primary btn-lg\" role=button>玩家FB登入</a>");
        }
    }
    newgame = (msg) => {
        if (msg.status == "ok") {
            var gameurl = window.location.origin + "/?id=" + msg.id;
            setAlert(msg.name + "玩家，你好", "比賽連結", "<div class=\"container col-md-8 col-md-offset-2\" id=\"url\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" placeholder=\"Url\" value=\"" + gameurl + "\"><span class=\"input-group-btn\"><button class=\"btn btn-secondary\" type=\"button\"><img src=\"\.\/pic\/CopyFilled.png\"></button></span></div></div>");
        }
    }
}