'use strict';

const nuguApp = require('nugujs'); // nugujs 모듈 사용.
const randomField = require('randomize');
const request = require('request');
const iconv = require('iconv-lite');

exports.nugu_movie = (req, res) => {

  // health 페이지
  if(req.method == 'GET'){
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });
    var title = '살려줘요';
    var body = '<p>살려줘요</p>';
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
    return ;
  }

  const nugu = nuguApp(req, res); //request와 response를 넣어줌
  let output = {}; //parameter를 위한 output

  //앱 타이틀 (전역으로 사용)
  const appTitle = '무비마스터'
  //마지막 마이크 오픈 방지
  const lastConv = randomField(
    '이제 하실말을 해 주세요.',
    '또 어떤것을 찾을까요.',
    '다음 명령을 말해주세요.'
  )


  // 콤마 찍기 => 화폐나 사람 수
  //숫자가 들어오면 String
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  function requesetParsing(insertData, dayType, callback) {
    //insertData는 json으로 들어온다. insertData.movieName, insertData.date
    let url = ''; //URL
    let forms = {
      key: '380da2340a8f0017bf5b373e10fc722c', // 서비스키
      targetDt: insertData.date
    }

    switch (dayType) {
      //사이트 자체 파싱
      //http://www.kobis.or.kr/kobisopenapi/homepg/apiservice/searchServiceInfo.do

      //주간은 전주 일요일까지를 기준으로 조회가 가능 (최종 일요일로 해주는 로직 짜야 함)
      case 'Day': //일별 조회
        url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json";
        forms = {}
        request({
          method: 'GET',
          url: url,
          encoding: null,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
          },
          timeout: 1000 * 30,
          qs: forms
        }, function(err, res, responseBody) {
          if (err) {
            callback(err, {
              code: 400,
              status: '조회에 실패하였습니다'
            });
            return;
          }
          let response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
          let jsonData = iconv.decode(responseBody, response_encoding);

          callback(null, {
            code: 200,
            status: currentStatus,
            list: tableRow
          });

        });

        break;

        //주간별 조회
      case 'Days':
        console.log('insertData.movieType ', insertData.movieType);
        console.log('insertData.movieNation ', insertData.nationType);
        url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json";
        forms.weekGb = 0; //기본값 월요일 부터 일요일까지로 고정
        if (insertData.movieType != undefined || insertData.movieType != null || insertData.movieType != '') {
          forms.multiMovieYn = insertData.movieType; // 영화타입 (보통은 상업으로) Y or N 기본은 default
        }
        if (insertData.nationType != undefined || insertData.nationType != null || insertData.nationType != '') {
          forms.repNationCd = insertData.nationType; //제조국가 K or F 기본은 default
        }
        console.log('forms: ', forms);

        request({
          method: 'GET',
          url: url,
          encoding: null,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
          },
          qs: forms
        }, function(err, res, responseBody) {
          if (err) {
            callback(err, {
              code: 400,
              status: '조회에 실패하였습니다'
            });
            return;
          }
          const html = responseBody.toString();
          //json받기
          const result = JSON.parse(html);
          console.log(result);
          const showRange = result.boxOfficeResult.showRange; //조회범위

          if (showRange == undefined) {
            //callback
            callback(null, {
              code: 200,
              result: 'fail'
            });

          } else {
            const tableRow = result.boxOfficeResult.weeklyBoxOfficeList; //영화 리스트 정보
            //callback
            callback(null, {
              code: 200,
              showRange: showRange,
              list: tableRow,
              result: 'success'
            });
          }

        });
        break;

    } // switch

  } //function

  //Promise
  const asyncTask = (insertData, requestCase) => new Promise(function(resolved, rejected) {
    requesetParsing(insertData, requestCase, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });

  // n : 수치

  // digits : 자를 소수점 자리수
  function RoundXL(n, digits) {

    var str_n = String(n); //숫자를 스트링으로 변환
    var float_n = parseFloat(str_n);
    // 소수부 반올림
    if (digits >= 0) return parseFloat(float_n.toFixed(digits));
    // 정수부 반올림 ( digit값이 - 이면 정수부 상위 부분이 반올림 )
    digits = Math.pow(10, digits);
    var t = Math.round(float_n * digits) / digits;
    return parseFloat(t.toFixed(0));

  }

  function movieSearch(dayType, dateRaw, nationType, movieType, dayconfirm) {
    //현재시간 받기
    let nowDate = new Date();

    var dayLabel = nowDate.getDay() //0 = 일요일
    if (dayLabel != 0) { //일요일이 아니라면
      nowDate = new Date(nowDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel + 9 * 60 * 60 * 1000);
    }

    // 0을 앞에 붙이면 3자리가 된다. 그리고 나서 1~2의 자리를 뽑는다.
    var dd = ('0' + nowDate.getDate()).slice(-2);
    var mm = ('0' + (nowDate.getMonth() + 1)).slice(-2); //January is 0!
    var yyyy = nowDate.getFullYear() + '';

    //검증 구역 나중에 주석처리
    console.log('nowDate: ', nowDate.toString());
    console.log('dateRaw: ', dateRaw);

    //빈 값이라면 현재 날짜로 처리하고 종료
    if (dateRaw == null || dateRaw == undefined || dateRaw == '' || dateRaw == 'undefined') {
      dateRaw = yyyy + '-' + mm + '-' + dd;

    } else { // 날짜가 들어온다면 처리 시작
      const dateSplit = dateRaw.split('-'); //날자가 들어오면 Day의 경우 0~2미만 만 이용

      //들어온 데이터가 현재 날짜보다 작으면 그대로 이용
      let dateRawDate = new Date(dateRaw);

      dayLabel = dateRawDate.getDay(); //0 일요일
      if (dayLabel > 0) { //일요일이 아니라면
        dateRawDate = new Date(dateRawDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel);
        dd = ('0' + dateRawDate.getDate()).slice(-2);
      }

      yyyy = dateSplit[0];
      mm = dateSplit[1];
      dd = dateSplit[2].substring(0, 2);

      //설정된 시간이 현재시간보다 큰 경우
      if (dateRawDate.getTime() > nowDate.getTime()) {
        console.log('들어온 데이터가 더 큼 ');
        console.log(parseInt(dateSplit[0]));
        console.log(nowDate.getFullYear());

        //들어온 년도가 지금 년도보다 크거나 같은 경우 교체
        if (parseInt(dateSplit[0]) >= nowDate.getFullYear()) {
          console.log('년도 교체 ');
          yyyy = nowDate.getFullYear() - 1;

        }
      } //if (dateRawDate.getTime() > nowDate.getTime()) {

    } //if (dateRaw == null || dateRaw == undefined || dateRaw == '') {

    //최종 날짜 조립
    const complateDate = yyyy + '' + mm + '' + dd //yyyyMMdd형태로 만든다.
    let complateDateSay = yyyy + '년 ' + mm + '월 ' + dd + '일 '

    // 1. 주간 일간 2. 국가타입 과 영화 종류 : null undefined 이면 전체
    if (dayType === undefined || dayType === null) dayType = 'Days';
    if (nationType === undefined || nationType === null || nationType === '') nationType = undefined;
    if (movieType === undefined || movieType === null || movieType === '') movieType = undefined;
    if (dayconfirm == 1){
      dayType = 'Days';
      complateDateSay = '그 달의 1주차 ';
    }

    //json 형태로 보내기
    let insertData = {
      'date': complateDate,
      'movieType': movieType,
      'nationType': nationType
    }

    //request
    return asyncTask(insertData, dayType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));

        if (result.code != 200 && result.code != 300) { //300과 200 피하
          output.movieinfo = '현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ' + lastConv
          nugu.say(output)

        } else { // no problem -> List
          //showRange : 기간 나옴
          //list > List로 정보 아래

          //영화 정보, 최대 10개 조회 = 9가 마지막
          // rnum "1"
          // movieList.rank "1"
          // rankInten "0"
          // movieList.rankOldAndNew "OLD"
          // movieCd "20153446"
          // movieList.movieNm "너의 결혼식"
          // movieList.openDt "2018-08-22"
          // salesAmt "5018864832"
          // movieList.salesShare "30.7"
          // salesInten "-1144166568"
          // movieList.salesChange "-18.6"
          // salesAcc "16429676432"
          // movieList.audiCnt "568273"
          // audiInten "-125892"
          // movieList.audiChange "-18.1"
          // movieList.audiAcc "1948597" //누적관객수
          // scrnCnt "969"
          // showCnt "13387"

          if (result.result == 'fail') {

            output.movieinfo = '그 주엔 영화 검색 데이터가 없습니다. 아직 집계가 안된 주일 가능성이 높습니다.' + lastConv
            nugu.say(output)

          } else if (result.result == 'success') {
            const showRange = result.showRange;
            const movieList = result.list;

            let speechText = complateDateSay + '의 영화순위는 ';
            for (let i = 0; i < 5; i++) {
              const percent = movieList[i].salesShare
              const audiAcc = RoundXL(movieList[i].audiAcc, -3)
              speechText += movieList[i].rank + ' ' + movieList[i].movieNm + ', ' + audiAcc + '명, ';
            }
            speechText += '입니다. ' + lastConv;
            output.movieinfo = speechText
            nugu.say(output)

          }


        }

      });
  } //


  function movieSearchLast(dayType, dateRaw, nationType, movieType) {
    //현재시간 받기
    let nowDate = new Date();

    var dayLabel = nowDate.getDay() //0 = 일요일
    if (dayLabel != 0) { //일요일이 아니라면
      nowDate = new Date(nowDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel + 9 * 60 * 60 * 1000);
    }

    // 0을 앞에 붙이면 3자리가 된다. 그리고 나서 1~2의 자리를 뽑는다.
    var dd = ('0' + nowDate.getDate()).slice(-2);
    var mm = ('0' + (nowDate.getMonth() + 1)).slice(-2); //January is 0!
    var yyyy = nowDate.getFullYear() + '';

    //검증 구역 나중에 주석처리
    console.log('nowDate: ', nowDate.toString());
    console.log('dateRaw: ', dateRaw);

    //빈 값이라면 현재 날짜로 처리하고 종료
    if (dateRaw == null || dateRaw == undefined || dateRaw == '') {
      dateRaw = yyyy + '-' + mm + '-' + dd;

    } else { // 날짜가 들어온다면 처리 시작
      const dateSplit = dateRaw.split('-'); //날자가 들어오면 Day의 경우 0~2미만 만 이용

      //들어온 데이터가 현재 날짜보다 작으면 그대로 이용
      let dateRawDate = new Date(dateRaw);

      dayLabel = dateRawDate.getDay(); //0 일요일
      if (dayLabel > 0) { //일요일이 아니라면
        dateRawDate = new Date(dateRawDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel);
        dd = ('0' + dateRawDate.getDate()).slice(-2);
      }

      yyyy = dateSplit[0];
      mm = dateSplit[1];
      dd = dateSplit[2].substring(0, 2);

      //설정된 시간이 현재시간보다 큰 경우
      if (dateRawDate.getTime() > nowDate.getTime()) {
        console.log('들어온 데이터가 더 큼 ');
        console.log(parseInt(dateSplit[0]));
        console.log(nowDate.getFullYear());

        //들어온 년도가 지금 년도보다 크거나 같은 경우 교체
        if (parseInt(dateSplit[0]) >= nowDate.getFullYear()) {
          console.log('년도 교체 ');
          yyyy = nowDate.getFullYear();

          // 들어온 년도가 지금년도보다 크고, 들어온 달이 지금 달보다 크면 지금 달로 교체
          if (parseInt(dateSplit[1]) > parseInt(mm)) {
            console.log('달 교체 ');
            mm = mm
          }
        }
      } //if (dateRawDate.getTime() > nowDate.getTime()) {

    } //if (dateRaw == null || dateRaw == undefined || dateRaw == '') {

    //최종 날짜 조립
    const complateDate = yyyy + '' + mm + '' + dd //yyyyMMdd형태로 만든다.
    const complateDateSay = '그 주'
    // 1. 주간 일간 2. 국가타입 과 영화 종류 : null undefined 이면 전체
    if (dayType === undefined || dayType === null) {
      dayType = 'Days';
    }
    if (nationType === undefined || nationType === null || nationType === '') {
      nationType = undefined;
    }
    if (movieType === undefined || movieType === null || movieType === '') {
      movieType = undefined;
    }

    //json 형태로 보내기
    let insertData = {
      'date': complateDate,
      'movieType': movieType,
      'nationType': nationType
    }

    //request
    return asyncTask(insertData, dayType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));

        if (result.code != 200 && result.code != 300) { //300과 200 피하
          output.movieinfolast = '현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ' + lastConv
          nugu.say(output)

        } else { // no proble


          if (result.result == 'fail') {

            output.movieinfolast = '그 주엔 영화 검색 데이터가 없습니다. 아직 집계가 안된 주일 가능성이 높습니다.' + lastConv
            nugu.say(output)

          } else if (result.result == 'success') {
            const showRange = result.showRange;
            const movieList = result.list;

            let speechText = complateDateSay + '의 영화순위는 ';
            for (let i = 0; i < 5; i++) {
              const percent = movieList[i].salesShare
              const audiAcc = RoundXL(movieList[i].audiAcc, -3)
              speechText += movieList[i].rank + '위는 ' + movieList[i].movieNm + ', ' + audiAcc + '명, ';
            }
            speechText += '입니다. ' + lastConv;
            output.movieinfolast = speechText
            nugu.say(output)

          }


        }

      });
  } //


  function movieSearchForGrade(dayType, dateRaw, nationType, movieType, grade) {
    //현재시간 받기
    let nowDate = new Date();

    var dayLabel = nowDate.getDay() //0 = 일요일
    if (dayLabel != 0) { //일요일이 아니라면
      nowDate = new Date(nowDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel + 9 * 60 * 60 * 1000);
    }

    // 0을 앞에 붙이면 3자리가 된다. 그리고 나서 1~2의 자리를 뽑는다.
    var dd = ('0' + nowDate.getDate()).slice(-2);
    var mm = ('0' + (nowDate.getMonth() + 1)).slice(-2); //January is 0!
    var yyyy = nowDate.getFullYear() + '';

    //검증 구역 나중에 주석처리
    console.log('nowDate: ', nowDate.toString());
    console.log('dateRaw: ', dateRaw);

    //빈 값이라면 현재 날짜로 처리하고 종료
    if (dateRaw == null || dateRaw == undefined || dateRaw == '') {
      dateRaw = yyyy + '-' + mm + '-' + dd;

    } else { // 날짜가 들어온다면 처리 시작
      const dateSplit = dateRaw.split('-'); //날자가 들어오면 Day의 경우 0~2미만 만 이용

      //들어온 데이터가 현재 날짜보다 작으면 그대로 이용
      let dateRawDate = new Date(dateRaw);

      dayLabel = dateRawDate.getDay(); //0 일요일
      if (dayLabel > 0) { //일요일이 아니라면
        dateRawDate = new Date(dateRawDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel);
        dd = ('0' + dateRawDate.getDate()).slice(-2);
      }

      yyyy = dateSplit[0];
      mm = dateSplit[1];
      dd = dateSplit[2].substring(0, 2);

      //설정된 시간이 현재시간보다 큰 경우
      if (dateRawDate.getTime() > nowDate.getTime()) {
        console.log('들어온 데이터가 더 큼 ');
        console.log(parseInt(dateSplit[0]));
        console.log(nowDate.getFullYear());

        //들어온 년도가 지금 년도보다 크거나 같은 경우 교체
        if (parseInt(dateSplit[0]) >= nowDate.getFullYear()) {
          console.log('년도 교체 ');
          yyyy = nowDate.getFullYear() - 1;
        } //if (dateRawDate.getTime() > nowDate.getTime()) {

      } //if (dateRaw == null || dateRaw == undefined || dateRaw == '') {

      //최종 날짜 조립
      const complateDate = yyyy + '' + mm + '' + dd //yyyyMMdd형태로 만든다.
      const complateDateSay = '그 주'
      // 1. 주간 일간 2. 국가타입 과 영화 종류 : null undefined 이면 전체
      if (dayType === undefined || dayType === null) {
        dayType = 'Days';
      }
      if (nationType === undefined || nationType === null || nationType === '') {
        nationType = undefined;
      }
      if (movieType === undefined || movieType === null || movieType === '') {
        movieType = undefined;
      }

      //json 형태로 보내기
      let insertData = {
        'date': complateDate,
        'movieType': movieType,
        'nationType': nationType
      }

      //request
      return asyncTask(insertData, dayType)
        .then(function(result) {
          //로그 확인용
          console.log("result : " + JSON.stringify(result));

          if (result.code != 200 && result.code != 300) { //300과 200 피하
            output.movieinfograde = '현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ' + lastConv
            nugu.say(output)

          } else { // no problem

            if (result.result == 'fail') {

              output.movieinfograde = '그 주엔 영화 검색 데이터가 없습니다. 아직 집계가 안된 주일 가능성이 높습니다.' + lastConv
              nugu.say(output)

            } else if (result.result == 'success') {
              const showRange = result.showRange;
              const movieList = result.list;

              let speechText = complateDateSay + '의 영화순위는 ';
              for (let i = 0; i < 10; i++) {
                if (i == (grade - 1)) {
                  const percent = movieList[i].salesShare
                  const audiAcc = RoundXL(movieList[i].audiAcc, -3)
                  speechText += movieList[i].rank + '위는 ' + movieList[i].movieNm + ', ' + audiAcc + '명, ';
                }
              }
              speechText += '입니다. ' + lastConv;
              console.log(speechText)
              output.movieinfograde = speechText
              nugu.say(output)

            }


          }

        });
    } //
  }

  function movieInfo_action() {
    let dTemp = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 9);
    let month = nugu.get('month');
    console.log('month ', month)

    if (month == undefined || month == 'undefined') { // 이번달로
      month = dTemp.getMonth() + 1
    }

    let day = nugu.get('day');
    let dayconfirm = 0
    console.log('day ', day)
    if (day == undefined || day == 'undefined') { // 날짜가 없다면 1일 고정
      day = '1'
      dayconfirm = 1
    }

    var mm = ('0' + month).slice(-2);
    var dd = ('0' + day).slice(-2); //January is 0!

    let dateRaw = dTemp.getFullYear() + '-' + mm + '-' + dd // yyyy-MM-dd 형태
    let dayType = 'Days'

    // dateRaw 들어오는 형식 => 2019-01-20T12:00:00+09:00
    let nationType = nugu.get('nation'); // 외국영화 한국영화 여부 (없으면 null ''  )
    let movieType = '' // 상업성여부
    console.log('nationType: ', nationType)
    console.log('month: ', month)
    console.log('day: ', day)

    movieSearch(dayType, dateRaw, nationType, movieType, dayconfirm)

  }

  function movieInfoLast_action() {
    let lastest = nugu.get('lastestlast')
    let dayType = 'Days'
    let dateRaw = ''
    console.log('lastest => ', lastest)
    /**
     * 이번주: W.0
     * 저번주: W.-1 형태로 출력
     */
    switch (lastest) {
      case 'W.0': //이번주
        dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 9);
        break
      case 'W.-1':
        dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 * 2 + 1000 * 60 * 60 * 9);
        break
      default:
        dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 9);
    }

    var dd = ('0' + dateRaw.getDate()).slice(-2);
    var mm = ('0' + (dateRaw.getMonth() + 1)).slice(-2); //January is 0!
    dateRaw = dateRaw.getFullYear() + '-' + mm + '-' + dd // yyyy-MM-dd 형태


    // dateRaw 들어오는 형식 => 2019-01-20T12:00:00+09:00
    let nationType = nugu.get('nationlast'); // 외국영화 한국영화 여부 (없으면 null ''  )
    let movieType = '' // 상업성여부
    console.log('nationType ', nationType)
    if(nationType == 'undefined' || nationType == null ) nationType = '' ;
    console.log('dateRaw: ', dateRaw)
    console.log('nationType: ', nationType)

    movieSearchLast(dayType, dateRaw, nationType, movieType)
  }


  /**
   * 영화 순위만 물으면 영화 정보 알려둠
   */
  function movieGradeInfo_action() {
    let month = nugu.get('monthgrade');
    let day = nugu.get('daygrade');
    let dateRaw = ''

    if (month == undefined || day == undefined) {
      dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 9);
    } else {
      let dTemp = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 9);
      var mm = ('0' + month).slice(-2);
      var dd = ('0' + day).slice(-2); //January is 0!
      dateRaw = new Date(dTemp.getFullYear() + '-' + mm + '-' + dd)
    }

    let lastest = nugu.get('lastestgrade');

    let dayType = 'Days'
    /**
     * 이번주: W.0
     * 저번주: W.-1 형태로 출력
     */
    console.log('month: ', month)
    console.log('day: ', day)
    console.log('lastest: ', lastest)
    if (lastest == undefined) {

    } else {
      switch (lastest) {
        case 'W.0': //이번주
          dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 9);
          break
        case 'W.-1':
          dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 * 2 + 1000 * 60 * 60 * 9);
          break
        default:
          dateRaw = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 9);
      }

    }

    let grade = parseInt(nugu.get('grade')); // 1~ 10등
    console.log('grade: ', grade)

    if (grade < 1 || grade > 10) {
      output.movieinfograde = '영화순위는 1위부터 10위까지만 가능합니다. ' + lastConv
      nugu.say(output)
      return;
    }

    let nationType = ''
    let movieType = '' // 상업성여부

    var dd = ('0' + dateRaw.getDate()).slice(-2);
    var mm = ('0' + (dateRaw.getMonth() + 1)).slice(-2); //January is 0!
    dateRaw = dateRaw.getFullYear() + '-' + mm + '-' + dd

    console.log('dateRaw: ', dateRaw)

    movieSearchForGrade(dayType, dateRaw, nationType, movieType, grade)

  }


  /**
   * 종료부분
   */
  function exit_action() {
    output.exit = '이용해 주셔서 감사합니다. ' + appTitle + '을 종료합니다.'
    nugu.say(output);
  }

  /**
   * 도움말 부분
   */
  function help_action() {
    const randomSay = randomField(
      appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 이번주 영화순위를 알려줘 라고 말해보세요. ',
      appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 저번주 영화순위를 알려줘 라고 말해보세요. ',
      appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 1월 3일 영화순위를 알려줘 라고 말해보세요. ',
      appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 8월 13일의 3등 영화를 알려줘 라고 말해보세요. ',
      appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 3월 13일 한국 영화순위를 알려줘 라고 말해보세요. ',
      appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 2월 28일 외국 영화순위를 알려줘 라고 말해보세요. '
    )

    output.support = randomSay;
    nugu.say(output);
  }


  //type name
  const MOVIEINFO = 'action.movieInfo';
  const MOVIEINFOLAST = 'action.movieInfoLast';
  const MOIVEGRADE_INFO = 'action.movieGradeInfo';

  const EXIT = 'action.exit'; //종료
  const HELP = 'action.help'; // 일반 인텐트

  console.log('ActionName: ', nugu.name())
  switch (nugu.name()) {
    case MOVIEINFO:
      movieInfo_action();
      break;

    case MOVIEINFOLAST:
      movieInfoLast_action();
      break;
    case MOIVEGRADE_INFO:
      movieGradeInfo_action();
      break;

    case EXIT:
      exit_action();
      break;
    case HELP:
      help_action();
      break;

  } //switch requests.type


} // END
