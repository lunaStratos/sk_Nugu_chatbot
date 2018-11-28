  const request = require('request'); // request
  const Promise = require('promise');

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

        const nextWeatherDate = new Date((new Date().getTime()) - 31 * 60 * 1000); // + 32400000
        const nextWeatherDateYearDay = nextWeatherDate.getFullYear() + '' + ('0' + (nextWeatherDate.getMonth() + 1)).slice(-2) + ('0' + nextWeatherDate.getDate()).slice(-2);
        const nextWeatherDateHourMin = ('0' + nextWeatherDate.getHours()).slice(-2) + '' + ('0' + nextWeatherDate.getMinutes()).slice(-2);

        forms.base_date = nextWeatherDateYearDay
        forms.base_time = nextWeatherDateHourMin
        forms.nx = insertData.nx
        forms.ny = insertData.ny
        forms._type = 'json'

        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=aAfuvIitnAf6ckcIREyJXGfFEDWy7dah3nWnhgcGoL0%2BqCpEgu4MWRBmY89qcQvJreZBb%2F7Npm0MGsBjv6Es3Q%3D%3D";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=aAfuvIitnAf6ckcIREyJXGfFEDWy7dah3nWnhgcGoL0%2BqCpEgu4MWRBmY89qcQvJreZBb%2F7Npm0MGsBjv6Es3Q%3D%3D&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=1&pageNo=1&startPage=1&_type=json
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
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=aAfuvIitnAf6ckcIREyJXGfFEDWy7dah3nWnhgcGoL0%2BqCpEgu4MWRBmY89qcQvJreZBb%2F7Npm0MGsBjv6Es3Q%3D%3D";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=aAfuvIitnAf6ckcIREyJXGfFEDWy7dah3nWnhgcGoL0%2BqCpEgu4MWRBmY89qcQvJreZBb%2F7Npm0MGsBjv6Es3Q%3D%3D&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json
        //"category":"T1H","fcstDate":20181026,"fcstTime":1600,"fcstValue":13.1,
        // Sky TH1 PTY

        const forecastShortWeatherDate = new Date((new Date().getTime()) - 31 * 60 * 1000); // + 32400000
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
            console.log(starttime)

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
            jsonArr.time = endtime.getFullYear() + '-' + ('0' + (endtime.getMonth() + 1)).slice(-2) + '-' + ('0' + (endtime.getDate())).slice(-2);
            jsonArr.starttime = starttime.getFullYear() + '' + ('0' + (starttime.getMonth() + 1)).slice(-2) + '' + ('0' + (starttime.getDate())).slice(-2);
            jsonArr.endtime = endtime.getFullYear() + '' + ('0' + (endtime.getMonth() + 1)).slice(-2) + '' + ('0' + (endtime.getDate())).slice(-2);
            let walkcount = ''

            // console.log(new Date(Number(originalJson[i].startTimeMillis)))
            // console.log(new Date(Number(originalJson[i].endTimeMillis)))
            // console.log(originalJson[i].dataset[0].point[0])
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
            jsonArr.time = endtime.getFullYear() + '-' + ('0' + (endtime.getMonth() + 1)).slice(-2) + '-' + ('0' + (endtime.getDate())).slice(-2);
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


  //kmdata()
  module.exports = getSync
