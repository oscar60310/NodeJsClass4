var wsManager;
function WsManager() {
    var self = this;
    var ws = new WebSocket("ws://" + window.location.host + "/ws");
    ws.onopen = function () {
        // Web Socket is connected, send data using send()
        console.log("[ws] connected.");
        self.sendJson(ws, { type: "LOGIN" });
    };
    ws.onmessage = function (evt) {
        var msg = JSON.parse(evt.data);
        console.log(msg);
        /*  */
        switch (msg.type) {
            case "LOGIN":
                loginStatus(msg);
                break;
        }

    };
    ws.onclose = function () {
        // websocket is closed.
        console.log("ws closed.");
    };
    this.send = (data) => {
        sendJson(ws, data);
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
