'use strict';

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

    //마이크 오픈이라고 생각하는 것을 방지하기 위한 사용자 경험용 마지막 물음
    let lastTextArr = ['다음 명령을 말해주세요', '다음 질문이 있으신가요', '이제 어떤 것을 해드릴까요.', '이제 명령을 해 주세요.', '다른 질문이 있으신가요?', '이제 질문해주세요!', '또 궁금하신게 있으신가요?']

    //디버그 용, actionName을 표시합니다
    console.log(`request: ${JSON.stringify(actionName)}`);


    //로또 서버, 회차와 현재회차는 0으로 , 다른회차는 0이 아닌 숫자로 구분한다
    function getLottoJson(num, callback) {
      let url = '';
      if (num != 0) { //이전회차는 api를 이용하여 구현
        let url = "http://www.nlotto.co.kr/common.do?method=getLottoNumber";
        url += "&drwNo=";
        url += num;
      } else { // 최신 회차는 크롤링을 통해서 구현
        url = 'http://www.nlotto.co.kr/gameResult.do?method=byWin'
      } // if

      //request모듈을 사용합니다.
      request({
        url: url,
        encoding: null,
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
          tempJson.drwNo = $(".lotto_win_number.mt12 h3 strong").text();
          let dateCall = $(".lotto_win_number.mt12 h3 span").text().replace('추첨', '').replace('(', '').replace(')', '')
          let convertDate = dateCall.replace('년 ', '-').replace('월 ', '-').replace('일 ', '')
          tempJson.drwNoDate = convertDate;

          $(".tblType1.f12.mt40 tbody tr").each(function(index) {
            if (index == 1) {
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
                console.log($(this).text().replace(' ', ''));
              });
            }
          });

          $(".lotto_win_number.mt12 p.number").each(function(index) {
            $(this).find('img').each(function(index2) {
              if (index2 == 6) {
                let bonus = $(this).attr('alt');
                tempJson.bnusNo = bonus;
              } else {
                let index3 = index2 + 1;
                tempJson['drwtNo' + index3] = $(this).attr('alt');
              }
            });
          })
          tempJson.returnValue = "success";
          callback(null, tempJson);
        }

      });

    } // getLottoJson

    function lottoServerRequest(num) {
      return new Promise(function(resolved, rejected) {
        getLottoJson(num, function(err, result) {
          if (err) {
            rejected(err);
          } else {
            resolved(result);
          }
        });
      });
    }


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
    }

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
        jsonReturn.output = jsons;
        return jsonReturn;
      }


      /**
       * [answername 설명]
       * @answername : json으로 보낼 파라메터 이름을 지정합니다.
       * 여기서는 answername으로 합니다.
       */
      // intent
      function action_intent() {
        let speechText = '';
        let output = {};

        output.answername = speechText;
        return res.send(makeJson(output));
      } //function

      /**
       * [makeLottoNum_function description]
       * 로또번호를 생성하는 부분입니다.
       * Array에 미리 저장되있는 번호를 랜덤화 한후, 6개의 숫자만 가져와 정렬하여 출력합니다.
       */
      function makeLottoNum_function() {
        let output = {};
        var allLottoArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
        // 6개만 가져올 것
        var getArrays = [1, 2, 3, 4, 5, 6];
        var resultArray = shuffle(allLottoArray);
        for (var i = 0; i < 6; i++) {
          getArrays[i] = resultArray[i];
        }

        getArrays.sort(function(a, b) {
          return a - b
        }); // 사용자 경험을 위한 정렬

        //생성된 6개의 숫자를 보낼 파라메터에 저장
        output.firstNum = getArrays[0];
        output.secondNum = getArrays[1];
        output.thirdNum = getArrays[2];
        output.fourthNum = getArrays[3];
        output.fifthNum = getArrays[4];
        output.sixthNum = getArrays[5];
        return res.send(makeJson(output));
      }

      function nowlotto_function() {
        const numberValues = 0;

        Promise.all([lottoServerRequest(numberValues)]).then(function(items) {
          //여기서 서버연결후 데이터 출력 items으로 가져옴
          let returnValue = items[0].returnValue; // success or fail

          if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등

          } else { // 서버가 움직인다면
            let firstWinAmount = items[0].firstWinamnt; // 1등상 액수
            let firstPrizeHuman = items[0].firstPrzwnerCo; // 총 인원
            let rawDate = items[0].drwNoDate; // 당첨날짜

            //날짜 구하는 부분
            var dt = new Date(rawDate);
            let month = dt.getMonth() + 1;
            let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';
            let kai = items[0].drwNo; // 회차

            // 번호들, 보너스번호
            let number1 = items[0].drwtNo1;
            let number2 = items[0].drwtNo2;
            let number3 = items[0].drwtNo3;
            let number4 = items[0].drwtNo4;
            let number5 = items[0].drwtNo5;
            let number6 = items[0].drwtNo6;
            let bnusNo = items[0].bnusNo;
            let firstHowTo = '';
            let resultFirstPrize = numberWithCommas(firstWinAmount);

            if (items[0].firstHowTo != undefined) {
              firstHowTo = items[0].firstHowTo
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
            return res.send(makeJson(output));
          }

        });
      }

      function selectLottoNum_function() {

        const selectNum = parameters.selectNum.value
        const numberValues = selectNum.replace(/[^0-9]/g, ""); // 숫자만 남기기

        Promise.all([lottoServerRequest(numberValues)]).then(function(items) {
          //여기서 서버연결후 데이터 출력 items으로 가져옴
          let returnValue = items[0].returnValue; // success or fail

          if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등

          } else { // 서버가 움직인다면
            let firstWinAmount = items[0].firstWinamnt; // 1등상 액수
            let firstPrizeHuman = items[0].firstPrzwnerCo; // 총 인원
            let rawDate = items[0].drwNoDate; // 당첨날짜

            //날짜 구하는 부분
            var dt = new Date(rawDate);
            let month = dt.getMonth() + 1;
            let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';
            let kai = items[0].drwNo; // 회차

            // 번호들, 보너스번호
            let number1 = items[0].drwtNo1;
            let number2 = items[0].drwtNo2;
            let number3 = items[0].drwtNo3;
            let number4 = items[0].drwtNo4;
            let number5 = items[0].drwtNo5;
            let number6 = items[0].drwtNo6;
            let bnusNo = items[0].bnusNo;
            let firstHowTo = '';
            let resultFirstPrize = numberWithCommas(firstWinAmount);

            if (items[0].firstHowTo != undefined) {
              firstHowTo = items[0].firstHowTo
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
            return res.send(makeJson(output));
          }

        });
      }

      function lottoChange_function(){
        let speechText = '5등은 판매점에서 교환하면 됩니다. 4등 판매점과 농협은행, 3등과 2등신분증을 가지고 농협은행에서 당첨금 1등은 신분증을 가지고 농협은행 본점에서';
        output.lottochange = speechText;
        return res.send(makeJson(output));

      }

      //액션 선언 모음, 여기서 액션을 선언해 줍니다.
      const ACTION_NOWLOTTO = 'action.nowLotto'; //현재회차 로또
      const ACTION_SELECTLOTTONUM = 'action.selectLottoNum'; //특정회차 로또
      const ACTION_FIRSTWIN = 'action.firstWin';
      const ACTION_SECONDWIN = 'action.secondWin';
      const ACTION_THIRDWIN = 'action.thirdWin';
      const ACTION_FOURTH = 'action.fourthWin';
      const ACTION_FIFTHWIN = 'action.fifthWin';
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
        case ACTION_FIRSTWIN:
          return firstWin_function()
          break;
        case ACTION_SECONDWIN:
          return secondWin_function()
          break;
        case ACTION_THIRDWIN:
          return thirdWin_function()
          break;
        case ACTION_FOURTH:
          return fourthWin_function()
          break;
        case ACTION_FIFTHWIN:
          return fifthWin_function()
          break;
        case ACTION_MAKELOTTONUM:
          return makeLottoNum_function()
          break;
          case ACTION_LOTTOCHANGE:
            return lottoChange_function()
            break;
      }
