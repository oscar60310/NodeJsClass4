var wsManager = new WsManager();
window.wm = wsManager;
setAlert = (msg, text, url) => {
    $("#alertText").html(msg);
    $("#Title2").html(text);
    $("#alertUrl").html(url);
}

$(() => {
});

