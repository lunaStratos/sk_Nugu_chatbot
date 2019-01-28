
## 누구 투데이명언 ##

**SK NUGU**용으로 개발된 챗봇입니다.
**Extension**과 **Google cloud의 Cloud 기능**으로 nodeJS를 이용해서 만들었습니다.
이 챗봇은 **nuguJS**라는 모듈을 이용하여 만들었기 때문에, json을 반환하는 부분이 없습니다.

## 설명 ##

이 챗봇은 **nugujs**라는 **npm**을 이용하여 만들었습니다.
기존의 [로또마스터](https://github.com/lunaStratos/sk_Nugu_chatbot/tree/master/nugu_lotto) 방식의 경우 **JSON**을 만들어서 사용해야 했지만, 이제는 **npm**에 아래처럼 사용하면 자동으로 **response** 에 **send**되어서 보내집니다.

    const nuguApp = require('nugujs');

**npm**을 부르는 부분입니다. 부르고 나서 request와 response를 아래처럼 넣어줍니다.

    const nugu = nuguApp(req, res);

이는 request의 값을 얻기 위해서와 response로 보낼때 두 값을 사용하기 때문입니다.

#### actionName 얻기 ###

	const actionName = nugu.name()
  //req.body.action.actionName 와 같습니다.

#### parameter의 value를 1개만 얻을때 ###

	const value1 = nugu.get("parameterName")

키 이름으로 지정된 "parameterName"의 **Value**가 나옵니다. 만약 값이 없다면 **undefined**가 나옵니다.

#### parameter와 value를 전체 다 얻을때 ####

	const values = nugu.getAll()
	//return {key1: value, key2: value, key3: value ... }

이 경우 **JSON**으로 return 값이 나옵니다.

#### accessToken을 얻을때 ####

	const accessToken = nugu.token()

이 경우 **JSON**으로 return 값이 나옵니다.

### parameter 텍스트 보낼때 ###

	let output = {}
	let value1 = "The Quick Brown Fox Jumps Over The Lazy Dog"
	output.value1 = value1
	nugu.say(output);

### parameter가 여러개일때 ###
만약 **parameter**가 여러개라면 다음과 같이 만듭니다.

    let output = {}
    let value1 = "Day before yesterday I saw a rabbit, and yesterday a deer,"
    let value2 = "and today, you"
    output.value1 = value1
    output.value2 = value2
    nugu.say(output);

**nuguJS**에 대한 자세한 사용법은 [GitHub](https://github.com/lunaStratos/nuguJS) 혹은 [nuguJS](https://www.npmjs.com/package/nugujs)에서 확인하시면 됩니다.
