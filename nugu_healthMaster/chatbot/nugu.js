'use strict';

//모듈
const request = require('request'); // request
const Promise = require('promise'); //promise
let async = require("async");

//설정들
var transporter = require('../config/emailConfig') // 메일 설정저장
var refreshToken = require("../jscode/refreshToken"); // Refresh토큰 실행기
var util = require('../jscode/util') //각종 도구들

//최초실행
exports.nugu_chatbot = (knex, req, res) => {
  const appTitle = '건강마스터' // 앱 타이틀
  //마지막 말하는 부분 Random

  let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!', '또 궁금하신게 있으신가요?']
  //=====================Based Section=======================
  const requestBody = req.body; // 중요!
  const actionName = requestBody.action.actionName // Action intent 구분
  const parameters = requestBody.action.parameters // parameters
  const context = requestBody.context //context
  console.log('context : ', requestBody)
  //=============================================================================
  console.log(`request: ${JSON.stringify(actionName)}`)

  //request api section GET POST
  function getDataRequest(insertData, requestType, callback) {

    let url = '' //URL
    let forms = {} //form
    let options = {} //request options
    let headers = {}
    let body = {}

    switch (requestType) { //분기점

      case 'fitness': // 구글 서버에서 피트니스 걸음 데이터 한달치 가져오기
        url = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'

        var startTime = insertData.startTime
        var endTime = insertData.endTime

        //해더
        headers = {
          'Content-Type': 'application/json;encoding=utf-8',
          'Authorization': 'Bearer ' + insertData.accessToken,
        }

        //Body
        body = {
          aggregateBy: [{
            dateSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_step',
            dataTypeName: "com.google.step_count.delta"
          }],
          bucketByTime: {
            durationMillis: 86400000,
          },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        }

        //option바꾸기
        options = {
          url: url,
          headers: headers,
          body: body,
          json: true,
          method: 'POST' //POST임
        }
        break;

      case 'distance': // 구글 서버에서 피트니스 거리데이터
        url = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'

        var startTime = insertData.startTime
        var endTime = insertData.endTime

        headers = {
          'Content-Type': 'application/json;encoding=utf-8',
          'Authorization': 'Bearer ' + insertData.accessToken,
        }
        // com.google.distance.delta
        //com.google.step_count.delta
        body = {
          aggregateBy: [{
            dateSourceId: 'derived:com.google.step_count.delta.google.android.gms:estimated_step',
            dataTypeName: "com.google.distance.delta"
          }],
          bucketByTime: {
            durationMillis: 86400000 //하루
          },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        }

        options = {
          url: url,
          headers: headers,
          body: body,
          json: true,
          method: 'POST'
        }
        break;

      case 'bpm': // 구글 서버에서 피트니스 심박동
        url = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'

        var startTime = insertData.startTime
        var endTime = insertData.endTime

        headers = {
          'Content-Type': 'application/json;encoding=utf-8',
          'Authorization': 'Bearer ' + insertData.accessToken,
        }
        // com.google.distance.delta
        //com.google.step_count.delta
        body = {
          aggregateBy: [{
            dateSourceId: 'derived:com.google.step_count.delta:google.android.gms:estimated_step',
            dataTypeName: "com.google.heart_rate.bpm"
          }],
          bucketByTime: {
            durationMillis: 86400000 //하루
          },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        }

        options = {
          url: url,
          headers: headers,
          body: body,
          json: true,
          method: 'POST'
        }
        break;


      case 'userData': //내 서버에서 유저 정보 가져오기
        url = "https://camelia-neoaspect.appspot.com/oauth/request";
        forms.accessToken = insertData.accessToken
        //option바꾸기
        options = {
          method: 'GET',
          url: url,
          encoding: null,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
          },
          timeout: 1000 * 30,
          qs: forms //form 입력 Get시 qs사용, post시 form사용
        }

        break;

      case 'nextWeather': //내일날씨

        const nextWeatherDate = new Date((new Date().getTime() + 32400000 - 31 * 60 * 1000)); // + 32400000
        const nextWeatherDateYearDay = nextWeatherDate.getFullYear() + '' + ('0' + (nextWeatherDate.getMonth() + 1)).slice(-2) + ('0' + nextWeatherDate.getDate()).slice(-2);
        const nextWeatherDateHourMin = ('0' + nextWeatherDate.getHours()).slice(-2) + '' + ('0' + nextWeatherDate.getMinutes()).slice(-2);

        forms.base_date = nextWeatherDateYearDay
        forms.base_time = nextWeatherDateHourMin
        forms.nx = insertData.nx
        forms.ny = insertData.ny
        forms._type = 'json'

        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=[인증키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=[인증키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=1&pageNo=1&startPage=1&_type=json
        // pop강수확률
        // pty 강수형태
        // T3H 3시간 기온
        // S06 신적설
        // REH 습도
        //fcstValue, category, fcstTime: 1800
        forms.numOfRows = 100
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1

        options = {
          method: 'GET',
          url: url,
          encoding: null,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
          },
          timeout: 1000 * 30,
          qs: forms //form 입력 Get시 qs사용, post시 form사용
        }


      case 'forecastShortWeather': //내일날씨
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[인증키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[인증키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json
        //"category":"T1H","fcstDate":20181026,"fcstTime":1600,"fcstValue":13.1,
        // Sky TH1 PTY

        const forecastShortWeatherDate = new Date((new Date().getTime() + 32400000 - 31 * 60 * 1000)); // + 32400000
        const forecastShortWeatherYearDay = forecastShortWeatherDate.getFullYear() + '' + ('0' + (forecastShortWeatherDate.getMonth() + 1)).slice(-2) + ('0' + forecastShortWeatherDate.getDate()).slice(-2);
        const forecastShortWeatherHourMin = ('0' + forecastShortWeatherDate.getHours()).slice(-2) + '' + ('0' + forecastShortWeatherDate.getMinutes()).slice(-2);

        forms.base_date = forecastShortWeatherYearDay
        forms.base_time = forecastShortWeatherHourMin
        forms.nx = insertData.nx
        forms.ny = insertData.ny
        forms._type = 'json'

        forms.numOfRows = 100
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1

        options = {
          method: 'GET',
          url: url,
          encoding: null,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
          },
          timeout: 1000 * 30,
          qs: forms //form 입력 Get시 qs사용, post시 form사용
        }

        break;
    }


    //   request module
    request(options, function(err, resp, body) {

      //에러시 처리
      if (err) {
        callback(err, {
          code: 400,
          email: '',
          status: 'fail'
        });
        return;
      }
      //에러 아닌 경우 각 타입별로 처리
      if (requestType == 'fitness') { //피트니스: JSON

        if (body.hasOwnProperty('error')) { //에러
          callback(null, {
            list: '',
            status: 'fail'
          });
          return;
        } else { //에러 아니면

          const originalJson = JSON.parse(JSON.stringify(body)).bucket
          let arr = []
          for (let i = 0; i < originalJson.length; i++) {
            let jsonArr = {}
            const starttime = new Date(Number(originalJson[i].startTimeMillis))
            const endtime = new Date(Number(originalJson[i].endTimeMillis))
            jsonArr.time = starttime.getFullYear() + '-' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '-' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.starttime = starttime.getFullYear() + '' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.endtime = endtime.getFullYear() + '' + ('0' + (endtime.getMonth() + 1)).slice(-2) + '' + ('0' + (endtime.getDate())).slice(-2);
            let walkcount = ''

            if (originalJson[i].dataset[0].point.length == 0) {
              jsonArr.walkCount = 0;
            } else {
              //값이 있다면
              walkcount = originalJson[i].dataset[0].point[0].value[0].intVal
              jsonArr.walkCount = walkcount;

            }
            arr.push(jsonArr)
          } //for

          callback(null, {
            code: 200,
            list: arr,
            status: 'success'
          });

        }

      } else if (requestType == 'distance') {

        if (body.hasOwnProperty('error')) { //에러
          callback(null, {
            list: '',
            status: 'fail'
          });
          return;
        } else { //에러 아니면

          const originalJson = JSON.parse(JSON.stringify(body)).bucket
          let arr = []
          for (let i = 0; i < originalJson.length; i++) {
            let jsonArr = {}
            const starttime = new Date(Number(originalJson[i].startTimeMillis))
            const endtime = new Date(Number(originalJson[i].endTimeMillis))
            jsonArr.time = starttime.getFullYear() + '-' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '-' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.starttime = starttime.getFullYear() + '' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.endtime = endtime.getFullYear() + '' + ('0' + (endtime.getMonth() + 1)).slice(-2) + '' + ('0' + (endtime.getDate())).slice(-2);
            let walkcount = ''

            if (originalJson[i].dataset[0].point.length == 0) {
              jsonArr.distance = 0;
            } else {
              //값이 있다면
              walkcount = originalJson[i].dataset[0].point[0].value[0].fpVal
              jsonArr.distance = parseInt(walkcount);

            }
            arr.push(jsonArr)
          } //for

          callback(null, {
            code: 200,
            list: arr,
            status: 'success'
          });

        }

      } else if (requestType == 'bpm') {

        if (body.hasOwnProperty('error')) { //에러
          callback(null, {
            list: '',
            status: 'fail'
          });
          return;
        } else { //에러 아니면

          const originalJson = JSON.parse(JSON.stringify(body)).bucket
          let arr = []
          for (let i = 0; i < originalJson.length; i++) {
            let jsonArr = {}
            const starttime = new Date(Number(originalJson[i].startTimeMillis))
            const endtime = new Date(Number(originalJson[i].endTimeMillis))
            jsonArr.time = starttime.getFullYear() + '-' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '-' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.starttime = starttime.getFullYear() + '' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.endtime = endtime.getFullYear() + '' + ('0' + (endtime.getMonth() + 1)).slice(-2) + '' + ('0' + (endtime.getDate())).slice(-2);
            let walkcount = ''

            if (originalJson[i].dataset[0].point.length == 0) {
              jsonArr.bpm = 0;
            } else {
              //값이 있다면
              walkcount = originalJson[i].dataset[0].point[0].value[0].fpVal
              jsonArr.bpm = parseInt(walkcount);

            }
            arr.push(jsonArr)
          } //for

          callback(null, {
            code: 200,
            list: arr,
            status: 'success'
          });

        }

      } else if (requestType == 'userData') { //사용자 데이터

        const originalJson = JSON.parse(body.toString());
        callback(null, {
          code: 200,
          email: originalJson.email,
          name: originalJson.name,
          sex: originalJson.sex,
          year: originalJson.year,
          status: 'success',
          requestType: requestType
        });

      } else if (requestType == 'nextWeather') { // 날씨

        const originalJson = JSON.parse(body.toString());
        const headerCode = originalJson.response.header.resultCode
        if (headerCode == '0000') { //정상작동 확인
          const arrayList = originalJson.response.body.items.item;
          callback(null, {
            code: 200,
            requestType: requestType, //요청한 타입
            name: insertData.name,
            list: arrayList
          });
          return;
        } else {
          callback(null, {
            code: 400,
            name: ''
          });
          return;
        }
      } else if (requestType == 'nextWeather' || requestType == 'forecastShortWeather') { // 날씨

        const originalJson = JSON.parse(body.toString());
        const headerCode = originalJson.response.header.resultCode
        if (headerCode == '0000') { //정상작동 확인
          const arrayList = originalJson.response.body.items.item;
          callback(null, {
            code: 200,
            requestType: requestType, //요청한 타입
            name: insertData.name,
            list: arrayList
          });
          return;
        } else {
          callback(null, {
            code: 400,
            name: ''
          });
          return;
        }
      } //requestType

    });

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


  //response json 필드. 여기서 json을 만들어준다.
  function makeJson(jsons) {

    let jsonReturn = {
      "version": "2.0",
      "resultCode": "OK",
      "directives": {
        "AudioPlayer": {
          "type": "AudioPlayer.Play",
          "audioItem": {
            "stream": {
              "url": "",
              "offsetInMilliseconds": "",
              "progressReport": {
                "progressReportDelayInMilliseconds": "",
                "progressReportIntervalInMilliseconds": ""
              },
              "token": "",
              "expectedPreviousToken": ""
            },
            "metadata": {} // reserved
          }
        }
      }
    }
    jsonReturn.output = jsons
    return jsonReturn;
  }

  //==========================================================================
  //==========================================================================
  //==========================================================================
  //==========================================================================
  //parameters.hasOwnProperty('number'


  function averagewalkSQL(callback) { //평균 걸음수 구하기 전체
    //유저 평균 걸음수
    knex('Camelia_WalkData').avg({
        avg: 'walk'
      })
      .then(rows => {

        callback(rows[0])
      })
  }

  function nowWeatherSQL(name, callback) { //도시명으로 1줄 데이터
    //유저 평균 걸음수
    knex('Camelia_NowWeather').where('name', name)
      .then(rows => {

        callback(rows[0])
      })
  }


  //평균 걸음 거리
  const averageSQL = (insertJson) => new Promise(function(resolved, rejected) {
    knex('Camelia_WalkData').avg({
        avg: 'walk'
      })
      .then(rows => {
        resolved(rows[0])
      })
  })

  //오늘 날씨와 미세먼지
  const nowWeatherMiseSQL = (insertJson) => new Promise(function(resolved, rejected) {
    knex('Camelia_NowWeather').where('name', insertJson.name)
      .then(rows => {
        resolved(rows[0]) //　[0]　없이 사용가능
      })
  })

  // 병예방지수
  const predictSQL = (insertJson) => new Promise(function(resolved, rejected) {
    knex('Camelia_Predict').where({
        cityName: insertJson.name
      })
      .then(rows => {

        resolved(rows[0])
      })
  })
  //각종지수
  const gisuSQL = (insertJson) => new Promise(function(resolved, rejected) {
    knex('Camelia_Gisu').where('name', insertJson.requestType)
      .then(rows => {
        resolved(rows[0])
      })
  })
  //각종지수2
  const gisuSQL2 = (insertJson) => new Promise(function(resolved, rejected) {
    knex('Camelia_Gisu').where('name', insertJson.requestType2)
      .then(rows => {
        resolved(rows[0])
      })
  })

  //각종지수2
  const walkgoalSQL = (insertJson) => new Promise(function(resolved, rejected) {
    knex('Camelia_Users').where('email', insertJson.email)
      .then(rows => {
        resolved(rows[0])
      })
  })
  //==========================================================================
  //==========================================================================
  //==========================================================================


  //종합적으로 알려드림
  function welcome_action(res) {
    console.log("welcome_action");
    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 날씨조회는 사용하실 수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.welcomeanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;

    const searchJson = {
      name: locationToken
    }
    var d = new Date(new Date().getTime() + 32400000).getMonth() + 1; //0부터 시작: 실제 달 숫자


    searchJson.requestType = 'chegam'
    searchJson.requestType2 = 'uv'


    Promise.all([nowWeatherMiseSQL(searchJson), predictSQL(searchJson), gisuSQL(searchJson), gisuSQL2(searchJson)]).then(result => {
      //1번은 현재날씨(미세포함), 2번은 예상바이러스지수, 3번은 생활지수
      //result => Array

      const nowWeatherJson = result[0] //T1H(varchar : Num), mise(varchar), PTY(varchar :Num)
      const predictJson = result[1] //risk riskSay
      const gisuJson = result[2] //chegam, bul => h시리즈 : foodDecay, uv today tomorrow theDayAfterTomorrow
      const gisu2Json = result[3] //chegam, bul => h시리즈 : foodDecay, uv today tomorrow theDayAfterTomorrow


      //자외선
      let uvTemp = ''
      //자외선 3월에서 11
      if (2 < d && d < 12) {
        uvTemp = util.uvSay(gisu2Json.today);
      }

      const tempVoice = util.TempText(nowWeatherJson.T1H);

      //	0:없음, 1:비, 2:비/눈, 3:눈/비, 4:눈
      let ptyFlag = 0
      let ptyInsert = '';
      switch (parseInt(nowWeatherJson.PTY)) {
        case 0:
          ptyInsert = '맑음 이며 '
          ptyFlag = 0
          break;
        case 1:
          ptyInsert = '비가 내리고 있으며 '
          ptyFlag = 2
          break;
        case 2:
          ptyInsert = '비나 눈이 내리고 있으며 '
          ptyFlag = 2
          break;
        case 3:
          ptyInsert = '눈이나 비가 내리고 있으며 '
          ptyFlag = 2
          break;
        case 4:
          ptyInsert = '눈이 내리고 있으며. '
          ptyFlag = 2
          break;
      }


      //미세먼지
      let miseFlag = 0
      let miseResult = '';
      if ((nowWeatherJson.mise).trim() == '나쁨') {
        miseResult = nowWeatherJson.mise + '입니다. '
        miseFlag = 2
      } else if ((nowWeatherJson.mise).trim() == '보통') {
        miseResult = nowWeatherJson.mise + '입니다. '
        miseFlag = 1
      } else if ((nowWeatherJson.mise).trim() == '좋음') {
        miseResult = nowWeatherJson.mise + '입니다. '
      }

      let tempFlag = 0
      //온도
      if (nowWeatherJson.T1H < 13) { //13
        tempFlag = 1
      } else if (13 <= nowWeatherJson.T1H && nowWeatherJson.T1H <= 16) { //13~17
        tempFlag = 1
      }

      //0: 운동하기 좋음, 1: 다소 주의 2: 실내운동 권장
      let resultText = ''
      //온도 tempFlag 미세먼지 miseFlag 강우상황 ptyFlag
      if (tempFlag == 0 && miseFlag == 0 && ptyFlag == 0) {
        resultText = '오늘은 야외운동하기 좋은 날입니다. '
      } else if (tempFlag == 1 || miseFlag == 1 || ptyFlag == 1) {
        let tempInsert = ''
        if (tempFlag == 1) {
          tempInsert += '온도, '
        }
        if (miseFlag == 1) {
          tempInsert += '미세먼지, '
        }
        if (ptyFlag == 1) {
          tempInsert += '강수상황, '
        }
        resultText = tempInsert + ' 때문에 야외운동시 약간은 조심해야 겠어요. '

      } else if (tempFlag == 2 || miseFlag == 2 || ptyFlag == 2) {
        let tempInsert = ''
        if (tempFlag == 2) {
          tempInsert += '온도, '
        }
        if (miseFlag == 2) {
          tempInsert += '미세먼지, '
        }
        if (ptyFlag == 2) {
          tempInsert += '강수상황, '
        }
        resultText = tempInsert + ' 때문에 꼭 실내운동을 하길 추천할께요 '
      }

      //
      let output = {}
      let sayText =
        util.shuffleRandom([('현재 온도는 ' + nowWeatherJson.T1H + '도에 강수상태는 ' + ptyInsert + '초 미세먼지는 ' + miseResult + util.ShuffleUmSay() + resultText + uvTemp),
          ('현재 온도는 ' + nowWeatherJson.T1H + '도 입니다. ' + util.ShuffleUmSay() + '강수상태는 ' + ptyInsert + '초 미세먼지는 ' + miseResult + resultText + uvTemp),
          ('같이 운동하고 싶은 ' + nameToken + '님! 현재 온도는 ' + nowWeatherJson.T1H + '도에 강수상태는 ' + ptyInsert + '초 미세먼지는 ' + miseResult + util.ShuffleUmSay() + resultText + uvTemp),
          ('화창한지 알아볼까요? 지금 온도는 ' + nowWeatherJson.T1H + '도에 강수상태는 ' + ptyInsert + '초 미세먼지는 ' + miseResult + util.ShuffleUmSay() + resultText + uvTemp)
        ])[0] +
        util.shuffleRandom(lastTextArr)[0]
      output.welcomeanswer = sayText
      return res.send(makeJson(output))


    })

  } //function end

  //자외선 지수
  async function uv_action(res) {
    console.log("uv_action");
    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 자외선 지수는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.uvanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;

    const searchJson = {
      name: locationToken,
      requestType2: 'uv'
    }
    var d = new Date(new Date().getTime() + 32400000).getMonth() + 1; //0부터 시작: 실제 달 숫자
    const gisu2Json = await gisuSQL2(searchJson)

    let resultText = '자외선 지수는 3월부터 11월까만 가능합니다. 현재는 ' + d + '월이라 제공을 할수 없습니다. '
    //자외선
    //자외선 3월에서 11
    if (2 < d && d < 12) {
      resultText = '오늘의 자외선 지수는 ' + gisu2Json.today + '입니다. '
    }


    let output = {}
    let sayText = nameToken + '님, ' + resultText + util.shuffleRandom(lastTextArr)[0]
    output.uvanswer = sayText
    return res.send(makeJson(output))

  } //function end


  //자외선 지수
  async function virus_action(res) {
    console.log("virus_action");
    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 질병예방 기능은 사용하실 수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.virusanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;

    const searchJson = {
      name: locationToken
    }

    const predictVirus = await predictSQL(searchJson)

    let resultText = '현재 눈병 위험도는 ' + predictVirus.risk2 + '단계 이며, 감기는 ' + util.virusSay(predictVirus.risk1)

    let output = {}
    let sayText = resultText + util.shuffleRandom(lastTextArr)[0]
    output.virusanswer = sayText
    return res.send(makeJson(output))

  } //function end

  // 3시간 다음 날씨
  async function nextweather_action(res) {

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 최근 3시간 날씨는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.nextweatheranswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;

    const getJsonLocationCode = util.locationToCode(locationToken)

    const shortForecast = await getSync(getJsonLocationCode, 'forecastShortWeather') // 오늘날씨
    //const nextForecast = await getSync(getJsonLocationCode, 'nextWeather') //내일 날씨

    //errorcode
    if (shortForecast.code != 200) {

    } else { // ok

      const shortForecastList = shortForecast.list
      //const nextForecastList = nextForecast.list

      let pty = '없음' // 강수상황
      let sky = '맑음' //구름상황
      let t1h = 10 //온도
      let ptytime = 1200 + ""
      let skytime = 1200 + ""
      let t1htime = 1200 + ""

      for (let i = 0; i < shortForecastList.length; i++) {
        if (shortForecastList[i].category == 'PTY') {
          pty = util.codeToTextForPTY(shortForecastList[i].fcstValue)
          ptytime = shortForecastList[i].fcstTime + ""
        }
        if (shortForecastList[i].category == 'SKY') {
          sky = util.codeToTextForSKY(shortForecastList[i].fcstValue)
          skytime = shortForecastList[i].fcstTime + ""
        }
        if (shortForecastList[i].category == 'T1H') {
          t1h = shortForecastList[i].fcstValue
          t1htime = shortForecastList[i].fcstTime + ""
        }
      }

      ptytime = (ptytime.substring(0, 2)).replace('0', '')
      if (Number(ptytime) < 12) {
        ptytime = '오전 ' + ptytime
      } else {
        ptytime = '오후 ' + ptytime
      }
      let output = {}
      let sayText = util.shuffleRandom([(ptytime + '시의 구름상황은 ' + sky + ', 강수 예정은 ' + pty + '이며 온도는 약 ' + t1h + '이 될거 같습니다. '),
        (ptytime + '시의 구름상황은 ' + sky + ', 강수 예정은 ' + pty + '이네요. 온도는 약 ' + t1h + '이 될거 같습니다. '),
        (ptytime + '시의 구름상황은 ' + sky + ', 강수 예정은 ' + pty + '이네요.아,  온도는 약 ' + t1h + '이 될거 같아요. '),
        (ptytime + '시의 구름상황은 ' + sky + ', 강수 예정은 ' + pty + '. 온도도 알아볼까요? 온도는 약 ' + t1h + '이 될거 같네요. ')
      ])[0] + util.shuffleRandom(lastTextArr)[0]
      output.nextweatheranswer = sayText
      return res.send(makeJson(output))

    } //200




  } // function


  //평균 걸음과 나이대별 걸음 비교
  function averageWalk_action(res) {
    console.log("averageWalk_action");

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 평균 걸음은 사용하실 수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.averageanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    const name = nameToken
    const sex = sexToken
    const age = new Date(new Date().getTime() + 32400000).getFullYear() - Number(yearToken) //나이

    //평균 걸음 구하기 (insert값 없음)
    averagewalkSQL(averageWalk => {

      const sayText = name + '님은, 나이의 평균은 ' + util.averageWalk(age, sex) +
        '이며, ' + appTitle + '사용자들의 평균은 ' +
        parseInt(averageWalk.avg) + ' 입니다.' +
        util.shuffleRandom(lastTextArr)[0]
      let output = {}
      output.averageanswer = sayText
      return res.send(makeJson(output))

    }) //averagewalkSQL

  } //function end

  // 음식 썩는 지수
  function decay_action(res) {

    let decayDay = '';
    if (parameters.hasOwnProperty('decayDay')) {
      decayDay = parameters.decayDay.value
    }

    knex.select().from('Camelia_Gisu').where('name', 'foodDecay').then((result) => {
      if (result.length == 0) {

        let sayText = '죄송합니다. 에러가 있어서 답변을 드릴 수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
        output.decayanswer = sayText
        return res.send(makeJson(output))

      } else {

        const todayFoodDecay = result[0].today
        const tomorrowFoodDecay = result[0].tomorrow
        const theDayAfterTomorrowFoodDecay = result[0].theDayAfterTomorrow

        let output = {}
        let sayText = util.shuffleRandom([('오늘의 음식 부패지수는 ' + todayFoodDecay + '이며, 내일의 부패지수는 ' + tomorrowFoodDecay + ' 입니다. '),
          ('음식 부패지수는 ' + todayFoodDecay + '이며, 내일의 부패지수는 ' + tomorrowFoodDecay + ' 입니다. '),
          ('음식은 최대한 빨리 드시는게 좋습니다. 오늘 부패지수는 ' + todayFoodDecay + '이며, 내일의 부패지수는 ' + tomorrowFoodDecay + ' 이랍니다. '),
          ('저온에 보관하는게 가장 안전해요! 부패지수는 ' + todayFoodDecay + '이며, 내일의 부패지수는 ' + tomorrowFoodDecay + ' 이네요. ')
        ])[0] + util.shuffleRandom(lastTextArr)[0]
        output.decayanswer = sayText
        return res.send(makeJson(output))

      }
    }).catch((err) => {
      console.log(err);
      throw err
      let sayText = '죄송합니다. 에러가 있어서 답변을 드릴수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
      output.decayanswer = sayText
      return res.send(makeJson(output))
    })


  } // function End


  //불쾌지수
  function bulque_action(res) {
    const bulqueDate = new Date(new Date().getTime() + 32400000).getMonth() + 1;
    let output = {}
    if (5 < bulqueDate && bulqueDate < 10) { //6~9월만 쓴다.

      knex.select().from('Camelia_Gisu').where('name', 'bul').then((result) => {
        if (result.length == 0) {

          let sayText = '죄송합니다. 에러가 있어서 답변을 드릴수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
          output.bulqueanswer = sayText
          return res.send(makeJson(output))

        } else {

          const todayFoodDecay = result[0].today
          const tomorrowFoodDecay = result[0].tomorrow
          const theDayAfterTomorrowFoodDecay = result[0].theDayAfterTomorrow

          let sayText = bulqueDate + '월의 불쾌지수는 ' + todayFoodDecay + '입니다.' + util.shuffleRandom(lastTextArr)[0]
          output.bulqueanswer = sayText
          return res.send(makeJson(output))

        }
      }).catch((err) => {
        console.log(err);
        throw err
        let sayText = '죄송합니다. 에러가 있어서 답변을 드릴수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
        output.bulqueanswer = sayText
        return res.send(makeJson(output))
      })
    } else { //지정한 계절이 아니면
      let sayText = '죄송합니다. 현재 ' + bulqueDate + '월은 불쾌지수가 지원되지 않는 계절입니다. 6월과 9월까지 지원이 됩니다. ' + util.shuffleRandom(lastTextArr)[0]
      output.bulqueanswer = sayText
      return res.send(makeJson(output))
    }


  } // function End



  //체감온도 지수
  function chegam_action(res) {

    knex.select().from('Camelia_Gisu').where('name', 'chegam').then((result) => {
      if (result.length == 0) {
        let sayText = '죄송합니다. 에러가 있어서 답변을 드릴 수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
        output.chegamanswer = sayText
        return res.send(makeJson(output))

      } else {

        const h3 = result[0].h3
        const h6 = result[0].h6
        const h9 = result[0].h9
        const h12 = result[0].h12
        const h15 = result[0].h15
        const h18 = result[0].h18
        const h21 = result[0].h21
        const h24 = result[0].h24
        const h33 = result[0].h33

        let h33Text = util.chegamTemp(h33);

        let output = {}
        let sayText = '체감지수는 낮을수록 더 춥습니다. 오늘의 체감지수는 오전 9시는 ' + h9 + ', ' +
          ' 정오 12시는 ' + h12 + ', ' +
          ' 오후 3시는 ' + h15 + ', ' +
          '오후 6시 ' + h18 + ', 입니다. ' + util.ShuffleUmSay() + '내일은 체감지수가 ' +
          h33Text + util.shuffleRandom(lastTextArr)[0]
        output.chegamanswer = sayText
        return res.send(makeJson(output))

      }
    }).catch((err) => {
      console.log(err);
      throw err
      let sayText = '죄송합니다. 에러가 있어서 답변을 드릴수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
      output.chegamanswer = sayText
      return res.send(makeJson(output))
    })

  } // function End

  //걸음 말하면 칼로리 계산
  function walkcal_action(res) {

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정 연결이 되어 있지 않아 칼로리 계산 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.walkcalanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    let userwalk = 0;
    if (parameters.hasOwnProperty('userwalk')) {
      userwalk = parameters.userwalk.value
    }

    userwalk.replace(/[^0-9]/g, ""); // 숫자만

    // 74cm, 여자는 60.3cm 정도예요.
    const resultWalkCal = parseInt(Number(userwalk) / 30)
    let resultWalkKm = 0;
    if (sexToken == 'F') {
      resultWalkKm = parseInt(Number(userwalk) * 0.6) / 1000
    } else {
      resultWalkKm = parseInt(Number(userwalk) * 0.75) / 1000
    }

    let sayText = '말씀하신 ' + userwalk + '걸음은 칼로리로 환산시 약 ' + resultWalkCal + '칼로리 입니다. 성인 걷기로 환산하면 약 ' + resultWalkKm + '키로미터를 걸은 것과 같습니다. ' + util.shuffleRandom(lastTextArr)[0]
    let output = {}
    output.walkcalanswer = sayText
    return res.send(makeJson(output))

  }

  //어제와 오늘의 걸음 정보
  //어제는 어제의 0시 1분 1초로
  async function walkinfo_action(res) {


    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 어제와 오늘 걸음 조회는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.walkinfoanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    const searchJson = {}

    async.waterfall([refreshToken_action(emailToken)], async function(err, result) {
      //오늘
      const todayD = new Date(new Date().getTime() + 32400000);
      const todayDate = (todayD.getFullYear()) + ('0' + (todayD.getMonth() + 1)).slice(-2) + '' + ('0' + (todayD.getDate())).slice(-2)
      //어제
      const yesterD = new Date((new Date().getTime() - 86400000 + 32400000))
      yesterD.setHours(0, 1, 1); //어제날짜 0시 1분 1초
      const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)

      const insertData = {
        startTime: yesterD.getTime(),
        endTime: todayD.getTime(),
        accessToken: result
      }

      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')
      const walkgoalResult = await walkgoalSQL({
        email: emailToken
      })

      if (fitness.code != 200 || distance.code != 200) {
        //오류 문구 넣기
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.walkinfoanswer = sayText
        return res.send(makeJson(output))
      } else {

        const yesterdayWalkCount = Number(fitness.list[0].walkCount)
        const todayWalkCount = Number(fitness.list[1].walkCount)
        const yesterdayWalkDistance = parseInt(Number(distance.list[0].distance))
        const todayWalkDistance = parseInt(Number(distance.list[1].distance))

        const allPlusWalk = yesterdayWalkCount + todayWalkCount
        let resultText = '';

        if (walkgoalResult.walkgoalSwitch == 'off') {

          const averageW = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken) * 2
          if (allPlusWalk < averageW) { //평균이 더 많으면
            const calWalk = averageW - allPlusWalk
            resultText = util.shuffleRandom(['나이 평균보다 ' + calWalk + '적은 편입니다. ', '흑흑 평균보다 ' + calWalk + '적은 편입니다. ', '평균보다 ' + calWalk + '적은 편인거 같네요. ', '저런.. 평균보다 ' + calWalk + '적은 편입니다. '])[0]
          } else {
            resultText = util.shuffleRandom(['평균보다 많은 편입니다. ', '평균보다 많은 편이에요. ', '우와, 평균보다 많은 편이에요. ', '대단해요. 평균보다 많은 편인거 같네요. '])[0]
          }

        } else if (walkgoalResult.walkgoalSwitch == 'on') { //설정한 걸음이 있으면
          const walkgoalTwice = walkgoalResult.walkgoal * 2;
          if (allPlusWalk < walkgoalTwice) { //설정한 값이 더 크면
            resultText = util.shuffleRandom(['설정하신 걸음보다 ' + (walkgoalTwice - allPlusWalk) + '걸음이 부족합니다. ', '목표 걸음보다 ' + (walkgoalTwice - allPlusWalk) + '걸음이 부족해요. ', '목표한 걸음보다 더 적게 걸었습니다. ', '목표로 한 ' + walkgoalResult.walkgoal + '걸음보다' + (walkgoalTwice - allPlusWalk) + ' 더 적게 걸었습니다. '])[0]

          } else {
            resultText = util.shuffleRandom(['설정 걸음보다 ' + (allPlusWalk - walkgoalTwice) + '걸음 많습니다. ', '목표로 하신 걸음보다 ' + (allPlusWalk - walkgoalTwice) + '걸음 많네요. ', '우와, 목표 걸음보다 ' + (allPlusWalk - walkgoalTwice) + '걸음이 많은거 같아요. '])[0]
          }

        }
        //텍스트 Randomize를 위한 quality 도구
        let arraySay = [
          ('어제는 ' + yesterdayWalkCount + '걸음, ' + yesterdayWalkDistance + '미터를 걸었으며 ' + '오늘은 ' + todayWalkCount + '걸음, ' + todayWalkDistance + '미터를 걸었습니다. ' + resultText),
          ('어제는 ' + yesterdayWalkCount + '걸음, ' + yesterdayWalkDistance + '미터를 걸으셨어요. ' + '오늘은 ' + todayWalkCount + '걸음, ' + todayWalkDistance + '미터를 걸었습니다. ' + resultText),
          ('어제는 ' + yesterdayWalkCount + '걸음을 걸으셨으며 ' + yesterdayWalkDistance + '미터를 걸으셨어요. ' + '오늘은 ' + todayWalkCount + '걸음, ' + todayWalkDistance + '미터를 걸으셨네요. ' + resultText)
        ]

        let sayText = util.shuffleRandom(arraySay)[0] + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.walkinfoanswer = sayText
        return res.send(makeJson(output))
      } //fitness.code != 200 || distance.code != 200

    }) //async

  } // function End

  //어제와 오늘의 심박동
  async function walkbpm_action(res) {

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 어제와 오늘 심박동 조회는 사용하실 수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.walkbpmanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    const searchJson = {}

    async.waterfall([refreshToken_action(emailToken)], async function(err, result) {
      //오늘
      const todayD = new Date(new Date().getTime() + 32400000);
      const todayDate = (todayD.getFullYear()) + ('0' + (todayD.getMonth() + 1)).slice(-2) + '' + ('0' + (todayD.getDate())).slice(-2)
      //어제
      const yesterD = new Date((new Date().getTime() - 172800000 + 32400000))
      const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)

      const insertData = {
        startTime: yesterD.getTime(),
        endTime: todayD.getTime(),
        accessToken: result
      }

      const bpm = await getSync(insertData, 'bpm')

      if (bpm.code != 200) {
        //오류 문구 넣기
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.walkbpmanswer = sayText
        return res.send(makeJson(output))
      } else {

        let resultText = '';
        const bpmList = bpm.list;
        let bpmAllValue = 0;
        let bpmText = 0;
        for (let i = 0; i < bpmList.length; i++) {
          bpmAllValue += bpmList[i].bpm
        }
        if (bpmAllValue == 0) {
          bpmText = '어제와 오늘의 심박동을 조회한 결과 아직 심박동에 대한 데이터가 없습니다. '
        } else {
          bpmText = util.shuffleRandom(['어제와 오늘의 심장박동은 평균 ' + (bpmAllValue / 2) + '이었으며 어제는 ' + bpmList[0].bpm + ', 오늘은 ' + bpmList[1].bpm + ' 입니다.', '어제와 오늘의 심장박동은 평균 ' + (bpmAllValue / 2) + '이었습니다. 어제는 ' + bpmList[0].bpm + ', 오늘은 ' + bpmList[1].bpm + ' 정도 이네요.'])[0]
        }

        let sayText = bpmText + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.walkbpmanswer = sayText
        return res.send(makeJson(output))
      }
    })

  } // function End


  //1주일 걸음 정보
  async function weekinfo_action(res) {
    console.log('weekinfo_action')

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 1주일 만보기 조회는 사용하실 수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.weekinfoanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;

    async.waterfall([refreshToken_action(emailToken)], async function(err, result) {
      const searchJson = {}

      let startTime = new Date(new Date().getTime() - 604800000 + 32400000)
      startTime = startTime.getTime()

      let startTimeDate = new Date(startTime).getFullYear() + '' + (new Date(startTime).getMonth() + 1) + '' + new Date(startTime).getDate()

      let endTime = new Date().getTime() + 32400000
      let endTimeDate = new Date(endTime).getFullYear() + '' + (new Date(endTime).getMonth() + 1) + '' + new Date(endTime).getDate()

      const insertData = {
        startTime: startTime,
        endTime: endTime,
        accessToken: result
      }
      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')
      const walkgoalResult = await walkgoalSQL({
        email: emailToken
      })

      if (fitness.code != 200 || distance.code != 200) {
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.weekinfoanswer = sayText
        return res.send(makeJson(output))
      } else {

        const fitnessList = fitness.list
        const distanceList = distance.list

        let avgWalk7days = 0 // 1주일 걸음 합계
        let avgDis7days = 0 // 1주일 이동한 거리 합계

        //1주일 치를 더해서 평균으로 할 예정
        for (let i = 0; i < fitnessList.length; i++) {
          avgWalk7days += fitnessList[i].walkCount
          avgDis7days += distanceList[i].distance
        }

        avgWalk7days = parseInt(avgWalk7days / 7) //1주일치를 평균으로
        avgDis7days = parseInt(avgDis7days) / 1000 // 거리 km

        const allPlusWalk = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken)

        let resultText = '';

        if (walkgoalResult.walkgoalSwitch == 'off') {

          if (avgWalk7days < allPlusWalk) { //평균보다 더 적으면
            const calWalk = allPlusWalk - avgWalk7days
            resultText = util.shuffleRandom(['나이 평균보다' + parseInt(calWalk) + '걸음 적은 편입니다. ', '저런, 나이대 평균보다' + parseInt(calWalk) + '걸음 적은 편인거 같아요. ', '데이터를 찾아보니 평균보다' + parseInt(calWalk) + '걸음 적은 편이네요. ', '평균 나이대 보다는 ' + parseInt(calWalk) + '걸음 적은 편이에요. '])[0]
          } else {
            resultText = util.shuffleRandom(['평균보다 많은 편입니다. ', '대단해요. 평균보다 많은 편이에요. ', '역시 대단하세요. 평균보다 많은 편입니다. ', '평균을 뛰어넘으셨습니다. '])[0]
          }

        } else if (walkgoalResult.walkgoalSwitch == 'on') { //설정한 걸음이 있으면
          const walkgoals = walkgoalResult.walkgoal
          if (avgWalk7days > walkgoals) { //설정한 값이 더 크면
            resultText = util.shuffleRandom(['설정하신 목표보다 ' + (avgWalk7days - walkgoals) + '걸음 더 많이 걸었습니다. ', '아, 설정하신 걸음 목표보다 더 많은 ' +(avgWalk7days - walkgoals) + '걸음을 걸으셨네요. ', ' ' + (avgWalk7days - walkgoals) + '걸음을 목표 보다 더 많이 걸었습니다. '])[0]
          } else {
            resultText = util.shuffleRandom(['설정하신 목표보다 ' + (walkgoals - avgWalk7days) + '걸음 부족합니다. ', '목표 걸음에 비해서 ' + (walkgoals - avgWalk7days) + '걸음 부족하네요. ', '' +(walkgoals - avgWalk7days) + '걸음이 목표한 걸음에 비해서 부족합니다. '])[0]
          }
        }

        const sayText = util.shuffleRandom([('1주일 동안 평균 ' + parseInt(avgWalk7days) + '걸음을 걸었으며, 총' + avgDis7days + '키로미터를 걸었습니다. ' + util.ShuffleUmSay() + resultText),
          ('일주일 평균 ' + parseInt(avgWalk7days) + '걸음을 걸었으며, 총' + avgDis7days + '키로미터를 걸으셨어요. ' + util.ShuffleUmSay() + resultText),
          ('일주일이죠? 평균 ' + parseInt(avgWalk7days) + '걸음을 걸었으며, 총' + avgDis7days + '키로미터를 걸었습니다. ' + util.ShuffleUmSay() + resultText)
        ])[0] + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.weekinfoanswer = sayText
        return res.send(makeJson(output))
      }
    }); // waterfall End


  } // function End


  //1달 걸음 정보
  async function monthinfo_action(res) {

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 한달 조회는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.monthinfoanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    const searchJson = {}
    async.waterfall([refreshToken_action(emailToken)], async function(err, result) {

      var startTime = new Date(new Date().getTime() - 2592000000 + 32400000)
      startTime.setHours(0, 1, 1); //0시 1분 1분
      startTime = startTime.getTime()

      var startTimeDate = new Date(startTime).getFullYear() + '' + (new Date(startTime).getMonth() + 1) + '' + new Date(startTime).getDate()
      var endTime = new Date().getTime() + 32400000
      var endTimeDate = new Date(endTime).getFullYear() + '' + (new Date(endTime).getMonth() + 1) + '' + new Date(endTime).getDate()

      const insertData = {
        startTime: startTime,
        endTime: endTime,
        accessToken: result
      }

      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')
      const walkgoalResult = await walkgoalSQL({
        email: emailToken
      })

      if (fitness.code != 200 || distance.code != 200) {
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.monthinfoanswer = sayText
        return res.send(makeJson(output))
      } else {

        const fitnessList = fitness.list
        const distanceList = distance.list

        let avgWalk30days = 0
        let avgWalk30daysDistance = 0

        //1주일 치라 한번 돌린다.
        for (let i = 0; i < fitnessList.length; i++) {
          avgWalk30days += fitnessList[i].walkCount
          avgWalk30daysDistance += distanceList[i].distance
        }

        avgWalk30days = parseInt(avgWalk30days / 30) //1주일치를 평균으로
        avgWalk30daysDistance = parseInt(avgWalk30daysDistance) / 1000

        const allPlusWalk = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken)

        let resultText = '';

        if (walkgoalResult.walkgoalSwitch == 'off') {

          if (avgWalk30days < allPlusWalk) { //평균보다 더 적으면
            const calWalk = allPlusWalk - avgWalk30days
            resultText = util.shuffleRandom(['나이 평균보다' + parseInt(calWalk) + '걸음 적은 편입니다. ', '저런, 나이대 평균보다' + parseInt(calWalk) + '걸음 적은 편인거 같아요. ', '데이터를 찾아보니 평균보다' + parseInt(calWalk) + '걸음 적은 편이네요. ', '평균 나이대 보다는 ' + parseInt(calWalk) + '걸음 적은 편이에요. '])[0]
          } else {
            resultText = util.shuffleRandom(['평균보다 많은 편입니다. ', '대단해요. 평균보다 많은 편이에요. ', '역시 대단하세요. 평균보다 많은 편입니다. ', '평균을 뛰어넘으셨습니다. '])[0]
          }

        } else if (walkgoalResult.walkgoalSwitch == 'on') { //설정한 걸음이 있으면

          const walkgoals = walkgoalResult.walkgoal
          if (avgWalk30days > walkgoals) { //목표 걸음보다 더 많으면
            resultText = util.shuffleRandom(['목표걸음은 ' + walkgoals + ' 였죠? 설정하신 목표보다 ' + (avgWalk30days- walkgoals) + '걸음 더 많이 걸었습니다. ', '아, 설정하신 걸음 목표보다 더 많은 ' + (avgWalk30days- walkgoals) + '걸음을 걸으셨네요. ', ' ' + (avgWalk30days- walkgoals) + '걸음을 목표 보다 더 많이 걸었습니다. '])[0]
          } else {
            resultText = util.shuffleRandom(['설정하신 목표보다 ' + (walkgoals - avgWalk30days) + '걸음 부족합니다. ', '목표 걸음' + walkgoals + '에 비해서 ' + (walkgoals - avgWalk30days) + '걸음 부족하네요. ', '' + (walkgoals - avgWalk30days) + '걸음이 목표한 걸음에 비해서 부족합니다. '])[0]
          }
        }
        const sayText = util.shuffleRandom([('한달 동안 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 총' + avgWalk30daysDistance + '키로미터를 걸었습니다. ' + util.ShuffleUmSay() + resultText),
          ('한달 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 총' + avgWalk30daysDistance + '키로미터를 걸으셨어요. ' + resultText),
          ('최근 한달이죠? 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 총' + avgWalk30daysDistance + '키로미터를 걸었습니다. ' + util.ShuffleUmSay() + resultText)
        ])[0] + util.shuffleRandom(lastTextArr)[0]

        let output = {}
        output.monthinfoanswer = sayText
        return res.send(makeJson(output))
      }

    }); //waterfall End



  } // function End


  //임의의 날짜와 임의의 날자 로 계산
  async function userDate_action(res) {


    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 특정 달 조회는 사용하실 수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.userdateanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    let userDate = 10;
    if (parameters.hasOwnProperty('userdate')) {
      userDate = parameters.userdate.value
      userDate.replace(/[^0-9]/g, ""); // 숫자만 남기기
    }


    if (userDate > 12) { //13월 같은걸 말하면
      userDate = 12
    }

    var userDateYear = new Date().getFullYear() //현재 년도

    if (userDate >= (new Date().getMonth() + 1)) { // 받은 월이 현재 년도를 초과하는지
      userDateYear = new Date().getFullYear() - 1 // 초과하면 작년으로
    }

    const searchJson = {}
    async.waterfall([refreshToken_action(emailToken)], async function(err, result) {

      var startTime = new Date(userDateYear, Number(userDate) - 1, 1) // 첫날
      var startTimeDate = new Date(startTime).getFullYear() + '' + (new Date(startTime).getMonth() + 1) + '' + new Date(startTime).getDate()
      var endTime = new Date(userDateYear, Number(userDate), 0) // 마지막 날
      var endTimeDate = new Date(endTime).getFullYear() + '' + (new Date(endTime).getMonth() + 1) + '' + new Date(endTime).getDate()

      const insertData = {
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        accessToken: result
      }

      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')
      const walkgoalResult = await walkgoalSQL({
        email: emailToken
      })

      if (fitness.code != 200 || distance.code != 200) {
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.userdateanswer = sayText
        return res.send(makeJson(output))

      } else {
        const fitnessList = fitness.list
        const distanceList = distance.list
        let avgWalk30days = 0
        let avgWalk30daysDistance = 0

        //1주일 치라 한번 돌린다.
        for (let i = 0; i < fitnessList.length; i++) {
          avgWalk30days += fitnessList[i].walkCount
          avgWalk30daysDistance += distanceList[i].distance
        }

        avgWalk30days = parseInt(avgWalk30days / 30) //1주일치를 평균으로
        avgWalk30daysDistance = parseInt(avgWalk30daysDistance) / 1000

        const allPlusWalk = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken)

        let resultText = '';

        if (walkgoalResult.walkgoalSwitch == 'off') {

          if (avgWalk30days < allPlusWalk) { //평균보다 더 적으면
            const calWalk = allPlusWalk - avgWalk30days
            resultText = util.shuffleRandom(['나이 평균보다' + parseInt(calWalk) + '걸음 적은 편입니다. ', '저런, 나이대 평균보다' + parseInt(calWalk) + '걸음 적은 편인거 같아요. ', '데이터를 찾아보니 평균보다' + parseInt(calWalk) + '걸음 적은 편이네요. ', '평균 나이대 보다는 ' + parseInt(calWalk) + '걸음 적은 편이에요. '])[0]
          } else {
            resultText = util.shuffleRandom(['평균보다 많은 편입니다. ', '대단해요. 평균보다 많은 편이에요. ', '역시 대단하세요. 평균보다 많은 편입니다. ', '평균을 뛰어넘으셨습니다. '])[0]
          }

        } else if (walkgoalResult.walkgoalSwitch == 'on') { //설정한 걸음이 있으면

          const walkgoals = walkgoalResult.walkgoal
          if (avgWalk30days > walkgoals) { //설정한 값보다 더 많이 걸으면
            resultText = util.shuffleRandom(['목표걸음은 ' + walkgoals + ' 였던가요? 목표보다 ' + (avgWalk30days - walkgoals) + '걸음 더 많이 걸으셨어요. 대단하세요. ','목표걸음은 ' + walkgoals + ' 였죠? 설정하신 목표보다 ' + (avgWalk30days - walkgoals) + '걸음 더 많이 걸었습니다. ', '아, 설정하신 걸음 목표보다 더 많은 ' + (avgWalk30days - walkgoals) + '걸음을 걸으셨네요. ', ' 와아, ' + (avgWalk30days - walkgoals) + '걸음을 목표 보다 더 많이 걸었습니다. '])[0]
          } else { // 설정한 값이 더 커서 적게 걸었으면
            resultText = util.shuffleRandom(['설정하신 목표보다 ' + (walkgoals - avgWalk30days) + '걸음 부족합니다. ', '목표 걸음' + walkgoals + '에 비해서 ' + (walkgoals - avgWalk30days) + '걸음 부족하네요. ', '' + (walkgoals - avgWalk30days) + '걸음이 목표한 걸음에 비해서 부족합니다. '])[0]
          }
        }
        const sayText = util.shuffleRandom([('한달 동안 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 총' + avgWalk30daysDistance + '키로미터를 걸었습니다. ' + util.ShuffleUmSay() + resultText),
          ('한달 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 총' + avgWalk30daysDistance + '키로미터를 걸으셨어요. ' + resultText),
          ('최근 한달이죠? 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 총' + avgWalk30daysDistance + '키로미터를 걸었습니다. ' + util.ShuffleUmSay() + resultText)
        ])[0] + util.shuffleRandom(lastTextArr)[0]

        let output = {}
        output.userdateanswer = sayText
        return res.send(makeJson(output))
      }

    }); //waterfall End
  } // function End


  function foodInfo_action(res) {
    let foodName = '';
    if (parameters.hasOwnProperty('foodname')) {
      foodName = parameters.foodname.value
    }
    const foodInfo = util.foodInfo(foodName) //cal info json
    const foodCalTo = foodInfo.cal * 30
    let sayText = foodName + '은' + foodInfo.info + '이며, 만보기로 환산시 ' + foodCalTo + '걸음을 걸어야 합니다. ' + util.shuffleRandom(lastTextArr)[0]
    let output = {}
    output.foodinfoanswer = sayText
    return res.send(makeJson(output))
  } //foodInfo_action

  function foodColesterol_action(res) {
    let foodnamecol = '';
    if (parameters.hasOwnProperty('foodnamecol')) {
      foodnamecol = parameters.foodnamecol.value
    }
    const foodInfo = util.foodColesterol(foodnamecol) //cal info json
    let sayText = util.shuffleRandom([(foodnamecol + '의 콜레스테롤은 ' + foodInfo.colesterol + '밀리그램 이며, 지방은 ' + foodInfo.fat + '그램 들어 있습니다. '),
      (foodnamecol + '말이죠? ' + foodnamecol + '의 콜레스테롤은 ' + foodInfo.colesterol + '밀리그램 이네요. 아, 지방은 ' + foodInfo.fat + '그램 들어 있답니다. ',
        (foodnamecol + '말이신가요? 콜레스테롤은 ' + foodInfo.colesterol + '밀리그램 이며, 지방은 ' + foodInfo.fat + '그램 들어 있습니다. '),
        (foodnamecol + '말이군요! 그럼 알아보겠습니다. ' + foodnamecol + '의 콜레스테롤은' + foodInfo.colesterol + '밀리그램 이며, 지방은 ' + foodInfo.fat + '그램 들어 있네요. '),
        (foodnamecol + '이죠? 우선 콜레스테롤은 ' + foodInfo.colesterol + '밀리그램 이며, 지방은 ' + foodInfo.fat + '그램 들어 있습니다. '),
        (foodnamecol + '을 알아보겠습니다. 우선 지방은 ' + foodInfo.fat + '그램 들어 있으며 콜레스테롤은 ' + foodInfo.colesterol + '밀리그램 들어있습니다. '))
    ])[0] + util.shuffleRandom(lastTextArr)[0]

    let output = {}
    output.foodcolesterolanswer = sayText
    return res.send(makeJson(output))
  } //foodInfo_action




  //파일 읽기 모듈
  var fs = require("fs");
  var ejs = require("ejs");

  // 종합 이메일 보내는 부분
  async function email_action(res) {


    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 1달 조회 이메일 보내기 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
      output.mailsendanswer = sayText
      return res.send(makeJson(output))
    }

    const accessToken = context.session.accessToken //context
    const base64toJson = JSON.parse((Buffer.from(accessToken.split('//')[1], 'base64')).toString('utf8')) // 종합데이터 받기
    //=====================TOKEN_DATA=======================
    const emailToken = base64toJson.email;
    const nameToken = base64toJson.name;
    const sexToken = base64toJson.sex;
    const yearToken = base64toJson.year;
    const locationToken = base64toJson.location;


    let monthemail = (new Date(new Date().getTime() + 32400000).getMonth() + 1)
    let insertData = {}

    const searchJson = {}
    async.waterfall([refreshToken_action(emailToken)], async function(err, result) {

      if (parameters.hasOwnProperty('monthemail')) {
        monthemail = parameters.monthemail.value
        monthemail.replace(/[^0-9]/g, ""); // 숫자만 남기기

        if (monthemail > 12) { //13월 같은걸 말하면
          monthemail = 12
        }

        var userDateYear = new Date(new Date().getTime() + 32400000).getFullYear() //현재 년도

        if (monthemail >= (new Date(new Date().getTime() + 32400000).getMonth() + 1)) { // 받은 월이 현재 년도를 초과하는지
          userDateYear = new Date(new Date().getTime() + 32400000).getFullYear() - 1 // 초과하면 작년으로
        }

        var startTime = new Date(userDateYear, Number(monthemail) - 1, 1) // 첫날
        var startTimeDate = new Date(startTime).getFullYear() + '' + (new Date(startTime).getMonth() + 1) + '' + new Date(startTime).getDate()
        var endTime = new Date(userDateYear, Number(monthemail), 0) // 마지막 날
        var endTimeDate = new Date(endTime).getFullYear() + '' + (new Date(endTime).getMonth() + 1) + '' + new Date(endTime).getDate()

        insertData = {
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
          accessToken: result
        }
      } else {
        // 직전 한달
        const todayD = new Date(new Date().getTime() + 32400000);
        const todayDate = (todayD.getFullYear()) + ('0' + (todayD.getMonth() + 1)).slice(-2) + '' + ('0' + (todayD.getDate())).slice(-2)
        const yesterD = new Date((new Date().getTime() - 1000 * 60 * 60 * 24 * 30 + 32400000))
        yesterD.setHours(0, 1, 1); //0시 1분 1분
        const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)

        insertData = {
          startTime: yesterD.getTime(),
          endTime: todayD.getTime(),
          accessToken: result
        }

      }

      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')

      if (fitness.code != 200 || distance.code != 200) {
        let output = {}
        output.mailsendanswer = '죄송합니다. 메일보내기가 실패하였습니다. 연동된 계정에 문제가 있을 가능성이 있습니다. ' + util.shuffleRandom(lastTextArr)[0]
        return res.send(makeJson(output))
      } else {

        let fitnessList = fitness.list
        let distanceList = distance.list

        let avgWalk30days = 0
        let avgWalk30daysDistance = 0

        //1달 치라 한번 돌린다.
        for (let i = 0; i < fitnessList.length; i++) {
          avgWalk30days += fitnessList[i].walkCount
          avgWalk30daysDistance += distanceList[i].distance
          fitnessList[i].distance = distanceList[i].distance
          fitnessList[i].cal = parseInt(Number(fitnessList[i].walkCount) / 30)
        }

        avgWalk30days = Math.round(avgWalk30days / 30) //1주일치를 평균으로
        avgWalk30daysDistance = parseInt(avgWalk30daysDistance) / 1000

        const subject = '[' + appTitle + '] 종합 데이터를 보내드립니다.'

        ejs.renderFile("./camelia_web/email/emailMonth.ejs", {
          allWalk: avgWalk30days + '걸음',
          allKm: avgWalk30daysDistance + 'Km',
          arr: fitnessList

        }, function(err, data) {
          if (err) {
            console.log(err);
          } else {
            transporter.sendMail({
              from: 'noreply.mailsenderaog@gmail.com',
              to: emailToken,
              subject: subject,
              html: data
            }, (err, info) => {
              console.log(info.envelope);
              console.log(info.messageId);
            });
          }

        });

        let output = {}
        output.mailsendanswer = nameToken + util.shuffleRandom(['님의 연동하신 계정으로 한달 데이터를 이메일로 보냈습니다. ', '님의 이메일로 한달 만보기, 걸은 거리 정보를 보냈습니다. ', '님의 연동하신 계정으로 이메일을 지금 보냈답니다. '])[0] + util.shuffleRandom(lastTextArr)[0]
        return res.send(makeJson(output))

      }

    }); //waterfall End


  } //function end

  //====================================================================
  //====================================================================
  //====================================================================

  // 지원되는 메뉴
  function support_action(res) {
    const arrayCommand = ['오늘의 불쾌지수', '부패지수 알려줘', '고등의의 콜레스테롤을 알려줘', '야외운동하기 어때', '일주일 데이터를 알려줘', '한달 데이터를 알려줘', '오늘의 데이터를 알려줘', '된장국 칼로리 알려줘', '운동하기 좋은 날씨니', '이메일을 보내줘', '6월 데이터를 알려줘', '어제와 오늘의 심박동은 어떻게 되']
    let sayText = '현재 지원되는 메뉴중 3가지를 알려드리겠습니다.  ' + util.listTextMake(util.shuffleRandom(arrayCommand)) + ' 입니다. ' + util.shuffleRandom(lastTextArr)[0]
    let output = {}
    output.supportanswer = sayText
    return res.send(makeJson(output))

  } // function End

  //  도움말
  function help_action(res) {

    let sayText = '안녕하세요. ' + appTitle + '는 구글 피트니스 정보를 이용하여 날씨와 연령등의 정보로 다양한 정보를 알려드리는 앱입니다. 지원되는 메뉴를 알려줘 라고 말하시면 랜덤하게 명령어도 알려드립니다.' + util.shuffleRandom(lastTextArr)[0]
    let output = {}
    output.helpanswer = sayText
    return res.send(makeJson(output))

  } // function End

  // 다음과 같은 형식으로 입력
  function fallback_action(res) {

    let sayText = '죄송합니다. 어떤 말인지 이해하지 못했습니다. ' + util.shuffleRandom(lastTextArr)[0]
    let output = {}
    output.fallbackanswer = sayText
    return res.send(makeJson(output))

  } // function End


  const refreshToken_action = (emailToken) => function(callback) {
    knex('Camelia_Users').where('email', emailToken).then(rows => {
      const googleAccessTokenRefresh = rows[0].googleAccessTokenRefresh;
      var insertData = {
        refreshToken: googleAccessTokenRefresh,
        email: emailToken
      }
      //토큰 타임 비교해서 googleTokenTime이 크면 갱신하지 않는다.
      if (rows[0].googleTokenTime == null) {
        callback(null, false)
      } else {
        // 갱신을 안하면 기존 DB에서 읽어서 처리
        if (rows[0].googleTokenTime > (new Date(new Date().getTime() + 32400000).getTime())) {
          console.log('rows[0].googleTokenTime : 갱신안함')
          knex('Camelia_Users').select('googleAccessToken').where('email', emailToken)
            .then(rows => {

              callback(null, rows[0].googleAccessToken)
            })
          // 갱신시 request 해서 callback 처리된 데이터 가져오기
        } else {
          console.log('rows[0].googleTokenTime : 갱신함')
          refreshToken(insertData, function(token) {

            callback(null, token)
          })

        }
      }

    })
  }

  //====================================================================
  //평균 걸음 비교 1. 전체 데이터, 2. 평균 데이터 둘다 말해줌
  const AVERAGEWALK_ACTION = 'action.averagewalk';
  //부페지수
  const DECAY_ACTION = 'action.decay';
  //불쾌지수
  const BULQUE_ACTION = 'action.bulque';
  //체감온도
  const CHEGAM_ACTION = 'action.chegam';
  //어제와 오늘
  const WALKINFO_ACTION = 'action.walkinfo';
  //1주 걸음소모
  const WEEKINFO_ACTION = 'action.weekinfo';
  //1달 걸음소모
  const MONTHINFO_ACTION = 'action.monthinfo';
  //특정 달 조회 : 6월
  const USERDATE_ACTION = 'action.userdate'

  // 음식 열량
  const FOODINFO_ACTION = 'action.foodinfo';
  // 음식 콜레스테롤
  const FOODCOLESTEROL_ACTION = 'action.foodcolesterol';

  //어제와 오늘의 심박동
  const WALKBPM_ACTION = 'action.walkbpm';

  //자외선 지수
  const UV_ACTION = 'action.uv'

  // 바이러스 지수
  const VIRUS_ACTION = 'action.virus'

  //이메일로 최근 한달 정보
  const EMAIL_ACTION = 'action.email';
  // 걸음수를 칼로리 계산해줌  30 => 1칼로리
  const WALKCAL_ACTION = 'action.walkcal';
  //날씨 평가해서 운동 가야할지 말아야 할지 알려줌
  const WELCOME_ACTION = 'action.welcome';

  //일기예보 : 초단기
  const NEXTWEATHER_ACTION = 'action.nextweather';

  //========================================================================
  //퀄리티
  //도움말
  const HELP_INTENT = 'action.help'
  //지원되는 메뉴 랜덤으로 3개정도
  const SUPPORT_INTENT = 'action.support'
  //========================================================================
  //최초 시작 부분
  //========================================================================
  console.log("actionName : " + actionName);

  switch (actionName) { //intent 별 분기처리
    //기능별
    case AVERAGEWALK_ACTION: //테스트완료
      averageWalk_action(res);
      break;
    case DECAY_ACTION: //테스트완료
      decay_action(res);
      break;
    case BULQUE_ACTION:
      bulque_action(res);
      break;
    case CHEGAM_ACTION: //테스트완료
      chegam_action(res);
      break;
    case WALKINFO_ACTION: //테스트완료
      walkinfo_action(res);
      break;
    case WEEKINFO_ACTION: //테스트완료
      weekinfo_action(res);
      break;
    case MONTHINFO_ACTION: //테스트완료
      monthinfo_action(res);
      break;

    case VIRUS_ACTION: //바이러스 지수
      virus_action(res);
      break;

    case FOODINFO_ACTION: //음식추천
      foodInfo_action(res);
      break;

    case FOODCOLESTEROL_ACTION: //콜레스테롤
      foodColesterol_action(res);
      break;

    case EMAIL_ACTION: //이메일보내기
      email_action(res);
      break;
    case WALKCAL_ACTION: //걸음 말하면 칼로리 계산
      walkcal_action(res);
      break;

    case WELCOME_ACTION: //지금 날씨가 운동하기 좋은가
      welcome_action(res)
      break;
    case NEXTWEATHER_ACTION: //3시간 뒤의 날씨
      nextweather_action(res)
      break;

    case USERDATE_ACTION: //사용자날짜
      userDate_action(res)
      break;

    case WALKBPM_ACTION: //사용자 심박동
      walkbpm_action(res)
      break;

    case UV_ACTION: // 자외선 지수
      uv_action(res)
      break;


      //퀄리티용
    case HELP_INTENT:
      help_action(res)
      break;
    case SUPPORT_INTENT:
      support_action(res)
      break;
    default: //없는 경우 Fallback으로 일단 처리
      fallback_action(res);
  }



}
