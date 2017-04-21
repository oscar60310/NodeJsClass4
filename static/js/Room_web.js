var wsManager;

function WsManager() {
    var self = this;
    var protocol = (window.location.protocol == "https:") ? "wss://" : "ws://";
    self.ws = new WebSocket(protocol + window.location.host + "/ws");
    self.ws.onopen = function () {
        // Web Socket is connected, send data using send()
        console.log("[ws] connected.");
        self.sendJson(self.ws, {
            type: "INFO",
            game: getUrlParameter('id')
        });

    };
    self.ws.onmessage = function (evt) {
        var msg = JSON.parse(evt.data);
        console.log(msg);
        /*  */
        switch (msg.type) {
            case "INFO":
                loadinfo(msg);
                break;
            case "COMPUTING":
            
                if (msg.finish) {
                    //// 請兩個人案準備
                    $("#pre_status").html("第一題");
                    $("#pre_question").html("請選擇數字1");
                    $("#detail").addClass('remove');
                    $("#chose").removeClass('remove');
                }
                else{
                    $("#pre_status").html("正在出題目... 0%");
                }
                break;
            case "QUESTION":
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
    loadinfo = (msg) => {
        $("#p1_name").html(msg.players[0].name);
        $("#p2_name").html(msg.players[1].name);
        $("#p1_status").html("<img src='https://graph.facebook.com/v2.8/" + msg.players[0].id + "/picture?height=200&width=200'/>");
        $("#p2_status").html("<img src='https://graph.facebook.com/v2.8/" + msg.players[1].id + "/picture?height=200&width=200'/>");
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
