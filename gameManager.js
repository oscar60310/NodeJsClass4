var shortid = require('shortid');
var sh
var gamelist = [];
createNewGame = (FacebookId) => {
    var id = shortid.generate();
    gamelist.push({
        id: id,
        host: FacebookId,
        expire: (new Date()).getTime() + 10 * 60 * 1000 // 10 分鐘後到期
    });
    return id;

}
module.exports = {
    createNewGame
}
