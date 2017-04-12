var wsManager;
function WsManager() {
    var self = this;
    var protocol = (window.location.protocol == "https:")? "wss://" : "ws://";
    self.ws = new WebSocket(protocol + window.location.host + "/ws");
    self.ws.onopen = function () {
        // Web Socket is connected, send data using send()
        console.log("[ws] connected.");
        self.sendJson(self.ws, { type: "LOGIN" });
    };
    self.ws.onmessage = function (evt) {
        var msg = JSON.parse(evt.data);
        console.log(msg);
        /*  */
        switch (msg.type) {
            case "LOGIN":
                loginStatus(msg);
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
    loginStatus = (msg) => {
        if (msg.status == "ok") {
            setAlert(msg.name);
        }
        else {
            setAlert("<a href='" + msg.url + "'>登入</a>");
        }
    }
}
