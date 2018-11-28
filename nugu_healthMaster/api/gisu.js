const request = require('request'); // request
var xml2js = require('xml2js');
var Promise = require('promise');
var parser = new xml2js.Parser();

exports.updateApi = (requestType, knex) => {
  function gisuRequest(requestType, callback) {
    //초단기 실황
    let url = '';
    //현재날짜 UTC + 9 (40분 전으로 기상예보)
    const nowDate = new Date((new Date().getTime() + 32400000) - 31 * 60 * 1000); // + 32400000
    const nowDateYearDay = nowDate.getFullYear() + '' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
    const nowDateHourMin = ('0' + nowDate.getHours()).slice(-2) + '' + ('0' + nowDate.getMinutes()).slice(-2);

    let forms = {}

    forms.time = nowDateYearDay + ('0' + nowDate.getHours()).slice(-2) //2018 10 28 06 시간까지만
    console.log(forms.time)
    switch (requestType) {
      case 'foodDecay': // 식중독지수
        url = "http://newsky2.kma.go.kr/iros/RetrieveLifeIndexService3/getFsnLifeList?serviceKey=[api키]&areaNo=1100000000";
        break;

      case 'bul': // 불쾌지수.(제공기간:6월~9월)
        url = "http://newsky2.kma.go.kr/iros/RetrieveLifeIndexService3/getDsplsLifeList?serviceKey=[api키]&areaNo=1100000000";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json

        break;
      case 'chegam': // 체감온도 11~3월
        url = "http://newsky2.kma.go.kr/iros/RetrieveLifeIndexService3/getSensorytemLifeList?serviceKey=[api키]&areaNo=1100000000";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json

        break;
      case 'uv': // 자외선지수(제공기간:3월~11월)
        url = "http://newsky2.kma.go.kr/iros/RetrieveLifeIndexService3/getUltrvLifeList?serviceKey=[api키]&areaNo=1100000000";
        //http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData?serviceKey=[api키]&base_date=20181026&base_time=1500&nx=60&ny=127&numOfRows=100&pageSize=10&pageNo=1&startPage=1&_type=json

        break;

        //설명
        //https://www.data.go.kr/pubs/ins/GovInsttCodeMng/clipReportPrint.do?reportId=FM_016&insttCode=B550928&publicDataDetailPk=uddi:34396265-76e1-47e9-988f-ed04995d5d28
      case 'virus1': // 질병예방 : 감기와 눈병만 한다
        url = 'http://apis.data.go.kr/B550928/dissForecastInfoSvc/getDissForecastInfo?serviceKey=[api키]';
        forms = {
          numOfRows: 30, //한페이지 결과수
          pageSize: 30,
          startPage: 1,
          pageNo: 1, //페이지번호
          type: 'json',
          dissCd: 1, //질병코드 : 1은 감기 2는 눈병
        }
        break;
      case 'virus2': // 질병예방 : 감기와 눈병만 한다
        url = 'http://apis.data.go.kr/B550928/dissForecastInfoSvc/getDissForecastInfo?serviceKey=[api키]';
        forms = {
          numOfRows: 30, //한페이지 결과수
          pageSize: 30,
          startPage: 1,
          pageNo: 1, //페이지번호
          type: 'json',
          dissCd: 2, //질병코드 : 1은 감기 2는 눈병
        }
        break;
      case 'mise': // 질병예방 : 감기와 눈병만 한다
        url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMinuDustFrcstDspth?serviceKey=[api키]';
        const nowDateYearDayOnlyMise = nowDate.getFullYear() + '-' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + '-' + ('0' + nowDate.getDate()).slice(-2);
        forms = {
          numOfRows: 1, //한페이지 결과수
          pageSize: 10,
          pageNo: 1,
          startPage: 1, //페이지번호
          searchDate: nowDateYearDayOnlyMise, //2018-11-05
          InformCode: 'PM25', //질병코드 : 1은 감기 2는 눈병
        }
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
      } //  error
      const result = body.toString()
      // console.log(result)

      if (requestType == 'virus1' || requestType == 'virus2') {

        const jsonBody = JSON.parse(result)
        if (jsonBody.response.header.resultCode == 0) {


          callback(null, {
            code: 200,
            requestType: requestType, //요청한 타입
            list: jsonBody.response.items
          });

        } else {
          callback(null, {
            code: 400,
            requestType: requestType, //요청한 타입
            list: ''
          });
        }


      } else { //xml 파트

        parser.parseString(result, function(err, resultxml) {
          console.log('requestType ', requestType)
          console.log('jsonparse ',JSON.stringify(resultxml));
          var status = ''
          if(requestType != 'foodDecay' && requestType != 'chegam' && requestType != 'uv'){
            console.log('requestType !=')
            status = resultxml.response.header[0].resultCode[0]
          }else{
            console.log(resultxml.Response.Header[0])
            status = resultxml.Response.Header[0].ReturnCode[0]
          }

          console.log("status: " + status);

          if (status == '00') { //정상작동 확인
            if(requestType == 'foodDecay'){

              console.log('00  == > ', resultxml.Response.Body[0])
                let today = resultxml.Response.Body[0].IndexModel[0].today[0] //오늘
                  let tomorrow = resultxml.Response.Body[0].IndexModel[0].tomorrow[0] //  내일
                    let theDayAfterTomorrow = resultxml.Response.Body[0].IndexModel[0].theDayAfterTomorrow[0] // 모래
                            if (today == '') {
                              today = '0';
                            }
                            const jsonfiled = {
                              'today': today,
                              'tomorrow': tomorrow,
                              'theDayAfterTomorrow': theDayAfterTomorrow
                            }
                            callback(null, {
                              code: 200,
                              requestType: requestType, //요청한 타입
                              list: jsonfiled
                            });
                            return;

            }else if (requestType == 'uv') {

              console.log('00  == > ', resultxml.Response.Body[0])
              let today = resultxml.Response.Body[0].IndexModel[0].today[0] //오늘
              let tomorrow = resultxml.Response.Body[0].IndexModel[0].tomorrow[0] //  내일
              let theDayAfterTomorrow = resultxml.Response.Body[0].IndexModel[0].theDayAfterTomorrow[0] // 모래
              if (today == '') {
                today = '0';
              }
              const jsonfiled = {
                'today': today,
                'tomorrow': tomorrow,
                'theDayAfterTomorrow': theDayAfterTomorrow
              }
              callback(null, {
                code: 200,
                requestType: requestType, //요청한 타입
                list: jsonfiled
              });
              return;


            } else if (requestType == 'bul') { //체감온도와 불쾌지수는 h3~66 사용

              let h3 = resultxml.response.body[0].IndexModel[0].h3[0]
              let h6 = resultxml.response.body[0].IndexModel[0].h6[0]
              let h9 = resultxml.response.body[0].IndexModel[0].h9[0]
              let h12 = resultxml.response.body[0].IndexModel[0].h12[0]
              let h15 = resultxml.response.body[0].IndexModel[0].h15[0]
              let h18 = resultxml.response.body[0].IndexModel[0].h18[0]
              let h21 = resultxml.response.body[0].IndexModel[0].h21[0]
              let h24 = resultxml.response.body[0].IndexModel[0].h24[0]
              let h33 = resultxml.response.body[0].IndexModel[0].h33[0] //내일 오전 9시

              const jsonfiled = {
                'h3': h3,
                'h6': h6,
                'h9': h9,
                'h12': h12,
                'h15': h15,
                'h18': h18,
                'h21': h21,
                'h24': h24,
                'h33': h33,
              }

              callback(null, {
                code: 200,
                requestType: requestType, //요청한 타입
                list: jsonfiled
              });

            }else if(requestType == 'chegam'){

                            let h3 = Number(resultxml.Response.Body[0].IndexModel[0].h3[0])
                            let h6 =  Number(resultxml.Response.Body[0].IndexModel[0].h6[0])
                            let h9 =  Number(resultxml.Response.Body[0].IndexModel[0].h9[0])
                            let h12 =  Number(resultxml.Response.Body[0].IndexModel[0].h12[0])
                            let h15 =  Number(resultxml.Response.Body[0].IndexModel[0].h15[0])
                            let h18 =  Number(resultxml.Response.Body[0].IndexModel[0].h18[0])
                            let h21 =  Number(resultxml.Response.Body[0].IndexModel[0].h21[0])
                            let h24 =  Number(resultxml.Response.Body[0].IndexModel[0].h24[0])
                            let h33 =  Number(resultxml.Response.Body[0].IndexModel[0].h33[0]) //내일 오전 9시

                            const jsonfiled = {
                              'h3': h3,
                              'h6': h6,
                              'h9': h9,
                              'h12': h12,
                              'h15': h15,
                              'h18': h18,
                              'h21': h21,
                              'h24': h24,
                              'h33': h33,
                            }

                            callback(null, {
                              code: 200,
                              requestType: requestType, //요청한 타입
                              list: jsonfiled
                            });
            } else if (requestType == 'mise') {
              console.log()
              let item = resultxml.response.body[0].items[0].item[0].informGrade[0]
              console.log(resultxml.response.body[0].items[0].item[0].informGrade[0])
              console.log('item', )
              item = item.split(',')
              callback(null, {
                code: 200,
                requestType: requestType, //요청한 타입
                list: item
              });

            } //requestType
          } else {
            callback(err, {
              code: 400,
              name: ''
            });
            return;
          }
        }); //xml parse

      }



    }); //request body

  }

  //Promise
  const gisuTask = (requestType) => new Promise(function(resolved, rejected) {
    gisuRequest(requestType, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  // request function
  function api_upload(requestType, knex) {
    console.log("requestType: ", requestType);

    return gisuTask(requestType)
      .then(function(result) {
        console.log("Done => result : " + JSON.stringify(result));
        if (result.code != 200) { //문제있음

        } else {
          let list = result.list;
          let insertValue = {}
          let tempArray = []
          let tempArray2 = []
          switch (requestType) {
            case 'foodDecay':

              // insertValue = [{
              //   name: 'foodDecay',
              //   today: list.today,
              //   tomorrow: list.tomorrow,
              //   theDayAfterTomorrow: list.theDayAfterTomorrow
              // }]
              //
              // knex('Camelia_Gisu').insert(insertValue)
              //   .catch((err) => {
              //     console.log(err);
              //     throw err
              //   })

              insertValue = {
                today: list.today,
                tomorrow: list.tomorrow,
                theDayAfterTomorrow: list.theDayAfterTomorrow
              }

              knex('Camelia_Gisu').where('name', 'foodDecay').update(insertValue)
                .catch((err) => {
                  console.log(err);
                  throw err
                })

              break;

            case 'bul':
              //
              // insertValue = [{
              //   name: 'bul',
              //   h3: list.h3,
              //   h6: list.h6,
              //   h9: list.h9,
              //   h12: list.h12,
              //   h15: list.h15,
              //   h18: list.h18,
              //   h21: list.h21,
              //   h24: list.h24,
              //   h33: list.h33,
              // }]
              //
              // knex('Camelia_Gisu').insert(insertValue)
              //   .catch((err) => {
              //     console.log(err);
              //     throw err
              //   })

              insertValue = {
                h3: list.h3,
                h6: list.h6,
                h9: list.h9,
                h12: list.h12,
                h15: list.h15,
                h18: list.h18,
                h21: list.h21,
                h24: list.h24,
                h33: list.h33,
              }

              knex('Camelia_Gisu').where('name', 'bul')
                .update(insertValue)
                .catch((err) => {
                  console.log(err);
                  throw err
                })

              break;

            case 'chegam':

              // insertValue = [{
              //   name: 'chegam',
              //   h3: list.h3,
              //   h6: list.h6,
              //   h9: list.h9,
              //   h12: list.h12,
              //   h15: list.h15,
              //   h18: list.h18,
              //   h21: list.h21,
              //   h24: list.h24,
              //   h33: list.h33,
              // }]
              //
              // knex('Camelia_Gisu').insert(insertValue)
              //   .catch((err) => {
              //     console.log(err);
              //     throw err
              //   })

              insertValue = {
                h3: list.h3,
                h6: list.h6,
                h9: list.h9,
                h12: list.h12,
                h15: list.h15,
                h18: list.h18,
                h21: list.h21,
                h24: list.h24,
                h33: list.h33,
              }

              knex('Camelia_Gisu').where('name', 'chegam')
                .update(insertValue)
                .catch((err) => {
                  console.log(err);
                  throw err
                })

              break;

            case 'uv':


              // insertValue = [{
              //   name: 'uv',
              //   today: list.today,
              //   tomorrow: list.tomorrow,
              //   theDayAfterTomorrow: list.theDayAfterTomorrow
              // }]
              //
              // knex('Camelia_Gisu').insert(insertValue)
              //   .catch((err) => {
              //     console.log(err);
              //     throw err
              //   })

              insertValue = {
                today: list.today,
                tomorrow: list.tomorrow,
                theDayAfterTomorrow: list.theDayAfterTomorrow
              }

              knex('Camelia_Gisu').where('name', 'uv').update(insertValue)
                .catch((err) => {
                  console.log(err);
                  throw err
                })
              break;

            case 'virus1':


              // for (let i = 0; i < list.length; i++) {
              //   const temparr = {
              //     cityName: util.codeToCity(list[i].znCd), //도시 (String)
              //     risk: list[i].dissCd, //질병등급
              //     riskSay: list[i].dissRiskXpln, //질병안내
              //     virus: '감기'
              //   }
              //   tempArray.push(temparr)
              // }
              //
              //
              // knex('Camelia_Predict').insert(tempArray)
              //   .catch((err) => {
              //     console.log(err);
              //     throw err
              //   })


              for (let i = 0; i < list.length; i++) {
                const temparr = {
                  cityName: util.codeToCity(list[i].znCd), //도시 (String)
                  risk: list[i].dissCd, //질병등급
                  riskSay: list[i].dissRiskXpln, //질병안내
                }
                const temparr2 = {
                  risk: list[i].dissCd, //질병등급
                  riskSay: list[i].dissRiskXpln //질병안내
                }
                tempArray.push(temparr)
                tempArray2.push(temparr2)
              }

              for (let i = 0; i < tempArray.length; i++) {
                knex('Camelia_Predict').where({
                    'cityName': tempArray[i].cityName,
                    virus: '감기'
                  })
                  .update(tempArray2[i])
                  .catch((err) => {
                    console.log(err);
                    throw err
                  })
              }
              break;

            case 'virus2':


              // for (let i = 0; i < list.length; i++) {
              //   const temparr = {
              //     cityName: util.codeToCity(list[i].znCd), //도시 (String)
              //     risk: list[i].dissCd, //질병등급
              //     riskSay: list[i].dissRiskXpln, //질병안내
              //     virus: '눈병'
              //   }
              //   tempArray.push(temparr)
              // }
              //
              //
              // knex('Camelia_Predict').insert(tempArray)
              //   .catch((err) => {
              //     console.log(err);
              //     throw err
              //   })


              for (let i = 0; i < list.length; i++) {
                const temparr = {
                  cityName: util.codeToCity(list[i].znCd), //도시 (String)
                  risk: list[i].dissCd, //질병등급
                  riskSay: list[i].dissRiskXpln, //질병안내
                }
                const temparr2 = {
                  risk: list[i].dissCd, //질병등급
                  riskSay: list[i].dissRiskXpln //질병안내
                }
                tempArray.push(temparr)
                tempArray2.push(temparr2)
              }

              for (let i = 0; i < tempArray.length; i++) {
                knex('Camelia_Predict').where({
                    'cityName': tempArray[i].cityName,
                    virus: '눈병'
                  })
                  .update(tempArray2[i])
                  .catch((err) => {
                    console.log(err);
                    throw err
                  })
              }
              break;

            case 'mise':

              for (let i = 0; i < list.length; i++) {
                const splitData = list[i].trim().split(':')
                const temparr = {
                  name: splitData[0], //서울
                  mise: splitData[1] //나쁨
                }
                const temparr2 = {
                  mise: splitData[1] //나쁨
                }
                tempArray.push(temparr)
                tempArray2.push(temparr2)
              }

              for (let i = 0; i < tempArray.length; i++) {
                knex('Camelia_NowWeather').where('name', tempArray[i].name)
                  .update(tempArray2[i])
                  .catch((err) => {
                    console.log(err);
                    throw err
                  })
              }
              break;

          }

        } //200 or 400

      }); //async End

  } // function End

  api_upload(requestType, knex); //실행!

}
