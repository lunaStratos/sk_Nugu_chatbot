'use strict';

const request = require('request'); // request
var xml2js = require('xml2js');
var Promise = require('promise');
var parser = new xml2js.Parser();

exports.insertFirstApi = (knex, requestType, insertData) => {

  function weatherRequest(insertData, requestType, callback) {
    //초단기 실황
    let url = '';
    //현재날짜 UTC + 9 (40분 전으로 기상예보)
    const nowDate = new Date((new Date().getTime() + 32400000 - 31 * 60 * 1000)); // + 32400000
    const nowDateYearDay = nowDate.getFullYear() + '' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
    const nowDateHourMin = ('0' + nowDate.getHours()).slice(-2) + '' + ('0' + nowDate.getMinutes()).slice(-2);

    //qs형태, 키는 이미 안에 있다
    let forms = {
      base_date: nowDateYearDay,
      base_time: nowDateHourMin,
      nx: insertData.nx,
      ny: insertData.ny,
      '_type': 'json'
    }

    switch (requestType) {
      case 'nowWeather': // 실황
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib?serviceKey=[api키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=8&pageSize=1&pageNo=1&startPage=1&_type=json
        //T1H	기온 RN1 1시간 강수량 PTY: 강수형태
        //obsrValue
        forms.numOfRows = 8
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1

        break;

      case 'forecastShortWeather': //초단기예보 3시간치
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json
        //"category":"T1H","fcstDate":20181026,"fcstTime":1600,"fcstValue":13.1,
        forms.numOfRows = 100
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1
        break;

      case 'forecastWeather': //동네예보 하루치
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=[api키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=1&pageNo=1&startPage=1&_type=json
        //  pop강수확률
        //  pty 강수형태
        //  T3H 3시간 기온
        // S06 신적설
        // REH 습도
        //fcstValue, category, fcstTime: 1800

        forms.numOfRows = 100
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1
        break;


    }


    // Get data
    request({
      method: 'GET',
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
      },
      timeout: 1000 * 30,
      qs: forms //form 입력 Get시 qs사용, post시 form사용
    }, function(err, resp, body) {

      if (err) {
        callback(err, {
          code: 400,
          name: ''
        });
        return;
      }
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
        callback(err, {
          code: 400,
          name: ''
        });
        return;
      }

    });

  }

  //Promise
  const weatherTask = (insertData, requestType) => new Promise(function(resolved, rejected) {
    weatherRequest(insertData, requestType, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  // request function
  function api_upload(knex, requestType, insertData) {
    console.log("api_upload");


    return weatherTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("Done => result : " + JSON.stringify(result));
        let displayText = '';

        if (result.code != 200) { //문제있음

          displayText = '현재 서버에 문제가 있어서 연결이 실패했습니다. 다시 시도해 주세요.'

        } else {
          let list = result.list;
          const name = result.name;

          console.log(list)
          console.log(requestType)
          console.log(name)

          switch (requestType) {
            case 'nowWeather': // 실황
              //T1H	기온 RN1 1시간 강수량 PTY: 강수형태
              //obsrValue

              let T1H = '';
              let RN1 = '';
              let PTY = '';
              for (let i = 0; i < list.length; i++) {
                if (list[i].category == 'T1H') { // T1H	기온
                  console.log(list[i].obsrValue)
                  T1H = list[i].obsrValue
                } else if (list[i].category == 'RN1') { //RN1 1시간
                  console.log(list[i].obsrValue)
                  RN1 = list[i].obsrValue
                } else if (list[i].category == 'PTY') { // 강수형태
                  console.log(list[i].obsrValue)
                  PTY = list[i].obsrValue
                }
              }

              let insertValue = [{
                name: name,
                T1H: T1H,
                RN1: RN1,
                PTY: PTY
              }]

              knex('Camelia_NowWeather').insert(insertValue).then(() => console.log("Camelia_NowWeather data inserted"))
                .catch((err) => {
                  console.log(err);
                  throw err
                })

              console.log('nowWeather: done')
              break;

            case 'forecastShortWeather': //초단기예보 3시간치

              let insertValue2 = [];
              for (let i = 0; i < list.length; i++) {
                let listjson = {}
                if (list[i].category == 'T1H') { // 기온
                  console.log('T1H', list[i].fcstValue)
                  console.log('T1H', list[i].fcstTime)
                  listjson.name = name
                  listjson.T1H = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime
                  insertValue2.push(listjson);
                } else if (list[i].category == 'PTY') { // 강수형태
                  console.log('PTY', list[i].fcstValue)
                  console.log('PTY', list[i].fcstTime)
                  listjson.name = name
                  listjson.PTY = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime
                  insertValue2.push(listjson);
                } else if (list[i].category == 'REH') { // 강수형태
                  console.log('REH', list[i].fcstValue)
                  console.log('REH', list[i].fcstTime)
                  listjson.name = name
                  listjson.REH = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime
                  insertValue2.push(listjson);
                }
              }

              console.log(insertValue2)

              knex('Camelia_ForecastShortWeather').insert(insertValue2).then(() => console.log("Camelia_ForecastShortWeather data inserted"))
                .catch((err) => {
                  console.log(err);
                  throw err
                })



              break;

            case 'forecastWeather': //동네예보 하루치
              let insertValue3 = [];
              let listjson = {}
              for (let i = 0; i < list.length; i++) {

                if (list[i].category == 'POP') { // 강수확률
                  if (i > 1) {
                    if (list[i - 1].fcstTime !== list[i].fcstTime) {
                      insertValue3.push(listjson)
                      listjson = {}
                    }

                  }
                  console.log('POP', list[i].fcstValue)
                  console.log('POP', list[i].fcstTime)
                  listjson.name = name
                  listjson.POP = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'PTY') { // 강수형태
                  console.log('PTY', list[i].fcstValue)
                  console.log('PTY', list[i].fcstTime)
                  listjson.name = name
                  listjson.PTY = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'T3H') { // 3시간 기온ㄴ
                  console.log('T3H', list[i].fcstValue)
                  console.log('T3H', list[i].fcstTime)
                  listjson.name = name
                  listjson.T3H = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'S06') { // 신적설
                  console.log('S06', list[i].fcstValue)
                  console.log('S06', list[i].fcstTime)
                  listjson.name = name
                  listjson.S06 = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'REH') { // 습도
                  console.log('REH', list[i].fcstValue)
                  console.log('REH', list[i].fcstTime)
                  listjson.name = name
                  listjson.REH = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                }

              }

              knex('Camelia_ForecastWeather').insert(insertValue3).then(() => console.log("Camelia_ForecastWeather data inserted"))
                .catch((err) => {
                  console.log(err);
                  throw err
                })


              break;
          }

        } //200 or 400

      }); //async End


  } // function End

  api_upload(knex, requestType, insertData);

}

exports.updateApi = (knex, requestType, insertData) => {

  function weatherRequest(insertData, requestType, callback) {
    //초단기 실황
    let url = '';
    //현재날짜 UTC + 9 (40분 전으로 기상예보)
    const nowDate = new Date((new Date().getTime() + 32400000 - 31 * 60 * 1000)); // + 32400000
    const nowDateYearDay = nowDate.getFullYear() + '' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
    const nowDateHourMin = ('0' + nowDate.getHours()).slice(-2) + '' + ('0' + nowDate.getMinutes()).slice(-2);

    //qs형태, 키는 이미 안에 있다
    let forms = {
      base_date: nowDateYearDay,
      base_time: nowDateHourMin,
      nx: insertData.nx,
      ny: insertData.ny,
      '_type': 'json'
    }

    switch (requestType) {
      case 'nowWeather': // 실황
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib?serviceKey=[api키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=8&pageSize=1&pageNo=1&startPage=1&_type=json
        //T1H	기온 RN1 1시간 강수량 PTY: 강수형태
        //obsrValue
        forms.numOfRows = 8
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1

        break;

      case 'forecastShortWeather': //초단기예보 3시간치
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json
        //"category":"T1H","fcstDate":20181026,"fcstTime":1600,"fcstValue":13.1,
        forms.numOfRows = 100
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1
        break;

      case 'forecastWeather': //동네예보 하루치
        url = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=[api키]";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=1&pageNo=1&startPage=1&_type=json
        //  pop강수확률
        //  pty 강수형태
        //  T3H 3시간 기온
        // S06 신적설
        // REH 습도
        //fcstValue, category, fcstTime: 1800

        forms.numOfRows = 100
        forms.pageSize = 1
        forms.pageNo = 1
        forms.startPage = 1
        break;


    }


    // Get data
    request({
      method: 'GET',
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
      },
      timeout: 1000 * 30,
      qs: forms //form 입력 Get시 qs사용, post시 form사용
    }, function(err, resp, body) {

      if (err) {
        callback(err, {
          code: 400,
          name: ''
        });
        return;
      }
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
        callback(err, {
          code: 400,
          name: ''
        });
        return;
      }

    });

  }

  //Promise
  const weatherTask = (insertData, requestType) => new Promise(function(resolved, rejected) {
    weatherRequest(insertData, requestType, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  // request function
  function api_upload(knex, requestType, insertData) {
    console.log("api_upload");

    return weatherTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("Done => result : " + JSON.stringify(result));
        let displayText = '';

        if (result.code != 200) { //문제있음

          displayText = '현재 서버에 문제가 있어서 연결이 실패했습니다. 다시 시도해 주세요.'

        } else {
          let list = result.list;
          const name = result.name;

          switch (requestType) {
            case 'nowWeather': // 실황
              //T1H	기온 RN1 1시간 강수량 PTY: 강수형태
              //obsrValue

              let T1H = '';
              let RN1 = '';
              let PTY = '';
              for (let i = 0; i < list.length; i++) {
                if (list[i].category == 'T1H') { // T1H	기온
                  console.log(list[i].obsrValue)
                  T1H = list[i].obsrValue
                } else if (list[i].category == 'RN1') { //RN1 1시간
                  console.log(list[i].obsrValue)
                  RN1 = list[i].obsrValue
                } else if (list[i].category == 'PTY') { // 강수형태
                  console.log(list[i].obsrValue)
                  PTY = list[i].obsrValue
                }
              }

              let insertValue = {
                T1H: T1H,
                RN1: RN1,
                PTY: PTY
              }
              console.log(name);
              console.log(insertValue);
              knex('Camelia_NowWeather').where('name', name)
                .update(insertValue)
                .catch((err) => {
                  console.log(err);
                  throw err
                })


              console.log('nowWeather: done')
              break;

            case 'forecastShortWeather': //초단기예보 3시간치

              let dedupThings = Array.from(list.reduce((m, t) => m.set(t.fcstTime, t), new Map()).values());
              let insertValue2 = [];
              for (let i = 0; i < dedupThings.length; i++) {
                let json2 = dedupThings[i];
                let listjson = {
                  name: name,
                  T1H: '',
                  PTY: '',
                  REH: '',
                  foreCastTime: ''
                }
                listjson.foreCastTime = json2.fcstTime;
                insertValue2.push(listjson);
              }


              for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < insertValue2.length; j++) {
                  if (insertValue2[j].foreCastTime == list[i].fcstTime) {
                    if (list[i].category == 'T1H') { // 기온
                      insertValue2[j].T1H = list[i].fcstValue

                    } else if (list[i].category == 'PTY') { // 강수형태
                      insertValue2[j].PTY = list[i].fcstValue

                    } else if (list[i].category == 'REH') { // 강수형태
                      insertValue2[j].REH = insertValue2[j].fcstValue

                    }

                  }

                }

              }
              console.log(insertValue2)

              knex('Camelia_ForecastShortWeather').insert(insertValue2).then(() => console.log("Camelia_ForecastShortWeather data inserted"))
                .catch((err) => {
                  console.log(err);
                  throw err
                })

              break;

            case 'forecastWeather': //동네예보 하루치

              let insertValue3 = [];
              let listjson = {}
              for (let i = 0; i < list.length; i++) {

                if (list[i].category == 'POP') { // 강수확률
                  if (i > 1) {
                    if (list[i - 1].fcstTime !== list[i].fcstTime) {
                      insertValue3.push(listjson)
                      listjson = {}
                    }

                  }
                  console.log('POP', list[i].fcstValue)
                  console.log('POP', list[i].fcstTime)
                  listjson.name = name
                  listjson.POP = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'PTY') { // 강수형태
                  console.log('PTY', list[i].fcstValue)
                  console.log('PTY', list[i].fcstTime)
                  listjson.name = name
                  listjson.PTY = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'T3H') { // 3시간 기온ㄴ
                  console.log('T3H', list[i].fcstValue)
                  console.log('T3H', list[i].fcstTime)
                  listjson.name = name
                  listjson.T3H = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'S06') { // 신적설
                  console.log('S06', list[i].fcstValue)
                  console.log('S06', list[i].fcstTime)
                  listjson.name = name
                  listjson.S06 = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                } else if (list[i].category == 'REH') { // 습도
                  console.log('REH', list[i].fcstValue)
                  console.log('REH', list[i].fcstTime)
                  listjson.name = name
                  listjson.REH = list[i].fcstValue
                  listjson.foreCastTime = list[i].fcstTime

                }

              }
              console.log(insertValue3)
              knex('Camelia_ForecastWeather').insert(insertValue3).then(() => console.log("Camelia_ForecastWeather data inserted"))
                .catch((err) => {
                  console.log(err);
                  throw err
                })

              break;
          }

        } //200 or 400

      }); //async End


  } // function End

  api_upload(knex, requestType, insertData);

}

exports.createTable = (knex) => {
  function createTable_Weather() {
    knex.schema.createTable('Camelia_ForecastWeather', (table) => {
        table.string('name')
        table.string('POP')
        table.string('PTY')
        table.string('T3H')
        table.string('REH')
        table.string('S06')
        table.string('foreCastTime')
      }).then(() => console.log("Camelia_ForecastWeather table created "))
      .catch((err) => {
        console.log(err);
        throw err
      })
      .finally(() => {
        knex.destroy();
      });
  }
  createTable_Weather();
}
