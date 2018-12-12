let async = require("async");
var refreshToken = require("../jscode/refreshToken"); // Refresh토큰 실행기
var moduleRequest = require("../jscode/moduleRequest");
let knex = require("../config/database");
var util = require('../jscode/util') //각종 도구들
var randtoken = require('rand-token');

let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!']

const userdata = {
  email: 'noreply.mailsenderaog@gmail.com',
  sex: 'M',
  location: '서울',
  year: '1980',
  name: '로제리아'
}
const emailBase64 = Buffer.from(JSON.stringify(userdata)).toString('base64')
const accessToken = randtoken.uid(32) + '//' + emailBase64;
const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
//=====================TOKEN_DATA=======================
const emailToken = base64toJson.email;
const nameToken = base64toJson.name;
const sexToken = base64toJson.sex;
const yearToken = base64toJson.year;
const locationToken = base64toJson.location;
console.log(emailToken)
console.log(nameToken)
console.log(sexToken)
console.log(yearToken)
console.log(locationToken)


const refreshToken_action = (emailToken) => function(callback) {
  knex('Camelia_Users').where('email', emailToken).then(rows => {
    const googleAccessTokenRefresh = rows[0].googleAccessTokenRefresh;
    var insertData = {
      refreshToken: googleAccessTokenRefresh,
      email: emailToken
    }
    //토큰 타임 비교해서 googleTokenTime이 크면 갱신하지 않는다.
    console.log('rows[0].googleTokenTime ', rows[0].googleTokenTime)
    if (rows[0].googleTokenTime == null) {
      callback(null, false)
    } else {
      // 갱신을 안하면 기존 DB에서 읽어서 처리
      if (rows[0].googleTokenTime > (new Date().getTime())) {
        console.log('rows[0].googleTokenTime : 갱신안함')
        knex('Camelia_Users').select('googleAccessToken').where('email', emailToken)
          .then(rows => {
            console.log('googleTokenSQL ', rows[0])
            callback(null, rows[0].googleAccessToken)
          })
        // 갱신시 request 해서 callback 처리된 데이터 가져오기
      } else {
        console.log('rows[0].googleTokenTime : 갱신함')
        refreshToken(insertData, function(token) {
          console.log('token : ', token)
          callback(null, token)
        })

      }
    }

  })
}


// promise async
const getSync = (insertData, requestType) => new Promise(function(resolved, rejected) {
  getDataRequest(insertData, requestType, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});



//어제와 오늘의 걸음 정보
async function walkinfo_action() {
  const searchJson = {}
  async.waterfall([refreshToken_action(emailToken)], async function(err, result) {
    console.log('result : ', result)

    var todayD = new Date(new Date('2018-11-30T10:01:01.593Z').getTime() - 1000 * 60 * 60 * 9) //오늘
    const todayDate = (todayD.getFullYear()) + ('0' + (todayD.getMonth() + 1)).slice(-2) + '' + ('0' + (todayD.getDate())).slice(-2)
    var yesterD = new Date(new Date('2018-11-30T10:01:01.593Z').getTime() -1000 * 60 * 60 * 24 * 30 - 1000 * 60 * 60 * 9)
    //yesterD.setHours(0, 1, 1); //어제날짜 0시 1분 1초
    console.log(yesterD)

    const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)
    console.log('todayD: ', todayD)
    console.log('yesterD: ', yesterD)
    console.log('result[0] ', result)
    const insertData = {
      startTime: yesterD.getTime(),
      endTime: todayD.getTime(),
      accessToken: result
    }

    const fitness = await moduleRequest(insertData, 'fitness')
    const distance = await moduleRequest(insertData, 'distance')

    console.log(fitness)
    if (fitness.code != 200 || distance.code != 200) {
      //오류 문구 넣기
      const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      console.log(sayText)
    } else {
      console.log('fitness.list : ', fitness.list)
      const yesterdayWalkCount = Number(fitness.list[0].walkCount)
      const todayWalkCount = Number(fitness.list[1].walkCount)
      const yesterdayWalkDistance = parseInt(Number(distance.list[0].distance))
      const todayWalkDistance = parseInt(Number(distance.list[1].distance))

      const averageW = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken) * 2

      const allPlusWalk = yesterdayWalkCount + todayWalkCount
      let resultText = '';

      if (allPlusWalk < averageW) { //평균이 더 많으면
        const calWalk = averageW - allPlusWalk
        resultText = '평균보다 적은 편입니다. ' + util.ShuffleUmSay() + calWalk + '걸음을 더 걸으시면 평균을 채울 수 있습니다. 지금이라도 다른 운동으로 채워보는건 어떨까요? '
      } else {
        resultText = '평균보다 많은 편입니다. 지금처럼 잘 유지하시면 더욱 건강하겠죠? '
      }

      let sayText = '어제는 ' + yesterdayWalkCount + '걸음, ' + yesterdayWalkDistance + '미터를 걸었으며 ' +
        '오늘은 ' + todayWalkCount + '걸음, ' + todayWalkDistance + '미터를 걸었습니다. ' + nameToken + '님의 어제와 오늘을 합친 걸음은 ' +
        resultText  + util.shuffleRandom(lastTextArr)[0]
      console.log(sayText)
    }
  });

} // function End

walkinfo_action()
