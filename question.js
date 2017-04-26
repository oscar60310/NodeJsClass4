var axios = require('axios');
const choose = ['A', 'B', 'C', 'D'];
getQuestion = (token1, token2) => {
    return new Promise((resolve, reject) => {
        var data = { questions: [], token: [token1, token2] };
        questionBirthDay(data).then(questionGuessLikeCount).then((data) => {
            var datasort = shuffle(data.questions);
            var n = 1;
            datasort.forEach((q) => {
                q.id = n++;
            });
            resolve(datasort);
        })
        // +題目
        /* axios.get('https://graph.facebook.com/v2.8/me', { params: { access_token: token1, fields: "name,birthday,photos" } }).then((res) => {
             //console.log(res.data.photos.data[0]);
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
             axios.get('https://graph.facebook.com/v2.9/' + photo_id + '/likes?summary=total_count', { params: { access_token: token1 } }).then((res2) => {
                 var likes_count = res2.data.summary.total_count;
                 var answer = ["58", "107", "195", likes_count];
                 console.log(photo_id);
                 axios.get('https://graph.facebook.com/v2.9/' + photo_id + '?fields=images', { params: { access_token: token1 } }).then((res3) => {
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
         })*/
    })
}
questionBirthDay = (data) => {
    return new Promise((resolve) => {
        birthdayToQuestion(data.token[0]).then((q) => {
            data.questions.push(q);
            birthdayToQuestion(data.token[1]).then((q) => {
                data.questions.push(q);
                resolve(data);
            })
        })
    });
}

birthdayToQuestion = (token) => {
    return new Promise((resolve) => {
        axios.get('https://graph.facebook.com/v2.8/me', { params: { access_token: token, fields: "name,birthday" } }).then((res) => {
            var birthday = res.data.birthday.split("/");
            var birthdayString = birthday[0] + "/" + birthday[1];
            var answerSort = [birthdayString];
            while (answerSort.length < 4) {
                var rd = randomDate();
                if (birthdayString != rd)
                    answerSort.push(rd);
            }
            var answer = shuffle(answerSort);

            var q = {
                description: {
                    text: res.data.name + ' 的生日是哪天?',
                    image: null
                },
                ans: { A: answer[0], B: answer[1], C: answer[2], D: answer[3] },
                correct: choose[answer.indexOf(birthdayString)],
                time: 10,
                score: 10
            };
            resolve(q);
        });
    });
}

questionGuessLikeCount = (data, i = 0) => {
    return new Promise((resolve) => {
        LikeCountToQuestion(data.token[Math.floor(Math.random() * 2)]).then((q) => {
            if (q != null)
                data.questions.push(q);
            if (i < 5)
                resolve(questionGuessLikeCount(data, ++i));
            else
                resolve(data);
        })
    });

}
LikeCountToQuestion = (token) => {
    return new Promise((resolve) => {
        axios.get('https://graph.facebook.com/v2.8/me', { params: { access_token: token, fields: "photos" } }).then((res) => {
            if (res.data.photos) {
                var photo_id = res.data.photos.data[Math.floor(res.data.photos.data.length * Math.random())].id;
                axios.get('https://graph.facebook.com/v2.9/' + photo_id + '/likes?summary=total_count', { params: { access_token: token } }).then((res) => {
                    var likes_count = res.data.summary.total_count;
                    var answerSort = [likes_count];
                    while (answerSort.length < 4) {
                        var rd = randomLike(likes_count);
                        if (likes_count != rd)
                            answerSort.push(rd);
                    }
                    var answer = shuffle(answerSort);
                    axios.get('https://graph.facebook.com/v2.9/' + photo_id + '?fields=images', { params: { access_token: token } }).then((res) => {
                        var q = {
                            description: {
                                text: '猜猜這張照片有幾個讚?',
                                image: res.data.images[0].source
                            },
                            ans: { A: answer[0], B: answer[3], C: answer[2], D: answer[1] },
                            correct: choose[answer.indexOf(likes_count)],
                            time: 10,
                            score: 10
                        };
                        resolve(q);
                    });
                });
            }
            else {
                resolve(null);
            }

        });
    });
}

function randomLike(p) {
    return Math.floor(p * (0.6 + Math.random() * 0.8));
}
function randomDate(start = new Date(2017, 0, 1), end = new Date(2017, 11, 31)) {
    var d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return getFormattedDate(d);
}
function getFormattedDate(date) {
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day;
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
module.exports = {
    getQuestion
}