var axios = require('axios');
getQuestion = (token1, token2) => {
    return new Promise((resolve, reject) => {
        var questions = [{
            id: 1,
            description: {
                text: '采楓是不是智障?',
                image: 'http://img05.tooopen.com/images/20150925/tooopen_sy_143684733881.jpg'
            },
            ans: { A: "不是", B: "是", C: "不是", D: "不是" },
            correct: "B",

            time: 10,
            score: 10
        }];

        // +題目
        axios.get('https://graph.facebook.com/v2.8/me', { params: { access_token: token1,fields: "name,birthday,photos"} }).then((res) => {
            console.log(res.data.photos.data[0]);
            //question 1
            var birthday = res.data.birthday.split("/")
            var answer = ["01/01", "02/02", "06/06", birthday[0] + "/" + birthday[1]]
            var q1 = {
                id: 2,
                description: {
                    text: res.data.name + ' 的生日是幾號?',
                    image: null
                },
                ans: { A: answer[0], B: answer[1], C: answer[2], D: answer[3] },
                correct: "D",
                time: 10,
                score: 10
            };
            questions.push(q1);
            //question 2 
            var photo_id = res.data.photos.data[0].id;
            axios.get('https://graph.facebook.com/v2.9/'+ photo_id +'/likes?summary=total_count',{ params: { access_token: token1} }).then((res2)=>{
                var likes_count = res2.data.summary.total_count;
                var answer = ["58", "107", "195", likes_count];
                console.log(photo_id);
                axios.get('https://graph.facebook.com/v2.9/'+ photo_id +'?fields=images',{ params: { access_token: token1} }).then((res3)=>{
                    var q2 = {
                        id: 3,
                        description: {
                            text: '猜猜這張照片有幾個讚?',
                            image: res3.data.images[0].source
                        },
                        ans: { A: answer[0], B: answer[3], C: answer[2], D: answer[1] },
                        correct: "B",
                        time: 10,
                        score: 10
                    };
                     questions.push(q2);
                });
                
               
            });
            resolve(questions);
        })
    })
}

module.exports = {
    getQuestion
}