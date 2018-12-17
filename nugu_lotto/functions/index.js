'use strict';
const request = require('request');
const cheerio = require('cheerio');
const Promise = require('promise');
const iconvlite = require('iconv-lite');
/**
 * [누구 템플레이트 설명]
 * 구글 cloud용으로 만들어진 단독 파일입니다.
 * exports.nugu_template 의 'nugu_template'는 설정된 이름에 맞추어서 바꾸어 주시면 됩니다.
 *
 * req.body는 SK nugu에서 들어오는 json입니다.
 */

exports.nugu_lotto = (req, res) => {
  const appTitle = '로또마스터'; // 앱 타이틀을 적어주세요

  const requestBody = req.body; //request의 body부분
  const parameters = requestBody.action.parameters; // 파라메터 부분
  const context = requestBody.action.context; //컨텍스트, OAuth연결시 토큰이 들어옵니다
  const actionName = requestBody.action.actionName; // action의 이름
  console.log('requestBody ', requestBody);

  //마이크 오픈이라고 생각하는 것을 방지하기 위한 사용자 경험용 마지막 물음
  let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!', '또 궁금하신게 있으신가요?']

  //디버그 용, actionName을 표시합니다
  console.log(`request: ${JSON.stringify(actionName)}`);

  // 콤마 찍기 => 화폐나 사람 수
  // 숫자가 들어오면 String
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } //numberWithCommas


  //로또 서버, 회차와 현재회차는 0으로 , 다른회차는 0이 아닌 숫자로 구분한다
  function getLottoJson(num, callback) {
    let url = '';

    if (num != 0) { //num의 숫자를 이용해서 현재회차인지, 이전회차인지 구별합니다.
      url = "http://www.nlotto.co.kr/common.do?method=getLottoNumber&drwNo=" + num;
    } else { // 최신 회차는 크롤링을 통해서 구현
      url = 'https://www.nlotto.co.kr/gameResult.do?method=byWin'
    } // if

    //request를 이용하여 api요청, 혹은 웹 페이지를 요청합니다
    request({
      url: url,
      encoding: null,
      rejectUnauthorized: false, //Error: Hostname/IP doesn't match certificate's altnames:
      requestCert: false, //add when working with https sites
      agent: false, //add when working with https sites
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
      }
    }, function(err, resp, body) {
      if (err) {
        callback(err, {
          'returnValue': 'fail'
        });
        return;
      }

      if (num != 0) {
        const original = JSON.parse(body.toString());
        callback(null, original);
      } else {
        const original = iconvlite.decode(body, 'EUC-KR'); // json으로 변환
        const $ = cheerio.load(iconvlite.decode(body, 'EUC-KR'));
        let tempJson = {};

        //로또 회차
        tempJson.drwNo = $(".win_result h4 strong").text();
        //로또 날짜
        let dateCall = $(".win_result p.desc ").text().replace('추첨', '').replace('(', '').replace(')', '')
        let convertDate = dateCall.replace('년 ', '-').replace('월 ', '-').replace('일 ', '')
        tempJson.drwNoDate = convertDate;

        //로또 당첨 액수와 수
        $(".tbl_data.tbl_data_col tbody tr").each(function(index) {
          if (index == 0) {
            $(this).find('td').each(function(index2) {
              if (index2 == 1) { // 등위별 총 당첨금액
                tempJson.firstAccumamnt = $(this).text().replace('원', '').replace(/,/g, '');
              } else if (index2 == 2) { // 당첨게임 수
                tempJson.firstPrzwnerCo = $(this).text()
              } else if (index2 == 3) { // 1게임당 당첨금액
                tempJson.firstWinamnt = $(this).text().replace('원', '').replace(/,/g, '');
              } else if (index2 == 5) { // 1게임당 당첨금액
                tempJson.firstHowTo = $(this).text().replace('1등', '').replace('원', '').replace(/\n/g, '').trim().replace(/\t/g, '');
              }
            });
          }
        });
        //로또번호와 보너스 번호 추출
        $(".win_result div.nums div.num p span").each(function(index) {
          if (index == 6) { //보너스 번호 추출
            tempJson.bnusNo = $(this).text()
          } else { // 보너스 번호 아닌거 추출
            //로또번호 api와 동일하게 이름을 만듭니다. drwtNo + 번호 식
            tempJson['drwtNo' + (index + 1)] = $(this).text();
          }
        })

        //성공여부
        tempJson.returnValue = "success";
        callback(null, tempJson);
      }

    });

  } // getLottoJson

  //Promise
  const asyncTask = (insertData) => new Promise(function(resolved, rejected) {
    getLottoJson(insertData, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  //Array를 랜덤하게 바꿔주는 shuffle fucntion
  function shuffle(array) {
    var i = 0,
      j = 0,
      temp = null

    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1))
      temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  } // shuffle


  let output = {}; //parameter를 저장할 output변수, 자주 사용하는 관계로 상단에 선언합니다.

  /**
   * [makeJson description]
   * response에 보낼 json을 만드는 부분입니다.
   * parameter에 데이터를 저장을 합니다.
   */
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
          "audioitems": {
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

    }
    jsonReturn.output = jsons
    return jsonReturn;
  } //makeJson


  /**
   * [nowlotto_function description]
   * 이 부분에선 선태된 회차를(예: 257회차)를 api를 이용하여 조회하는 부분입니다.
   * 원래는 api를 이용하여 조회가 가능하였으나, api의 에러로 인하여 현재회차의 경우
   * 사이트를 파싱하게 됩니다. request모듈과 jquery를 이용합니다.
   */
  function nowlotto_function() {
    console.log('nowlotto_function')
    return asyncTask(0)
      .then(function(items) {
        console.log('items: ', items)
      //여기서 서버연결후 데이터 출력 items으로 가져옴
      let returnValue = items.returnValue; // success or fail

      if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등
        //현재회차의 경우 에러가 나는 일은 없습니다.

      } else { // 서버가 에러가 나지 않는다면
        let firstWinAmount = items.firstWinamnt; // 1등상 액수
        let firstPrizeHuman = items.firstPrzwnerCo; // 총 인원
        let rawDate = items.drwNoDate; // 당첨날짜

        //날짜 구하는 부분
        var dt = new Date(rawDate);
        let month = dt.getMonth() + 1;
        let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';
        let kai = items.drwNo; // 회차

        // 번호들, 보너스번호
        let number1 = items.drwtNo1;
        let number2 = items.drwtNo2;
        let number3 = items.drwtNo3;
        let number4 = items.drwtNo4;
        let number5 = items.drwtNo5;
        let number6 = items.drwtNo6;
        let bnusNo = items.bnusNo;
        let firstHowTo = '';
        let resultFirstPrize = numberWithCommas(firstWinAmount);

        if (items.firstHowTo != undefined) {
          firstHowTo = items.firstHowTo
          firstPrizeHuman = firstHowTo
        }

        /**
         * [각 파라메터 설명]
         * @param firstPrizeHuman {Strings} : 1등상 당첨자수와 자동수동 여부
         * @param resultFirstPrize {Strings} : 1등상 액수
         * @param dateText {String} : 날짜
         * @param kai {String} : 회차
         *
         * 이하는 각 회차의 번호
         * @param first {int}
         * @param second {int}
         * @param third {int}
         * @param fourth {int}
         * @param fifth {int}
         * @param sixth {int}
         * @param bnusNo {int} : 보너스 번호
         */
        output.firstPrizeHuman = firstPrizeHuman;
        output.resultFirstPrize = resultFirstPrize;
        output.dateText = dateText;
        output.kai = kai;
        //당첨번호 6개의 숫자를 보낼 파라메터에 저장
        output.first = number1;
        output.second = number2;
        output.third = number3;
        output.fourth = number4;
        output.fifth = number5;
        output.sixth = number6;
        output.bnusNo = bnusNo;
        console.log(output)
        return res.send(makeJson(output));
      }

    });
  } // nowlotto_function

  /**
   * [selectLottoNum_function description]
   * 이 부분에선 선태된 회차를(예: 257회차)를 api를 이용하여 조회하는 부분입니다.
   * 조회를 위해서 외부 api를 사용하며, request모듈을 이용합니다.
   */
  function selectLottoNum_function() {
    console.log('selectLottoNum_function')
    const selectNum = parameters.selectNum.value // Request에 있는 parameters의 회차 값 불러오기
    const numberValues = selectNum.replace(/[^0-9]/g, ""); // 안전을 위해서 들어온 parameter값을 숫자만 남기기
    let speechText = '';

    return asyncTask(numberValues)
      .then(function(items) {
        console.log(items)
      //여기서 서버연결후 데이터 출력 items으로 가져옴
      let returnValue = items.returnValue; // success or fail

      if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등
        speechText = "아직 진행되지 않은 로또회차이거나 서버에러 등으로 서비스를 제공할 수 없었습니다. 다른 회차를 말해주세요.";
        output.selectLotto = speechText;
      } else { // 서버가 움직인다면
        let firstWinAmount = items.firstWinamnt; // 1등상 액수
        let firstPrizeHuman = items.firstPrzwnerCo; // 총 인원
        let rawDate = items.drwNoDate; // 당첨날짜

        //날짜 구하는 부분
        var dt = new Date(rawDate);
        let month = dt.getMonth() + 1;
        let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';
        let kai = items.drwNo; // 회차

        // 번호들, 보너스번호
        let number1 = items.drwtNo1;
        let number2 = items.drwtNo2;
        let number3 = items.drwtNo3;
        let number4 = items.drwtNo4;
        let number5 = items.drwtNo5;
        let number6 = items.drwtNo6;
        let bnusNo = items.bnusNo;
        let firstHowTo = '';
        let resultFirstPrize = numberWithCommas(firstWinAmount);

        if (items.firstHowTo != undefined) {
          firstPrizeHuman = items.firstHowTos
        }

        speechText = dateText + "의 " + kai + "회차 로또번호는 " +
          number1 +
          ", " +
          number2 +
          ", " +
          number3 +
          ", " +
          number4 +
          ", " +
          number5 +
          ", " +
          number6 +
          " 보너스 번호는 " +
          bnusNo +
          " 입니다. 1등상은 " + firstPrizeHuman + "명이 당첨되었으며 액수는 1인당 " + resultFirstPrize + "원 입니다.";
        output.selectLotto = speechText;
      }
      return res.send(makeJson(output));

    });
  } // selectLottoNum_function

  /**
   * [makeLottoNum_function description]
   * 로또번호를 생성하는 부분입니다.
   * Array에 미리 저장되있는 번호를 랜덤화 한후, 6개의 숫자만 가져와 정렬하여 출력합니다.
   */
  function makeLottoNum_function() {

    //1~45 Array생성
    let allLottoArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
    // 6개만 가져올 것
    let getArrays = [1, 2, 3, 4, 5, 6];
    let resultArray = shuffle(allLottoArray);
    for (var i = 0; i < 6; i++) {
      getArrays[i] = resultArray[i];
    }

    getArrays.sort(function(a, b) {
      return a - b
    }); // 사용자 경험을 위한 번호 정렬

    //생성된 6개의 숫자를 보낼 파라메터에 저장
    output.firstNum = getArrays[0];
    output.secondNum = getArrays[1];
    output.thirdNum = getArrays[2];
    output.fourthNum = getArrays[3];
    output.fifthNum = getArrays[4];
    output.sixthNum = getArrays[5];

    return res.send(makeJson(output));
  } // makeLottoNum_function

  function lottoChange_function() {
    const selectNum = parameters.selectPrize.value // Request에 있는 parameters의 1~5등 불러오기
    const numberValues = selectNum.replace(/[^0-9]/g, ""); // 안전을 위해서 들어온 parameter값을 숫자만 남기기
    console.log('numberValues: ', numberValues)
    let speechText = '';

    switch (numberValues) {
      case 1:
        speechText = '혹시 1등이신가요? 1등은 신분증을 가지고 농협은행 본점에서만 수령이 가능합니다.';
        break;
      case 2:
        speechText = '2등은 신분증을 가지고 지역농협을 제외한 농협은행 영업점에서 당첨금을 수령하시면 됩니다.';
        break;
      case 3:
        speechText = '3등은 신분증을 가지고 지역농협을 제외한 농협은행 영업점에서 당첨금을 수령하시면 됩니다.';
        break;
      case 4:
        speechText = '4등은 5만원입니다. 복권 판매점에서 교환하면 됩니다. ';
        break;
      case 5:
        speechText = '5등은 5천원! 복권 판매점에서 교환하면 됩니다. ';
        break;
      default:
        speechText = '그런 상은 존재하지 않습니다. 로또는 1등부터 5등까지만 있답니다. ';
    }

    /**
     * 완성된 텍스트 전체를 parameter로 넘기는 형태입니다.
     * shuffle(lastTextArr[0])는 사용자경험을 위한 모듈입니다.
     */
    output.lottoChange = speechText + shuffle(lastTextArr)[0];
    return res.send(makeJson(output));

  } //lottoChange_function

  //액션 선언 모음, 여기서 액션을 선언해 줍니다.
  const ACTION_NOWLOTTO = 'action.nowLotto'; //현재회차 로또
  const ACTION_SELECTLOTTONUM = 'action.selectLottoNum'; //특정회차 로또
  const ACTION_MAKELOTTONUM = 'action.makeLottoNum';
  const ACTION_LOTTOCHANGE = 'action.lottoChange';

  // Intent가 오는 부분, actionName으로 구분합니다.
  // case안에서 작동할 function을 적습니다.
  switch (actionName) {
    case ACTION_NOWLOTTO:
      return nowlotto_function()
      break;
    case ACTION_SELECTLOTTONUM:
      return selectLottoNum_function()
      break;
    case ACTION_MAKELOTTONUM:
      return makeLottoNum_function()
      break;
    case ACTION_LOTTOCHANGE:
      return lottoChange_function()
      break;
  }
}
