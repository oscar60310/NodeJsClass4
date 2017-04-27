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
                } else {
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
                $("#score").removeClass('remove');
                tcount = msg.time - 1;
                setQuestion(msg.ans, msg.time);
                if (msg.que.image) {
                    $("#imgshow").attr('src', msg.que.image);
                    $("#imgshow").removeClass('icon');
                    $("#imgshow").addClass('imag');
                }
                else {
                    $("#imgshow").attr('src', './pic/question.svg');
                    $("#imgshow").addClass('icon');
                    $("#imgshow").removeClass('imag');
                }
                break;
            case "RESULT":
                $('#timeline').css('display', 'none');
                var btns = $('.button1');
                var scos = $('.choose_score');
                var name = $('.name');
                for (var i = 0; i < btns.length; i++) {
                    $(btns[i]).removeClass("btn_select");
                    if ($(btns[i]).attr('choose') == msg.data.ans) {
                        $(btns[i]).addClass("btn_currect");
                    }
                    if ($(btns[i]).attr('choose') == msg.data.players[msg.id].ans) {
                        changeHour(Math.floor(msg.data.players[msg.id].add));
                        $(scos[i]).html(msg.data.players[msg.id].player + ": " + Math.floor(msg.data.players[msg.id].score));
                    }
                    var id2 = (msg.id == 0) ? 1 : 0;
                    if ($(btns[i]).attr('choose') == msg.data.players[id2].ans) {
                        $(scos[i]).html($(scos[i]).html() + " " + msg.data.players[id2].player + ": " + Math.floor(msg.data.players[id2].score));
                    }
                }
                break;
            case "END":
                $("#detail").removeClass('remove');
                $("#chose").addClass('remove');
                $("#score").addClass('remove');
                loadScore(msg.data);
                $("#imgshow").attr('src', './pic/question.svg');
                $("#imgshow").addClass('icon');
                $("#imgshow").removeClass('imag');
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
        var scos = $('.choose_score');
        for (var i = 0; i < btns.length; i++) {
            $(btns[i]).html(ans[$(btns[i]).attr("choose")]);
            $(btns[i]).removeClass("btn_select");
            $(btns[i]).removeClass("btn_currect");
            $(scos[i]).html("");
        }

        var timeline = $("#timeline");
        timeline.css('display', 'block');
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
    var tcount = 0;

    counter = () => {
        if (tcount > 1) {
            $("#timeline").html(tcount);
            tcount--;
            setTimeout(counter, 1000);
        }
        else {
            setTimeout(counter, 1000);
        }
    }
    setTimeout(counter, 1000);
    setListener = () => {
        var btns = $('.button1');
        for (var i = 0; i < btns.length; i++) {
            $(btns[i]).attr('choose', String.fromCharCode(65 + i));
            $(btns[i]).click(click_choose);
        }
    }
    click_choose = (e) => {
        $('#timeline').css('display', 'none');
        var c = $(e.target).attr('choose');
        $(e.target).addClass("btn_select");
        this.sendJson(self.ws, { type: "ANSWER", choose: c });
    }
    loadinfo = (msg) => {
        $("#p1_name").html(msg.players[0].name);
        $("#p2_name").html(msg.players[1].name);
        $("#p1_status").html("<img src='https://graph.facebook.com/v2.8/" + msg.players[0].id + "/picture?height=200&width=200'/>");
        $("#p2_status").html("<img src='https://graph.facebook.com/v2.8/" + msg.players[1].id + "/picture?height=200&width=200'/>");
    }
    loadScore = (msg) => {
        $("#p1_name").html(msg.players[0].name + "<br>" + msg.players[0].score + "/" + msg.total);
        $("#p2_name").html(msg.players[1].name + "<br>" + msg.players[1].score + "/" + msg.total);
        $("#p1_status").html("<img src='https://graph.facebook.com/v2.8/" + msg.players[0].id + "/picture?height=200&width=200'/>");
        $("#p2_status").html("<img src='https://graph.facebook.com/v2.8/" + msg.players[1].id + "/picture?height=200&width=200'/>");
        $("#pre_status").html("比賽結束");
        var winner = (msg.players[0].score > msg.players[1].score) ? msg.players[0].name : msg.players[1].name;
        $("#pre_question").html(winner + "獲勝");
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

var circle = document.querySelectorAll(".circle")[0];
var mask = document.querySelectorAll(".mask")[0];
var left = document.querySelectorAll(".left")[0];
var right = document.querySelectorAll(".right")[0];
//var range = document.getElementById("range");

var hour = document.querySelectorAll("#hour")[0];

var n;

//range.oninput = changeHour;Math.floor(msg.data.players[msg.id].score)

function changeHour(value) {
    hour.innerHTML = value;
    n = value;
    if (n <= 50) {
        left.style.webkitTransform = "rotate(" + 3.6 * n + "deg)";
        right.style.opacity = 0;
        mask.style.opacity = 1;
    } else {
        right.style.opacity = 1;
        mask.style.opacity = 0;
        left.style.webkitTransform = "rotate(" + 180 + "deg)";
        right.style.webkitTransform = "rotate(" + 3.6 * n + "deg)";
    }
}