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
                    $("#detail").addClass('remove');
                    $("#ready").removeClass('remove');
                    $("#pre_status").html("準備開始");
                    $("#ready_btn").click(() => {
                        self.sendJson(self.ws, {
                            type: "READY"
                        });
                        $("#ready_btn").html("等待玩家");
                        $("#ready_btn").unbind();
                    });
                }
                else {
                    $("#pre_status").html("正在出題目... 0%");
                }
                break;
            case "START":
                $("#ready").addClass('remove');
                $("#pre_question").html("即將開始");
                setTimeout(count = (n) => {
                    $("#pre_status").html(n);
                    if (n > 1)
                        setTimeout(count, 1000, --n);
                }, 1000, msg.delay);
                setListener();
                break;
            case "QUESTION":
                $("#pre_status").html("第 " + msg.id + " 題");
                $("#pre_question").html(msg.que.text);
                $("#detail").addClass('remove');
                $("#chose").removeClass('remove');
                setQuestion(msg.ans, msg.time);
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
    setQuestion = (ans, t) => {
        var btns = $('.button1');
        for (var i = 0; i < btns.length; i++) {
            $(btns[i]).html(ans[$(btns[i]).attr("choose")]);
        }
        var timeline = $("#timeline");
        timeline.css({
            'transition-duration': '0s',
            '-webkit-transition-duration': '0s'
        });
        timeline.addClass('timeline_show');
        timeline.removeClass('timeline_end');
        setTimeout(() => {
            timeline.css({
                'transition-duration': t.toString() + 's',
                '-webkit-transition-duration': t.toString() + 's'
            });
            timeline.addClass('timeline_end');
            timeline.removeClass('timeline_show');
        }, 10);


    }
    setListener = () => {
        var btns = $('.button1');
        for (var i = 0; i < btns.length; i++) {
            $(btns[i]).attr('choose', String.fromCharCode(65 + i));
            $(btns[i]).click(click_choose);
        }
    }
    click_choose = (e) => {
        var c = $(e.target).attr('choose');
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
