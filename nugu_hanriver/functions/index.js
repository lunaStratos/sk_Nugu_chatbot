'use strict';

//누구용으로 만들어진 템플레이트
//*******************주의사항*******************
//폴더명 수정 후 exports.nugu_template 이름 수정할것

const request = require('request'); // request
const Promise = require('promise');
const xml2js = require('xml2js');
var async = require('async');
const parser = new xml2js.Parser();

exports.nugu_hanriver = (req, res) => {
  const appTitle = '투데이한강' // 앱 타이틀

  //switch : GET: Web Page
  console.log('Request body: ' + JSON.stringify(req.body));
  //console.log('Request method: ' + req.method);
  const requestBody = req.body;
  console.log('requestBody: ' + JSON.stringify(requestBody));
    console.log('requestBody: ' + JSON.stringify(req.url));

  // 퐁당 서버에서 온도 가져오기
  function getHangangTemp(callback) {
    var url = 'http://hangang.dkserver.wo.tc';

    // Get data
    request({
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
      }
    }, function(err, resp, body) {
      if (err) {
        callback(err, {
          code: 400,
        });
        return;
      }
      var original = JSON.parse(body.toString());
      callback(null, {
        code: 200,
        result: original.result,
        temp: original.temp,
        time: original.time,
      });
    });

  }

  //Promise
  const asyncTask = () => new Promise(function(resolved, rejected) {
    getHangangTemp(function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  //GET POST 관리 ||  req.method
  switch (req.method) {
    case 'GET': // policy를 위한 페이지임


      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      var title = '이직좀 시켜 주세요...';
      var body = '<p>이직좀 시켜 주세요...</p>';

      var code = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<meta charset="utf-8" />',
         '<meta http-equiv="refresh" content="5; url=http://stratos.dothome.co.kr/"> ',
        '<title>' + title + '</title>',
        '</head>',
        '<body>',
        '<img src ="https://storage.googleapis.com/finalrussianroulette.appspot.com/yahan.png">',
                body,
        '</body>',
        '</html>'
      ].join('\n');

      res.write(code, "utf8");
      res.end();
      break; // Get break

    default: // post

      //==========================================================================
      //=========================여기서 부터 POST 처리=============================
      //==========================================================================
      //request
      console.log('post')
      const parameters = requestBody.action.parameters // parameters
      const context = requestBody.action.context //context
      const actionName = requestBody.action.actionName // Action intent 구분

      //DEBUG
      console.log(`request: ${JSON.stringify(actionName)}`)

      //response json 필드. 여기서 json을 만들어준다.
      function makeJson(str, endField) {

        let jsonReturn = {
          "version": "2.0",
          "resultCode": "OK",
          "output": {
            "hanTemp": str
          },
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


        return jsonReturn
      }

      // hanriver_intent 처리 function
      function hanriver_intent(httpRes) {
        //시작후 바로 종료할 예정이기 때문에 true로 한다. 대화 이어나갈 거면 false
        const Endfiled = true;

        let displayText = '초기 displayText(변하지 않음)';
        console.log("hanriver_intent function");

        return asyncTask()
          .then(function(results) {
            //로그 확인용
            console.log("Done => results : " + JSON.stringify(results));
            if (results.code != 200) {
              displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ";

            } else { // no problem

              let resulted = results.result;
              let temp = results.temp;
              let time = parseFloat(results.time);

              displayText = '지금 한강의 온도는 ' + temp + "도 입니다. ";


              if (temp < 9) {
                displayText += " 한강 엄청 춥습니다. 아직 서핑 가즈아를 할 때가 아닙니다. ";
              } else if (temp >= 9 && temp < 12) {
                displayText += " 서핑하기에는 아직 이른 온도입니다. 경치를 보는 것에 만족하세요. ";
              } else if (temp >= 12 && temp < 17) {
                displayText += " 서핑하기 좋은 날씨입니다. ";
              } else if (temp >= 17) {
                displayText += " 지금이 적기! 한강가기 좋은날입니다. ";
              }
              displayText += "그럼 종료할께요!";
            }
            console.log("displayText: " + displayText);
            let result = makeJson(displayText, Endfiled);
            console.log(result)
            return res.send(result);
          });


      } // launchRequest




      //====================================================================
      //====================================================================
      //====================================================================
      //일반 인텐트 처리 부분
      //====================================================================
      //====================================================================
      //====================================================================

      function launchRequest(res) {
        const Endfiled = false;
        let displayText = appTitle + '에 오신것을 환영합니다. ';
        let result = makeJson(displayText, Endfiled);
        return res.send(result);
      } // SessionEndedRequest

      function SessionEndedRequest(res) {

        const Endfiled = false;
        let displayText = '인천공항 출국장 앱을 종료합니다. 이용해 주셔서 감사합니다!';
        let result = makeJson(displayText, Endfiled);
        return res.send(result);
      } // SessionEndedRequest


      function intent_select(res) {
        console.log("actionName : " + actionName);
        switch (actionName) { //intent 별 분기처리
          case 'hanriverAnswer':
            hanriver_intent(res);
            break;
          default:
            fallback(res);
        }

      }

      //====================================================================
      //====================================================================
      //====================================================================
      //====================================================================


      //type name
      const LAUNCH_REQUEST = 'NUGU.ACTION.welcome'; // WELCOME_INTENT
      const INTENT_REQUEST = 'hanriver'; // 일반 인텐트
      const SESSION_ENDED_REQUEST = 'NUGU.ACTION.exit'; //종료
      // Intent가 오는 부분
      switch (actionName) {
        // 최초 실행시 오는 intent. LaunchRequest만 쓴다.

        case LAUNCH_REQUEST:
          return launchRequest(res)
          //INTENT_REQUEST의 경우 하위 function에서 switch로 intent를 처리합니다.

        case SESSION_ENDED_REQUEST:
          return SessionEndedRequest(res)

        default:
          return intent_select(res)

      } //switch requests.type

      break; // default end
  } //switch

}
