var axios = require('axios');
getQuestion = (token1, token2) => {
    return new Promise((resolve, reject) => {
        var questions = [{
            id: 1,
            description: {
                text: '采楓是不是智障?',
                image: null
            },
            ans: { A: "不是", B: "是", C: "不是", D: "不是" },
            currect: "B",
            time: 10,
            score: 10
        }];
        // +題目
            axios.get('https://graph.facebook.com/v2.8/me/friends', { params: {access_token:token1} }).then((res) => {
                console.log(res.data);
                resolve(res.data.data.length > 0);
            })
        resolve(questions);
    })
}

module.exports = {
    getQuestion
}