'use strict';

const nuguApp = require('nugujs'); // nugujs 모듈 사용.
const randomField = require('randomize');
const request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
const Promise = require('promise');

exports.nugu_air = (req, res) => {
  const nugu = nuguApp(req, res); //request와 response를 넣어줌
  let output = {}; //parameter를 위한 output

  //앱 타이틀 (전역으로 사용)
  const appTitle = '인천공항 출국장'
  //마지막 마이크 오픈 방지
  const lastConv = randomField(
    '이제 하실말을 해 주세요.',
    '또 어떤것을 찾을까요.',
    '다음 명령을 말해주세요.'
  )


  let arrays = [{
    code: "터미널1게이트1", // 건드리지 말것
    name: "터미널1 게이트1",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-1.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널1의 게이트1 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널1게이트2",
    name: "터미널1 게이트2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-2.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널1의 게이트2 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널1게이트3",
    name: "터미널1 게이트3",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-3.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널1의 게이트3 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널1게이트4",
    name: "터미널1 게이트4",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-4.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널1의 게이트4 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널1게이트5",
    name: "터미널1 게이트5",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-5.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널1의 게이트5 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널1게이트6",
    name: "터미널1 게이트5",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-6.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널1의 게이트6 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널2게이트1",
    name: "터미널2 게이트1",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2-1.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널2의 게이트1 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널2게이트2",
    name: "터미널2 게이트2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2-2.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널2의 게이트2 대기인원과 혼잡도",
    etc: ''
  }, {
    code: "터미널2게이트3",
    name: "터미널2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널2",
    etc: '더미'
  }, {
    code: "터미널2게이트4",
    name: "터미널2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널2",
    etc: '더미'
  }, {
    code: "터미널2게이트5",
    name: "터미널2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널2",
    etc: '더미'
  }, {
    code: "터미널2게이트6",
    name: "터미널2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
    infoText: "게이트의 위치는 사진과 같습니다.",
    title: "터미널2",
    etc: '더미'
  }, {
    code: "제1터미널",
    name: "터미널1",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1.jpg",
    infoText: "터미널의 위치는 사진과 같습니다.",
    title: "터미널1",
    etc: ''
  }, {
    code: "제2터미널",
    name: "터미널2",
    imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
    infoText: "터미널의 위치는 사진과 같습니다.",
    title: "터미널2",
    etc: ''
  }];

  // getTerminalGateXmlConnect
  function getTerminalGateXmlConnect(code, gateNum, callback) {

    console.log("code: " + code);
    console.log("gateNum: " + gateNum);

    let insertTerminal = '';

    //터미널에 따른 링크 생성시 터미널 번호 붙임
    if (code == "제1터미널" || code == '') {
      insertTerminal = 1;
    } else {
      insertTerminal = 2;
    }
    var url = "http://openapi.airport.kr/openapi/service/StatusOfDepartures/getDeparturesCongestion?ServiceKey=h8JLcESwAVXzmfaef3OAz81CQZ1uW5S8fgY7Et46VPk2hAdlqCBHbHPskMq4wO9NDf32iV7yqiZSgnAjVWtP7g%3D%3D&terno=" + insertTerminal; //서비스키 입력
    console.log("terminal 1,2 : " + insertTerminal); //터미널
    console.log("url: " + url);

    // Get xml data
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
          name: '',
          status: 'fail'
        });
        return;
      }
      // xml parsing section
      let xml = body.toString();
      console.log("body: " + body.toString());
      parser.parseString(xml, function(err, result) {
          console.log(result);
          console.log(JSON.stringify(result));
          //       < SearchSTNInfoByFRCodeService >
          // <list_total_count>1</list_total_count>
          // <RESULT>
          // <CODE>INFO-000</CODE>
          // <MESSAGE>정상 처리되었습니다</MESSAGE>
          // </RESULT>
          var original = result.response.body[0].items[0].item[0];
          var status = result.response.header[0].resultCode[0];
          console.log("status: " + status);

          if (status === '00') { //00 에러없음

            //search arrays
            //미래 api를 위해서 검색시 다 가져오기
            let getValue = arrays.find(item => {
              return item.code == code;
            });

            console.log(JSON.stringify(getValue));
            //터미널1과 2의 정보는 다름으로 그냥 이렇게 처리
            //push로 처리할수 있지만 시각적으로 보기 위해서.
            if (insertTerminal == '1') {
              callback(null, {
                code: 200,
                gateinfo1: original.gateinfo1[0],
                gateinfo2: original.gateinfo2[0],
                gateinfo3: original.gateinfo3[0],
                gateinfo4: original.gateinfo4[0],
                status: 'success',
                cgtdt: original.cgtdt[0],
                cgthm: original.cgthm[0]
              });
            } else { //terminal2
              callback(null, {
                code: 200,
                gateinfo1: original.gateinfo1[0],
                gateinfo2: original.gateinfo2[0],
                status: 'success',
                cgtdt: original.cgtdt[0],
                cgthm: original.cgthm[0]
              });
            }
          } else {
            callback(err, {
              code: 400,
              name: '',
              status: 'fail'
            });
          }

        });
    });

  } //getStationXmlConnect

  const asyncTask = (stationName, gateNum) => new Promise(function(resolved, rejected) {
    getTerminalGateXmlConnect(stationName, gateNum, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });


  //promiseXmlConnect
  function promiseXmlConnect(stationName, gateNum) {
    return new Promise(function(resolved, rejected) {
      getTerminalGateXmlConnect(stationName, gateNum, function(err, result) {
        if (err) {
          rejected(err);
        } else {
          resolved(result);
        }
      });
    });
  } //promiseXmlConnect


  //=============================================================

  function airportGate_info() {
    const terminalName = nugu.get('terminalgate')
    const gateNum = nugu.get('gategate')

    console.log("terminalName : " + terminalName);
    console.log("gateNum : " + gateNum);

    //speech area
    let displayText = '';

    // 터미널과 게이트 넣기
    return asyncTask(terminalName, gateNum)
      .then(function(result) {

        console.log("result : " + JSON.stringify(result));

        if (result.code != 200) {
          displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + lastConv;
        } else { // no problem

          //gate terminal 1: 1~4 terminal2: 1~2
          let gateinfo1 = result.gateinfo1;
          let gateinfo2 = result.gateinfo2;
          let gateinfo3 = '';
          let gateinfo4 = '';

          let cgtdt = result.cgtdt; //date
          let cgthm = result.cgthm; // time: ex 2305

          //another data save
          let name = result.name;

          console.log("let result : " + result);
          console.log("let result stringify : " + JSON.stringify(result));

          if (terminalName === '제1터미널') {
            gateinfo3 = result.gateinfo3;
            gateinfo4 = result.gateinfo4;
          }

          if (terminalName === '제1터미널' && gateNum === '제2게이트') {
            displayText = '말씀하신 ' + name +', '+ gateNum + '의 대기인원은 \n' + gateinfo1 + '명 입니다. ' + lastConv;
          } else if (terminalName === '제1터미널' && gateNum === '제3게이트') {
            displayText = '말씀하신 ' + name +', '+ gateNum + '의 대기인원은 \n' + gateinfo1 + '명 입니다. '+ lastConv;
          } else if (terminalName === '제1터미널' && gateNum === '제4게이트') {
            displayText = '말씀하신 ' + name +', '+ gateNum + '의 대기인원은 \n' + gateinfo1 + '명 입니다. '+ lastConv;
          } else if (terminalName === '제1터미널' && gateNum === '제5게이트') {
            displayText = '말씀하신 ' + name +', '+ gateNum + '의 대기인원은 \n' + gateinfo1 + '명 입니다. '+ lastConv;
          } else if (terminalName === '제1터미널' && gateNum === '제1게이트') {
            displayText = '말씀하신 ' + name +', '+ gateNum + '의 대기인원은 \n' + gateinfo1 + '명 입니다. '+ lastConv;
          } else if (terminalName === '제1터미널' && gateNum === '제2게이트') {
            displayText = '말씀하신 ' + name +', '+ gateNum + '의 대기인원은 \n' + gateinfo1 + '명 입니다. '+ lastConv;
          }

          if (terminalName == '제1터미널' && (gateNum == '제1게이트' || gateNum == '제6게이트')) {
            displayText = '죄송합니다. 터미널1의 경우 ' + gateNum + '은 지원하지 않습니다. 현재 \n게이트2 : ' + gateinfo1 + '명 \n게이트3 : ' + gateinfo2 + '명 \n게이트4 : ' + gateinfo3 + '명 \n게이트5 : ' + gateinfo4 + '명 입니다. ' + lastConv;
          } else if (terminalName == '제2터미널' && (gateNum == '제3게이트' || gateNum == '제4게이트' || gateNum == '제5게이트' || gateNum == '제6게이트')) {
            displayText = '죄송합니다. 터미널2의 경우 ' + gateNum + '은 지원하지 않습니다. 현재 \n게이트1 : ' + gateinfo1 + '명 \n게이트2 : ' + gateinfo2 + '명 입니다. ' + lastConv;
          }

        } //if

        output.terminalgateresult = displayText
        console.log(displayText)
        nugu.say(output)

      });


  } //airportGate_info

  function airport_info() {
    const terminalName = nugu.get('terminal')
    let gateNum = "";
    console.log("terminalName data: " + terminalName);

    let displayText = '';

    return asyncTask(terminalName, gateNum)
      .then(function(result) {
        console.log("result : " + JSON.stringify(result));

        if (result.code != 200) {
          //문제있음
          displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + lastConv;

        } else { // no problem

          //gate terminal 1: 1~4 terminal2: 1~2
          let gateinfo1 = result.gateinfo1;
          let gateinfo2 = result.gateinfo2;
          let gateinfo3 = '';
          let gateinfo4 = '';

          let cgtdt = result.cgtdt; //date
          let cgthm = result.cgthm; // time: ex 2305

          //another data save
          let name = result.name;

          console.log("let result : " + result);
          console.log("let result stringify : " + JSON.stringify(result));

          //text make
          if (terminalName == '제1터미널' || terminalName == '') {
            gateinfo3 = result.gateinfo3;
            gateinfo4 = result.gateinfo4;
            displayText = name + '의 전체 대기인원은 \n게이트2 : ' + gateinfo1 + '명 \n게이트3 : ' + gateinfo2 + '명 \n게이트4 : ' + gateinfo3 + '명 \n게이트5 : ' + gateinfo4 + '명 입니다. ' + lastConv;

          } else {
            displayText = name + '의 전체 대기인원은 \n게이트1 : ' + gateinfo1 + '명 \n게이트2 : ' + gateinfo2 + '명 입니다. ' + lastConv;

          }
        } //if

        output.terminalresult = displayText
        nugu.say(output)

      });
  } //airport_info


  function airAllInfo_info(){
    const terminalName = '제1터미널'
    let gateNum = "";
    console.log("terminalName data: " + terminalName);

    let displayText = '';

    return asyncTask(terminalName, gateNum)
      .then(function(result) {
        console.log("result : " + JSON.stringify(result));

        if (result.code != 200) {
          //문제있음
          displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + lastConv;

        } else { // no problem

          //gate terminal 1: 1~4 terminal2: 1~2
          let gateinfo1 = result.gateinfo1;
          let gateinfo2 = result.gateinfo2;
          let gateinfo3 = '';
          let gateinfo4 = '';

          let cgtdt = result.cgtdt; //date
          let cgthm = result.cgthm; // time: ex 2305

          //another data save
          let name = result.name;

          console.log("let result : " + result);
          console.log("let result stringify : " + JSON.stringify(result));

          //text make
          if (terminalName == '제1터미널' || terminalName == '') {
            gateinfo3 = result.gateinfo3;
            gateinfo4 = result.gateinfo4;
            displayText = '터미널 이름을 말하지 않으셔서 터미널1을 알려드립니다. ' + name + '의 전체 대기인원은 \n게이트2 : ' + gateinfo1 + '명 \n게이트3 : ' + gateinfo2 + '명 \n게이트4 : ' + gateinfo3 + '명 \n게이트5 : ' + gateinfo4 + '명 입니다. ' + lastConv;

          } else {
            displayText = name + '의 전체 대기인원은 \n게이트1 : ' + gateinfo1 + '명 \n게이트2 : ' + gateinfo2 + '명 입니다. ' + lastConv;

          }
        } //if

        output.airallinforesult = displayText
        nugu.say(output)

      });


  }



  //=============================================================

  //type name
  const TERMINAL_INFO = 'action.airportinfo'
  const TERMINAL_GATE_INFO = 'action.airportgateinfo'
  const TERMINAL_ALLINFO = 'action.airallinfo'

  console.log('ActionName: ', nugu.name())

  switch (nugu.name()) {
    case TERMINAL_INFO:
      airport_info();
      break;
    case TERMINAL_GATE_INFO:
      airportGate_info();
      break;
      case TERMINAL_ALLINFO:
        airAllInfo_info();
        break;
  } //switch requests.type


} // END
