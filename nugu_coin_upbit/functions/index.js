'use strict';

const request = require('request'); // request
const Promise = require('promise');
var async = require('async');

exports.nugu_camelia = (req, res) => {
  const appTitle = '카메리아 프로젝트' // 앱 타이틀

  const arr = [
    "비트코인",
    "이더리움",
    "대쉬",
    "라이트 코인",
    "이더리움 클래식",
    "리플",
    "비트코인 캐쉬",
    "모네로",
    "제트캐쉬",
    "퀀텀",
    "비트코인 골드",
    "스텔라루멘",
    "스테이터스 네트쿼크 토큰",
    "네오",
    "스팀",
    "스팀달러",
    "스트라티스",
    "뉴 이코노미 무브먼트",
    "코모도",
    "리스크",
    "오미세고",
    "머큐리",
    "아더",
    "아인스타이늄",
    "피벡스",
    "블록틱스",
    "파워렛저",
    "아크",
    "그로스톨코인",
    "스토리지",
    "메탈",
    "웨이브",
    "어거",
    "버트코인",
    "스톰",
    "아이콘",
    "골렘",
    "아이오에스티",
    "기프토",
    "폴리매쓰",
    "메인프레임",
    "아이오타",
    "디크레드",
    "디마켓",
    "제로엑스",
    "애드엑스",
    "시린토큰",
    "시빅",
    "베이직어텐션토큰",
    "에브리피디아",
    "룸네트워크",
    "모나코",
    "리퍼리움",
    "시아코인",
    "질리카",
    "온톨로지",
    "이그니스",
    "트론",
    "에이다",
    "오에스티"
  ]

  // requset모듈
  function getJsonRequest(code, callback) {
    var url = "https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-" + code;
    var hanName = '';
    var imageLink = '';

    console.log(code);
    //BTC, ETH, DASH, LTC, ETC, XRP, BCH, XMR, ZEC, QTUM, BTG, EOS (기본값: BTC), ALL(전체)
    //https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/10?code=CRIX.UPBIT.KRW-
    switch (code) {
      case 'BTC':
        hanName = "비트코인";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitcoin.jpg";
        break;
      case 'ETH':
        hanName = "이더리움";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethereum.jpg";
        break;
      case 'DASH':
        hanName = "대쉬";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dash.jpg";
        break;
      case 'LTC':
        hanName = "라이트 코인";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/litecoin.jpg";
        break;
      case 'ETC':
        hanName = "이더리움 클래식";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethereumclassic.jpg";
        break;
      case 'XRP':
        hanName = "리플";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ripple.jpg";
        break;
      case 'BCC':
        hanName = "비트코인 캐쉬";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitcoincash.jpg";
        break;
      case 'XMR':
        hanName = "모네로";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/moenro.jpg";
        break;
      case 'ZEC':
        hanName = "제트캐쉬";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/zcash.png";
        break;
      case 'QTUM':
        hanName = "퀀텀";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/quantum.png";
        break;
      case 'BTG':
        hanName = "비트코인 골드";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitgold.jpg";
        break;
      case 'XLM':
        hanName = "스텔라루멘";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/stellar.png";
        break;
      case 'SNT':
        hanName = "스테이터스 네트쿼크 토큰";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SNT.jpeg";
        break;
      case 'NEO':
        hanName = "네오";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/neo.jpg";
        break;
      case 'STEEM':
        hanName = "스팀";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/steem.jpg";
        break;
      case 'SBD':
        hanName = "스팀달러";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SBD.png";
        break;
      case 'STRAT':
        hanName = "스트라티스";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/STRAT.png";
        break;
      case 'XEM':
        hanName = "뉴 이코노미 무브먼트";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/XEM.png";
        break;
      case 'KMD':
        hanName = "코모도";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/KMD.png";
        break;
      case 'LSK':
        hanName = "리스크";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/LSK.jpg";
        break;
      case 'OMG':
        hanName = "오미세고";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/OMG.png";
        break;
      case 'MER':
        hanName = "머큐리";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/mer.png";
        break;
      case 'ARDR':
        hanName = "아더";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ARDR.png";
        break;
      case 'EMC2':
        hanName = "아인스타이늄";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/EMC2.png";
        break;
      case 'PIVX':
        hanName = "피벡스";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/PIVX.png";
        break;
      case 'TIX':
        hanName = "블록틱스";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/TIX.png";
        break;
      case 'POWR':
        hanName = "파워렛저";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/POWR.png";
        break;
      case 'ARK':
        hanName = "아크";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ARK.jpg";
        break;
      case 'GRS':
        hanName = "그로스톨코인";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/GRS.png";
        break;
      case 'STORJ':
        hanName = "스토리지";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/STORJ.jpg";
        break;
      case 'MTL':
        hanName = "메탈";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/MTL.jpg";
        break;
      case 'WAVES':
        hanName = "웨이브";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/WAVES.jpeg";
        break;
      case 'REP':
        hanName = "어거";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/REP.png";
        break;
      case 'VTC':
        hanName = "버트코인";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/VTC.png";
        break;
      case 'STORM':
        hanName = "스톰";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/storm.jpg";
        break;
      case 'ICX':
        hanName = "아이콘";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/icon.JPG";
        break;

        //2018년 9월 28일 추가
      case 'GNT':
        hanName = "골렘";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/GNT.png";
        break;
      case 'IOST':
        hanName = "아이오에스티";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IOST.png";
        break;
      case 'GTO':
        hanName = "기프토";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/GTO.png";
        break;
      case 'POLY':
        hanName = "폴리매쓰";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/POLY.png";
        break;
      case 'MFT':
        hanName = "메인프레임";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/MFT.png";
        break;
      case 'IOTA':
        hanName = "아이오타";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IOTA.png";
        break;
      case 'DCR':
        hanName = "디크레드";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/DCR.png";
        break;
      case 'DMT':
        hanName = "디마켓";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/DMT.png";
        break;
      case 'ZRX':
        hanName = "제로엑스";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ZRX.png";
        break;
      case 'ADX':
        hanName = "애드엑스";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ADX.png";
        break;
      case 'SRN':
        hanName = "시린토큰";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SRN.png";
        break;
      case 'CVC':
        hanName = "시빅";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/CVC.png";
        break;
      case 'BAT':
        hanName = "베이직어텐션토큰";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/BAT.png";
        break;
      case 'IQ':
        hanName = "에브리피디아";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IQ.png";
        break;
      case 'LOOM':
        hanName = "룸네트워크";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/LOOM.png";
        break;
      case 'MCO':
        hanName = "모나코";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/MCO.png";
        break;
      case 'RFR':
        hanName = "리퍼리움";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/RFR.png";
        break;
      case 'SC':
        hanName = "시아코인";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SC.png";
        break;
      case 'ZIL':
        hanName = "질리카";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ZIL.png";
        break;
      case 'ONT':
        hanName = "온톨로지";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ONT.png";
        break;
      case 'IGNIS':
        hanName = "이그니스";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IGNIS.png";
        break;
      case 'TRX':
        hanName = "트론";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/TRX.png";
        break;
      case 'ADA':
        hanName = "에이다";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ADA.png";
        break;
      case 'OST':
        hanName = "오에스티";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/OST.png";
        break;

      case 'ALL':
        url = "https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-BTC";
        hanName = "전체";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/main.jpg";
        break;
      default: // 기본은 모든 정보를 가져온다
        url = "https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-BTC";
        hanName = "전체";
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/main.jpg";
        break;
    }
    console.log(url);

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
          name: ''
        });
        return;
      }

      var original = JSON.parse(body.toString());
      callback(null, {
        code: 200,
        data: original[0],
        name: hanName,
        imageLink: imageLink
      });
    });

  }

  //Promise
  const asyncTask = (code) => new Promise(function(resolved, rejected) {
    getJsonRequest(code, function(err, result) {
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

      var title = 'Private Policy';
      var body = '<p>Private Policy</p>';

      var code = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<meta charset="utf-8" />',
        '<title>' + title + '</title>',
        '</head>',
        '<body>',
        body,
        '</body>',
        '</html>'
      ].join('\n');

      res.write(code, "utf8");
      res.end();
      break; // Get break

    default: // post


      //==========================================================================
      //==========================================================================
      //=========================여기서 부터 POST 처리=============================
      //==========================================================================
      //==========================================================================
      console.log('post')
      const requestBody = req.body; // 중요!

      const actionName = requestBody.action.actionName // Action intent 구분
      const parameters = requestBody.action.parameters // parameters
      const context = requestBody.action.context //context

      //DEBUG
      console.log(`request: ${JSON.stringify(actionName)}`)
      console.log(`parameters: ${JSON.stringify(parameters)}`)

      //response json 필드. 여기서 json을 만들어준다.
      function makeJson(jsons) {
        /**
         * [makeJson 설명]
         * @json {jsons}
         * 안에는 누구로 보낼 json들이 있습니다
         * json안에는 파라메터들이 있으며, 각 파라메터는 sk nugu의 play에서 지정한
         * 이름과 동일해야 합니다.
         */
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
                "metadata": {}
            }
          }
        }
        jsonReturn.output = jsons
        console.log(JSON.stringify(jsonReturn))

        return jsonReturn
      }

      // 콤마 찍기
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      // 넘어온 값이 빈값인지 체크합니다.
      //parameters.hasOwnProperty('number')
      // !value 하면 생기는 논리적 오류를 제거하기 위해
      // 명시적으로 value == 사용
      // [], {} 도 빈값으로 처리
      var isEmpty = function(value) {
        if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
          return true //비었음
        } else {
          return false //비어있지 않음
        }
      };



      // 처리 function
      function coinAnswer_intent(res) {
        console.log("coinAnswer_intent function");

        let displayText = '초기 displayText(변하지 않음)';
        console.log(`parameters: ${JSON.stringify(parameters)}`)
        let number = 1

        if (parameters.hasOwnProperty('number')) {
          number = parameters.number.value
          number = number.replace(/[^0-9]/g, '');
        } else {

        }
        const coin = parameters.coin.value;

        return asyncTask(coin)
          .then(function(results) {
            //로그 확인용
            console.log("Done => results : " + JSON.stringify(results));
            let displayText = '';

            if (results.code != 200) { //문제있음

              displayText = '현재 서버에 문제가 있어서 연결이 실패했습니다. 다시 시도해 주세요.'

            } else {

              let result = results.data;
              let average_price = parseInt(result.openingPrice);
              let name = results.name;

              let calculator = parseInt(average_price * number); // 계산
              let calculatorComma = numberWithCommas(calculator);

              displayText = name + '의 ' + number + '개 가격은 현재 ' + calculatorComma + '원 입니다.'

            } //200 or 400
            let output = {}
            output.answer = displayText
            return res.send(makeJson(output))

          }); //async End


      } // function End

      //arr가지고 리스트 텍스트 만드는 function
      function ListTextMake(arr) {
        let text = '';
        for (var j = 0; j < 8; j++) {
          if (j == 7) { //마지막은 , 제외
            text += arr[j] + '';
          } else {
            text += arr[j] + ', ';
          }

        }
        return text;
      } //ListTextMake

      //ARR를 넣으면 랜덤 해주기
      function shuffleRandom(a) {
        var j, x, i;
        for (i = a.length; i; i -= 1) {
          j = Math.floor(Math.random() * i);
          x = a[i - 1];
          a[i - 1] = a[j];
          a[j] = x;
        }
        return a;
      }

      // 처리 function
      function support_intent(res) {

        let displayText = '현재 지원되는 코인은 ' + ListTextMake(shuffleRandom(arr)) + ' 입니다. 또 물어보시면 다른 코인도 알려드립니다.';
        let output = {}
        output.answersupport = displayText
        return res.send(makeJson(output))

      } // function End


      // 처리 function
      function help_intent(res) {

        let displayText = '가상화폐 가격는 업비트의 시세로 가상화폐의 가격을 알려드립니다. 가상화폐만 말하시면 1개의 가격을 알려드리며, 가상화폐와 갯수를 말하면 계산된 가격을 알려드립니다.';
        let output = {}
        output.answers = displayText
        return res.send(makeJson(output))

      } // function End

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
        let result = makeJson(displayText);
        return res.status(200).send(result);
      } // SessionEndedRequest

      function SessionEndedRequest(res) {

        const Endfiled = false;
        let displayText = '인천공항 출국장 앱을 종료합니다. 이용해 주셔서 감사합니다!';
        let result = makeJson(displayText);
        return res.status(200).send(result);
      } // SessionEndedRequest



      //====================================================================
      //====================================================================
      //====================================================================
      //====================================================================

      const COINANSWER_INTENT = 'coinanswer';
      const HELP_INTENT = 'helps';
      const SUPPORTCOIN_INTENT = 'supportCoins'

      function intent_select(res) {
        console.log("actionName : " + actionName);
        switch (actionName) { //intent 별 분기처리
          case COINANSWER_INTENT:
            coinAnswer_intent(res);
            break;
          case HELP_INTENT:
            help_intent(res);
            break;
          case SUPPORTCOIN_INTENT:
            support_intent(res)
            break;

          default: //없는 경우 Fallback으로 일단 처리
            fallback(res);
        }
      }

      //type name
      const LAUNCH_REQUEST = 'NUGU.ACTION.welcome'; // WELCOME_INTENT
      const SESSION_ENDED_REQUEST = 'NUGU.ACTION.exit'; //종료
      // Intent가 오는 부분
      switch (actionName) {
        // 최초 실행시 오는 intent. LaunchRequest만 쓴다.
        case LAUNCH_REQUEST:
          return launchRequest(res)
          //INTENT_REQUEST의 경우 하위 function에서 switch로 intent를 처리합니다.
        case SESSION_ENDED_REQUEST:
          return SessionEndedRequest(res)
        default: //나머지 기본 intent
          return intent_select(res)

      } //switch requests.type

      break; // default end
  } //switch

}
