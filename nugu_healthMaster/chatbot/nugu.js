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
  console.log('requestBody : ', requestBody)
  //=============================================================================
  console.log(`request: ${JSON.stringify(actionName)}`)
  //=====================request=======================
  //=====================request=======================
  //=====================request=======================
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
        console.log('startTime: ', startTime);
        console.log('endTime: ', endTime);

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
            durationMillis: 86400000 //하루
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
        console.log('startTime: ', startTime);
        console.log('endTime: ', endTime);

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
        console.log('startTime: ', startTime);
        console.log('endTime: ', endTime);

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
      // console.log(body)
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

            // console.log(new Date(Number(originalJson[i].startTimeMillis)))
            // console.log(new Date(Number(originalJson[i].endTimeMillis)))
            // console.log(originalJson[i].dataset[0].point[0])
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

            // console.log(new Date(Number(originalJson[i].startTimeMillis)))
            // console.log(new Date(Number(originalJson[i].endTimeMillis)))
            // console.log(originalJson[i].dataset[0].point[0])
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
    console.log('makeJson')
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
    console.log(JSON.stringify(jsonReturn))
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
        console.log(rows)
        callback(rows[0])
      })
  }

  function nowWeatherSQL(name, callback) { //도시명으로 1줄 데이터
    //유저 평균 걸음수
    knex('Camelia_NowWeather').where('name', name)
      .then(rows => {
        console.log(rows)
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
        console.log('Camelia_Predict: ', rows)
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
  //==========================================================================
  //==========================================================================
  //==========================================================================


  //종합적으로 알려드림
  function welcome_action(res) {
    console.log("welcome_action");
    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
    console.log(emailToken)
    console.log(nameToken)
    console.log(sexToken)
    console.log(yearToken)
    console.log(locationToken)

    const searchJson = {
      name: locationToken
    }
    console.log('locationToken: ', locationToken)
    var d = new Date(new Date().getTime() + 32400000).getMonth() + 1; //0부터 시작: 실제 달 숫자


    searchJson.requestType = 'chegam'
    searchJson.requestType2 = 'uv'


    Promise.all([nowWeatherMiseSQL(searchJson), predictSQL(searchJson), gisuSQL(searchJson), gisuSQL2(searchJson)]).then(result => {
      //1번은 현재날씨(미세포함), 2번은 예상바이러스지수, 3번은 생활지수
      //result => Array
      console.log('welcome_action Promise result : ', result)

      const nowWeatherJson = result[0] //T1H(varchar : Num), mise(varchar), PTY(varchar :Num)
      const predictJson = result[1] //risk riskSay
      const gisuJson = result[2] //chegam, bul => h시리즈 : foodDecay, uv today tomorrow theDayAfterTomorrow
      const gisu2Json = result[3] //chegam, bul => h시리즈 : foodDecay, uv today tomorrow theDayAfterTomorrow

      let chegamTemp = ''
      //체감온도 11~3월 만 가능
      if (10 < d || d < 4) {
        //체감온도
        var nowd = new Date(new Date().getTime() + 32400000).getHours()
        if (nowd < 4) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h3;
        } else if (4 <= nowd && nowd < 7) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h6;
        } else if (7 <= nowd && nowd < 10) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h9;
        } else if (10 <= nowd && nowd < 13) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h12;
        } else if (13 <= nowd && nowd < 16) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h15;
        } else if (16 <= nowd && nowd < 19) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h18;
        } else if (19 <= nowd && nowd < 22) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h21;
        } else if (22 <= nowd && nowd < 25) {
          chegamTemp = '체감온도 지수는 ' + gisuJson.h24;
        }
      }

      //자외선
      let uvTemp = ''
      //자외선 3월에서 11
      if (2 < d && d < 12) {
        uvTemp = util.uvSay(gisu2Json.today);
      }

      const tempVoice = util.TempText(nowWeatherJson.T1H);

      //	0:없음, 1:비, 2:비/눈, 3:눈/비, 4:눈
      let ptyInsert = '';
      switch (parseInt(nowWeatherJson.PTY)) {
        case 0:
          ptyInsert = '맑은 상태입니다. '
          break;
        case 1:
          ptyInsert = '비가 내리는 상태입니다. '
          break;
        case 2:
          ptyInsert = '비나 눈이 내리는 상태입니다. '
          break;
        case 3:
          ptyInsert = '눈이나 비가 내리는 상태입니다. '
          break;
        case 4:
          ptyInsert = '눈이 내리는 상태입니다. '
          break;
      }

      let miseResult = '';
      if ((nowWeatherJson.mise).trim() == '나쁨') {
        miseResult = nowWeatherJson.mise + '으로 나가지 않기를 추천하며. '
      } else if ((nowWeatherJson.mise).trim() == '보통') {
        miseResult = nowWeatherJson.mise + '으로 왠만하면 실내 운동을 추천하며 '
      } else if ((nowWeatherJson.mise).trim() == '좋음') {
        miseResult = nowWeatherJson.mise + '으로 실외 운동도 좋으며 '
      }
      console.log(predictJson.risk)
      let output = {}
      let sayText = nameToken + '님, 운동하기 좋은지 알아볼까요? 우선 지금 온도는 ' + nowWeatherJson.T1H + '도 이며 강수상태는 ' + ptyInsert +
        ' ' + tempVoice + util.ShuffleUmSay() + '초 미세먼지는 ' + miseResult +
        ' 감기예보는 ' + util.virusSay(predictJson.risk1) + ' ' + uvTemp + util.shuffleRandom(lastTextArr)[0]
      output.welcomeanswer = sayText
      return res.send(makeJson(output))


    })

  } //function end

  async function nextweather_action(res) {

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
        ptytime = '오전 ' + ptytime
      }
      let output = {}
      let sayText = ptytime + ' 시의 구름상황은 ' + sky + ', 강수 예정은 ' + pty + '이며 온도는 약 ' + t1h + '이 될거 같습니다.' + util.shuffleRandom(lastTextArr)[0]
      output.nextweatheranswer = sayText
      return res.send(makeJson(output))

    } //200




  } // function


  //평균 걸음과 나이대별 걸음 비교
  function averageWalk_action(res) {
    console.log("averageWalk_action");

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
      console.log(averageWalk)
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

        let sayText = '죄송합니다. 에러가 있어서 답변을 드릴수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
        output.decayanswer = sayText
        return res.send(makeJson(output))

      } else {

        const todayFoodDecay = result[0].today
        const tomorrowFoodDecay = result[0].tomorrow
        const theDayAfterTomorrowFoodDecay = result[0].theDayAfterTomorrow

        let output = {}
        let sayText = '오늘의 부패지수는 ' + todayFoodDecay + '이며, 내일과 모래의 부패지수는 ' + tomorrowFoodDecay + ', ' + theDayAfterTomorrowFoodDecay + '입니다. ' + util.shuffleRandom(lastTextArr)[0]
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
        let sayText = '죄송합니다. 에러가 있어서 답변을 드릴수가 없었습니다. ' + util.shuffleRandom(lastTextArr)[0]
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
          '오후 6시 ' + h18 + ', ' + '오후 9시는 ' + h21 + ', 입니다. ' + util.ShuffleUmSay() + '내일은 체감지수가 ' +
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
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
    console.log(userwalk);
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
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
      const yesterD = new Date((new Date().getTime() + 32400000 - 86400000))
      yesterD.setHours(0, 1, 1); //어제날짜 0시 1분 1초
      const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)

      console.log('todayD: ', todayD)
      console.log('yesterD: ', yesterD)
      console.log('result[0] ', result)
      const insertData = {
        startTime: yesterD.getTime(),
        endTime: todayD.getTime(),
        accessToken: result
      }

      const avgWalk = await averageSQL('')
      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')
      const bpm = await getSync(insertData, 'bpm')

      if (fitness.code != 200 || distance.code != 200) {
        //오류 문구 넣기
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.walkinfoanswer = sayText
        return res.send(makeJson(output))
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

        const bpmList = bpm.list;
        console.log(bpmList)

        let bpmAllValue = 0;
        let bpmText = 0;
        for (let i = 0; i < bpmList.length; i++) {
          bpmAllValue += bpmList[i].bpm
        }
        if (bpmAllValue == 0) {
          bpmText = ''
        } else {
          bpmText = '아, 심박동도 있네요. 심장박동은 평균 ' + (bpmAllValue / 2) + '이었으며 어제는 ' + bpmList[0].bpm + ', 오늘은 ' + bpmList[1].bpm + ' 입니다.'
        }

        let sayText = '어제는 ' + yesterdayWalkCount + '걸음, ' + yesterdayWalkDistance + '미터를 걸었으며 ' +
          '오늘은 ' + todayWalkCount + '걸음, ' + todayWalkDistance + '미터를 걸었습니다. ' + nameToken + '님의 어제와 오늘을 합친 걸음은 ' +
          resultText + bpmText + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.walkinfoanswer = sayText
        return res.send(makeJson(output))
      }
    })



  } // function End


  //1주일 걸음 정보
  async function weekinfo_action(res) {
    console.log('weekinfo_action')

    if (!context.session.hasOwnProperty('accessToken')) {
      let output = {}
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
      startTime.setHours(0, 1, 1); // 0시 1분 1초
      startTime = startTime.getTime()

      let startTimeDate = new Date(startTime).getFullYear() + '' + (new Date(startTime).getMonth() + 1) + '' + new Date(startTime).getDate()

      let endTime = new Date().getTime() + 32400000
      let endTimeDate = new Date(endTime).getFullYear() + '' + (new Date(endTime).getMonth() + 1) + '' + new Date(endTime).getDate()

      const insertData = {
        startTime: startTime,
        endTime: endTime,
        accessToken: result
      }
      console.log(insertData)
      const avgWalk = await averageSQL('')
      const fitness = await getSync(insertData, 'fitness')
      const distance = await getSync(insertData, 'distance')
      const bpm = await getSync(insertData, 'bpm')
      console.log(fitness)

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

        avgWalk7days = avgWalk7days / 7 //1주일치를 평균으로
        avgDis7days = parseInt(avgDis7days) / 1000

        const allPlusWalk = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken)
        console.log('allPlusWalk ', allPlusWalk)
        let resultText = '';
        if (avgWalk7days < allPlusWalk) { //평균보다 더 적으면
          const calWalk = allPlusWalk - avgWalk7days
          resultText = '평균보다 적은 편입니다. 하루평균 ' + parseInt(calWalk) + '걸음이 부족하며, 평소에 더 많은 걸음 혹은 부족함을 운동으로 채워보시는건 어떨까요? '
        } else {
          resultText = '평균보다 많은 편입니다. 잘 유지하시면 더욱 건강하겠죠? '
        }

        const sayText = '1주일 동안 평균 ' + parseInt(avgWalk7days) + '걸음을 걸었으며, 전체 걸은 거리는' + avgDis7days + 'km입니다.' +
          ' 나이대 평균에 비교를 해보면 ' + nameToken + ' 어제와 오늘을 합친 걸음은 ' + resultText + util.bpmText(bpm, 7) +
          util.shuffleRandom(lastTextArr)[0]
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
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
      const bpm = await getSync(insertData, 'bpm')
      console.log(fitness)
      console.log(distance)
      console.log('bpm : ', bpm)

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

        avgWalk30days = avgWalk30days / 30 //1주일치를 평균으로
        avgWalk30daysDistance = parseInt(avgWalk30daysDistance) / 1000

        const allPlusWalk = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken)

        let resultText = '';
        if (avgWalk30days < allPlusWalk) { // 평균보다 더 적으면
          const calWalk = allPlusWalk - avgWalk30days
          resultText = '평균보다 적은 편입니다. ' + util.ShuffleUmSay() + '하루 평균 ' + parseInt(calWalk) + '걸음이 부족하며, 평소에 더 많은 걸음 혹은 부족함을 운동으로 채워보시는건 어떨까요? '
        } else {
          resultText = '평균보다 많은 편입니다. 잘 유지하시면 더욱 건강하겠죠? '
        }

        const sayText = '1달 동안 평균 ' + parseInt(avgWalk30days) + '걸음을 걸었으며, 전체 걸은 거리는' + avgWalk30daysDistance + 'km입니다.' +
          ' 나이대 평균에 비교를 해보면 ' + nameToken + '님은, ' + resultText + util.bpmText(bpm, 30) +
          util.shuffleRandom(lastTextArr)[0]
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
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
    console.log('userDate: ', userDate)

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
      const bpm = await getSync(insertData, 'bpm')


      if (fitness.code != 200 || distance.code != 200) {
        const sayText = '죄송합니다. 구글 계정연동에 문제가 있어 데이터를 가져오지 못했습니다. 누구 앱에서 계정을 연동을 하신 후 사용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        output.userdateanswer = sayText
        return res.send(makeJson(output))

      } else {
        console.log('ok')
        const fitnessList = fitness.list
        const distanceList = distance.list
        console.log('fitnessList')
        console.log('distanceList')
        let avgWalk30days = 0
        let avgWalk30daysDistance = 0

        //1주일 치라 한번 돌린다.
        for (let i = 0; i < fitnessList.length; i++) {
          avgWalk30days += fitnessList[i].walkCount
          avgWalk30daysDistance += distanceList[i].distance
        }

        avgWalk30days = avgWalk30days / 30 //1주일치를 평균으로
        avgWalk30daysDistance = parseInt(avgWalk30daysDistance) / 1000
        console.log(avgWalk30days)
        console.log(avgWalk30daysDistance)
        const allPlusWalk = util.averageWalk((new Date().getFullYear() - Number(yearToken)), sexToken)

        let resultText = '';
        if (avgWalk30days < allPlusWalk) { // 평균보다 더 적으면
          const calWalk = allPlusWalk - avgWalk30days
          resultText = '평균보다 적은 편입니다. 하루 평균 ' + parseInt(calWalk) + '걸음이 부족하며, 평소에 더 많은 걸음 혹은 부족함을 운동으로 채워보시는건 어떨까요? '
        } else {
          resultText = '평균보다 많은 편입니다. 잘 유지하시면 더욱 건강하겠죠? '
        }

        const sayText = userDate + '월 동안 평균 ' + parseInt(avgWalk30days) +
          '걸음을 걸었으며 전체 걸은 거리는' + avgWalk30daysDistance + 'km입니다.' +
          ' 나이 평균에 비교를 해보면 ' + nameToken + '님은, ' + resultText + util.bpmText(bpm, 30) + util.shuffleRandom(lastTextArr)[0]
        let output = {}
        console.log(sayText)
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
    let sayText = foodnamecol + '의 콜레스테롤은 ' + foodInfo.colesterol + '밀리그램 이며, 지방은 ' + foodInfo.fat + '그램 들어 있습니다. ' + util.shuffleRandom(lastTextArr)[0]
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
      let sayText = '죄송합니다. 현재 계정연결이 되어 있지 않아 이 서비스는 사용하실수 없습니다. 누구앱에서 계정연동을 하신후 이용해 주세요. ' + util.shuffleRandom(lastTextArr)[0]
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
        output.mailsendanswer = nameToken + '님의 연동하신 계정으로 한달 데이터를 이메일로 보냈습니다. ' + util.shuffleRandom(lastTextArr)[0]
        return res.send(makeJson(output))

      }

    }); //waterfall End


  } //function end


  //====================================================================
  //====================================================================
  //====================================================================

  // 지원되는 메뉴
  function support_action(res) {
    const arrayCommand = ['오늘의 불쾌지수', '오늘의 음식 부패지수', '야외운동 어때', '일주일 데이터를 알려줘', '한달 데이터를 알려줘', '오늘의 데이터를 알려줘', '된장국 칼로리 알려줘', '운동하기 좋은 날씨니', '이메일을 보내줘', '6월 데이터를 알려줘']
    let sayText = '현재 지원되는 메뉴는 ' + util.listTextMake(util.shuffleRandom(arrayCommand)) + ' 입니다. ' + util.shuffleRandom(lastTextArr)[0]
    let output = {}
    output.supportanswer = sayText
    return res.send(makeJson(output))

  } // function End

  //  도움말
  function help_action(res) {

    let sayText = '안녕하세요. ' + appTitle + '는 구글 피트니스 정보를 이용하여 날씨와 연령등의 정보로 다양한 정보를 알려드리는 앱입니다. 지원되는 메뉴를 알려줘 하면 랜덤하게 명령어도 알려드립니다.' + util.shuffleRandom(lastTextArr)[0]
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
      console.log('rows[0].googleTokenTime ', rows[0].googleTokenTime)
      if (rows[0].googleTokenTime == null) {
        callback(null, false)
      } else {
        // 갱신을 안하면 기존 DB에서 읽어서 처리
        if (rows[0].googleTokenTime > (new Date(new Date().getTime() + 32400000).getTime())) {
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
