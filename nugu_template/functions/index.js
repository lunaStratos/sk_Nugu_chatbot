'use strict';

/**
 * [누구 템플레이트 설명]
 * 구글 cloud용으로 만들어진 단독 파일입니다.
 * exports.nugu_template 의 'nugu_template'는 설정된 이름에 맞추어서 바꾸어 주시면 됩니다.
 *
 * req.body는 SK nugu에서 들어오는 json입니다.
 */

exports.nugu_template = (req, res) => {
    const appTitle = '앱 타이틀'; // 앱 타이틀을 적어주세요
    const requestBody = req.body; //request의 body부분
    const parameters = requestBody.action.parameters; // 파라메터 부분
    const context = requestBody.action.context; //컨텍스트, OAuth연결시 토큰이 들어옵니다
    const actionName = requestBody.action.actionName; // action의 이름

    //디버그 용, actionName을 표시합니다
    console.log(`request: ${JSON.stringify(actionName)}`);

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
      jsonReturn.output = jsons;
      return jsonReturn;
    }


    /**
     * [answername 설명]
     * @answername : json으로 보낼 파라메터 이름을 지정합니다.
     * 여기서는 answername으로 합니다.
     */
    // intent
    function action_intent(httpRes) {
      let speechText = '';
      let output = {};

      output.answername = speechText;
      return res.send(makeJson(output));
    } //function

    //액션 선언 모음, 여기서 액션을 선언해 줍니다.
    const ACTION_TEMPLATE = 'ACTION.template';

    // Intent가 오는 부분, actionName으로 구분합니다.
    switch (actionName) {
      // 최초 실행시 오는 intent. LaunchRequest만 쓴다.
      case ACTION_TEMPLATE:
        return action_intent(res)
        //INTENT_REQUEST의 경우 하위 function에서 switch로 intent를 처리합니다.

    }
