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
            correct: "B",
            time: 10,
            score: 10
        }];

        // +題目
        axios.get('https://graph.facebook.com/v2.8/me', { params: { access_token: token1, fields: "birthday" } }).then((res) => {
            console.log(res.data);
            //question 1
            var birthday = res.data.birthday.split("/")
            var answer = ["1/1", "2/2", "6/6", birthday[0] + "/" + birthday[1]]
            var q = {
                id: 2,
                description: {
                    text: '鄭薇的生日是幾號?',
                    image: null
                },
                ans: { A: answer[0], B: answer[1], C: answer[2], D: answer[3] },
                correct: "D",
                time: 10,
                score: 10
            };
            questions.push(q);
            resolve(questions);
            //question 2
        })
    })
}

module.exports = {
    getQuestion
}