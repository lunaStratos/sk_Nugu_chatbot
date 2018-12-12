var express = require('express');

var router = express.Router();

const session = require('express-session');
var fs = require("fs");
var ejs = require("ejs");

var transporter = require("../config/emailConfig");
let secretObj = require("../config/jwt");
let randomCode = require("../jscode/authmail.js");
let checkCode = require("../jscode/checkForm.js");
let knex = require("../config/database");
var refreshToken = require("../jscode/refreshToken"); // Refresh토큰 실행기
let moduleRequest = require("../jscode/moduleRequest");

router.use(session({
  key: 'sid',
  secret: '1q2w3e4r',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));

router.use(function(req, res, next) {
  res.locals.email = req.session.email;
  next();
});


//home
router.get('/', function(req, res) {
  return res.render('index.ejs')

});

//로그인
router.get('/login', function(req, res) {
  if (req.session.email == undefined) {
    return res.render('./login/login.ejs')
  } else {
    return res.render('./login/index.ejs', {
      email: req.session.email
    })
  }

});


//목표걸음 설정
router.get('/walkgoal', function(req, res) {
  console.log('goalwalk')
  if (req.session.email == undefined) {
    return res.render('./login/login.ejs')
  } else {
    knex.select('walkgoal','walkgoalSwitch').from('Camelia_Users').where({
        email: req.session.email,
      })
      .then(rows => {
        if (rows.length == 0) { //실패
        } else {
          console.log(rows[0])

          return res.render('./login/walkgoal.ejs', {
            walkgoal: rows[0].walkgoal,
            walkgoalSwitch: rows[0].walkgoalSwitch
          })
        }
      }); //then

  }

});

//목표걸음 설정
router.post('/walkgoal', function(req, res) {
  console.log(req.body.walkgoalSwitch)
  console.log(req.body.walkgoal)
  if (req.session.email == undefined) {
    return res.render('./login/login.ejs')
  } else {
    knex('Camelia_Users').where({
      email: req.session.email,
    }).update({
      walkgoal: req.body.walkgoal,
      walkgoalSwitch: req.body.walkgoalSwitch
    }).then(result =>{
      return res.redirect("/dashboard")
    })


  }

});


//로그인 email
router.post('/checkemail', function(req, res) {
  console.log('checkemail')

  const email = (req.body.email).toLowerCase();
  //SQL 넘어가기
  knex.select('email').from('Camelia_Users').where({
      email: email,
    })
    .then(rows => {
      console.log('checkemail: ', rows.length)
      if (rows.length == 0) { //성공
        res.send({
          result: true
        }); //ajax
      } else { //실패
        res.send({
          result: false
        }); //ajax

      }
    }); //then


});


// 일반 로그인 post
router.post('/login', function(req, res) {
  console.log('login')
  const email = (req.body.email).toLowerCase();
  const password = req.body.password;
  console.log('password ', password)
  console.log('email ', email)

  //true 나오면 return
  let checkEmail = checkCode.checkEmail(email)
  let checkPassword = checkCode.checkPassword(password)
  if (checkEmail) {
    return res.render('./login/login.ejs', {
      result: 'email'
    })
  }
  if (checkPassword) {
    return res.render('./login/login.ejs', {
      result: 'password'
    })
  }

  //SQL 넘어가기
  knex('Camelia_Users').where({
      email: email,
      password: password,
      confirm: 'Y',
    })
    .then(rows => {
      console.log(rows.length)
      if (rows.length == 0) { //실패
        return res.render("login/login.ejs", {
          result: 'login'
        })
      } else { //성공
        req.session.email = email
        req.session.password = password
        return res.redirect("/dashboard")
      }

    }); //then
});

//로그인
router.get('/logout', function(req, res) {
  console.log('logout')
  req.session.destroy(function() {
    req.session
  });
  res.clearCookie('sid'); // 세션 쿠키 삭제

  return res.render('index.ejs')

});

//목표걸음 설정
router.get('/goalwalk', function(req, res) {
  console.log('goalwalk')


});


//구글 토큰 얻기
const googleTokenSQL = (insertJson) => new Promise(function(resolved, rejected) {
  knex('Camelia_Users').select('googleAccessToken').where('email', insertJson)
    .then(rows => {
      resolved(rows[0]) //　[0]　없이 사용가능
    })
})



const refreshToken_action = (emailToken) => function(callback) {
  knex('Camelia_Users').where('email', emailToken).then(rows => {
    const googleAccessTokenRefresh = rows[0].googleAccessTokenRefresh;
    var insertData = {
      refreshToken: googleAccessTokenRefresh,
      email: emailToken
    }
    //토큰 타임 비교해서 googleTokenTime이 크면 갱신하지 않는다.
    console.log('rows[0].googleTokenTime ', rows[0].googleTokenTime)
    if (rows[0].googleTokenTime == null) {
      callback(null, false)
    } else {
      // 갱신을 안하면 기존 DB에서 읽어서 처리
      if (rows[0].googleTokenTime > (new Date().getTime())) {
        console.log('rows[0].googleTokenTime : 갱신안함')
        knex('Camelia_Users').select('googleAccessToken').where('email', emailToken)
          .then(rows => {
            console.log('googleTokenSQL ', rows[0])
            callback(null, rows[0].googleAccessToken)
          })
        // 갱신시 request 해서 callback 처리된 데이터 가져오기
      } else {
        console.log('rows[0].googleTokenTime : 갱신함')
        refreshToken(insertData, function(token) {
          console.log('token : ', token)
          callback(null, token)
        })

      }
    }

  })
}

let async = require("async");
//대쉬보드
router.get('/dashboard', async function(req, res) {

  if (req.session.email == undefined) {
    return res.render('index.ejs')
  }

  async.waterfall([refreshToken_action(req.session.email)], async function(err, result) {
    if (req.session.email == undefined || result == undefined) {
      return res.render('index.ejs')
    } else {

      const todayD = new Date(new Date().getTime() + 32400000); /// 32400000
      const todayDate = (todayD.getFullYear()) + ('0' + (todayD.getMonth() + 1)).slice(-2) + '' + ('0' + (todayD.getDate())).slice(-2)
      var yesterD = new Date(new Date().getTime() - 2592000000 + 32400000) // 32400000
      yesterD.setHours(0, 0, 1); //어제날짜 0시 1분 1초
      const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)

      const insertData = {
        startTime: yesterD.getTime(),
        endTime: todayD.getTime(),
        accessToken: result
      }

      const fitness = await moduleRequest(insertData, 'fitness')
      const distance = await moduleRequest(insertData, 'distance')
      console.log(fitness)
      if (fitness.code != 200 || distance.code != 200) {
        return res.render('login/index.ejs', {
          result: false
        })
      } else {

        let fitnessList = fitness.list
        let distanceList = distance.list

        let avgWalk30days = 0
        let avgWalk30daysDistance = 0

        //1달 치라 한번 돌린다.
        for (let i = 0; i < fitnessList.length; i++) {
          avgWalk30days += fitnessList[i].walkCount
          avgWalk30daysDistance += distanceList[i].distance
          fitnessList[i].distance = distanceList[i].distance
          fitnessList[i].cal = parseInt(Number(fitnessList[i].walkCount) / 30)
        }

        avgWalk30days = Math.round(avgWalk30days / 30) //1주일치를 평균으로
        avgWalk30daysDistance = parseInt(avgWalk30daysDistance) / 1000
        console.log(fitnessList)
        return res.render('login/index.ejs', {
          result: true,
          fitnessList: fitnessList,
          distanceList: distanceList
        })
      }


    }

  });
});

router.get('/forgotPassword', function(req, res) {
  if (req.session.email == undefined) {
    return res.render('login/forgot-password.ejs')
  } else {
    return res.render('login/index.ejs', {
      email: req.session.email
    })

  }
});



// 암호 잊어먹었을때
router.post('/forgotPassword', function(req, res) {
  console.log('forgotPassword')
  const email = (req.body.email).toLowerCase();
  const name = req.body.name;
  console.log('email ', email)
  console.log('name ', name)

  //true 나오면 return
  let checkEmail = checkCode.checkEmail(email)
  let checkName = checkCode.checkName(name)
  if (checkEmail) {
    return res.render('./login/login.ejs', {
      result: 'emailError'
    })
  }
  if (checkName) {
    return res.render('./login/login.ejs', {
      result: 'nameError'
    })
  }

  knex('Camelia_Users').where({
      email: email,
      name: name
    })
    .then(rows => {
      console.log(rows.length)
      if (rows.length == 0) { //로그인 성공
        return res.render('login/forgot-password.ejs', {
          result: 'error'
        })
      } else {

        var mailOptions = {
          from: 'noreply.mailsenderaog@gmail.com',
          to: email,
          subject: '암호입니다.',
          text: rows[0].password
        };

        //메일 보내기
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        return res.render("./index.ejs")
      }

    })

});

//회원가입 GET
router.get('/register', function(req, res) {
  return res.render('login/register.html')
});

// 회원가입 POST
router.post('/register', function(req, res) {
  console.log('register')

  const name = req.body.name;
  const email = (req.body.email).toLowerCase();
  const year = req.body.year;
  const sex = req.body.sex;
  const password = req.body.password;
  const location = req.body.location;

  console.log('name ', name)
  console.log('email ', email)
  console.log('year ', year)
  console.log('sex ', sex)
  console.log('password ', password)
  console.log('location ', location)

  //true 나오면 return
  let checkEmail = checkCode.checkEmail(email)
  let checkPassword = checkCode.checkPassword(password)
  let checkSex = checkCode.checkSex(sex)
  let checkName = checkCode.checkName(name)
  let checkYear = checkCode.checkYear(year)
  let checkLocation = checkCode.checkLocation(year)

  console.log('checkLocation ', checkLocation)
  let flag = false
  flag = checkEmail
  flag = checkPassword
  flag = checkSex
  flag = checkName
  flag = checkYear

  if (flag == true) {
    return res.render('./login/login.ejs', {
      result: 'emailError'
    })
  } else {
    const authmailcode = randomCode(10000, 99999)
    //insert할 데이터 셋
    const insertValue = [{
      name: name,
      email: email,
      sex: sex,
      password: password,
      year: year,
      location: location,
      memo: '',
      registercode: authmailcode, //인증코드 생성
      confirm: 'N',
      walkgoal : 5000,
      walkgoalSwitch: 'off'
    }]

    knex('Camelia_Users').insert(insertValue).then(() => console.log("Users data inserted"))
      .then(function() {

        ejs.renderFile("./camelia_web/email/emailForm.ejs", {
          email: email,
          authmailcode: authmailcode

        }, function(err, data) {
          if (err) {
            console.log(err);
          } else {
            transporter.sendMail({
              from: 'noreply.mailsenderaog@gmail.com',
              to: email,
              subject: '건강마스터 인증메일 입니다.',
              html: data
            }, (err, info) => {
              console.log(info.envelope);
              console.log(info.messageId);
            });
          }

        });

        return res.render("login/login.ejs", {
          result: 'wait'
        });
      })
      .catch((err) => {
        console.log(err);
        if (err) {
          return res.render("login/login.ejs", {
            result: 'duplication'
          });
          return;
        } else {


        }
        throw err;


      })

  }



});


//회원 계정 수정
router.get('/modify', function(req, res) {
  if (req.session.email == undefined) {
    return res.render('login/register.html')
  } else {
    knex('Camelia_Users').where({
      email: req.session.email
    }).then((rows) => {
      return res.render('login/modifyAccount.ejs', {
        email: rows[0].email,
        name: rows[0].name,
        location: rows[0].location,
        year: rows[0].year
      })
    })

  }
});

//회원 계정 수정
router.post('/modify', function(req, res) {
  if (req.session.email == undefined) {
    return res.render('login/register.html')
  } else {

    const password = req.body.password
    const location = req.body.location
    const year = req.body.year
    const name = req.body.name

    console.log('name ', name)
    console.log('year ', year)
    console.log('password ', password)
    console.log('location ', location)

    //true 나오면 return
    let checkPassword = checkCode.checkPassword(password)
    let checkName = checkCode.checkName(name)
    let checkYear = checkCode.checkYear(year)

    let flag = false
    flag = checkPassword
    flag = checkName
    flag = checkYear

    if (flag == true) {
      return res.render('./login/modifyAccount.ejs', {
        result: 'email'
      })
    }


    knex('Camelia_Users').where({
        email: req.session.email
      }).update({
        password: password,
        location: location,
        year: year,
        name: name
      }).returning('email')
      .then((rows) => {

        if (rows > 0) {
          req.session.destroy() // 재로그인
          return res.render('index.ejs', {
            result: 'modify'
          })
        } else {
          req.session.memo
          return res.render('index.ejs', {
            result: 'modifyfail'
          })
        }

      })

  }
});

//회원가입
router.get('/register', function(req, res) {
  return res.render('login/register.html')

});

// 회원가입 post
router.get('/registerAuth', function(req, res) {
  console.log('registerAuth')

  const email = (req.query.email).toLowerCase();
  const registercode = req.query.code;

  if (typeof email === 'undefined' || typeof registercode === 'undefined') {
    return res.render('/')
  }

  console.log('registercode ', registercode)

  // 찾아서 데이터 Y로 변경
  knex('Camelia_Users').where({
      email: email,
      registercode: registercode,
      confirm: 'N'
    }).update('confirm', 'Y') //confirm => Y
    .returning('email')
    .then(function(result) {
      //있으면 세션에 데이터 넣고 로그인
      if (result.length == 0) { // 데이터 없으면 실패
        return res.render("index.ejs", {
          result: false
        })
      } else {
        console.log(result)
        req.session.email = email
        return res.render("login/ok.html")
      }

    })
    .catch((err) => {
      console.log(err);
      if (err) {
        return res.render("index.ejs", {
          result: false
        })
      } else {
        return res.render("index.ejs");
      }
      throw err;

    })


});




//Account Link 설명
router.get('/accountLink', function(req, res) {
  console.log('accountLink')
  res.render('accountLink.html')
});

//계정 삭제
router.get('/setting', function(req, res) {
  console.log('deleteAccount')
  if (req.session.email) {
    return res.render('./login/setting.ejs')
  } else {
    return res.render('/')
  }

});

//계정 삭제
router.post('/deleteAccount', function(req, res) {
  const email = req.session.email
  const password = req.body.password;
  console.log(email)
  console.log(password)
  knex('Camelia_Users').where({
      email: email,
      password: password
    })
    .del().then((rows) => {
      console.log('rows: ', rows)
      if (rows == 0) {
        return res.render('./login/setting.ejs', {
          result: 'fail'
        })
      } else {
        req.session.destroy() //섹션 삭제
        return res.render('index.ejs', {
          result: 'deleteAccount'
        })
      }

    })
    .catch((err) => {
      console.log(err);
      if (err) {
        return res.render('./login/setting.ejs', {
          result: 'fail'
        })
      } else {
        req.session.destroy() //섹션 삭제
        return res.render('index.ejs', {
          result: 'deleteAccount'
        })

      }
      throw err;

    })


});


//'N인 계정 삭제'
router.get('/deleteaccount', function(req, res) {
  knex('Camelia_Users').where({
      confirm: 'N'
    })
    .del().then((rows) => {
      console.log('rows: ', rows)
      return res.render('index.ejs')
    })
    .catch((err) => {
      console.log(err);
      throw err;
    })


});

//시간 테스트
router.get('/nowTime', function(req, res) {
  //오늘
  const todayD = new Date(new Date().getTime() + 32400000);
  const todayDate = (todayD.getFullYear()) + ('0' + (todayD.getMonth() + 1)).slice(-2) + '' + ('0' + (todayD.getDate())).slice(-2)
  //어제
  const yesterD = new Date((new Date().getTime() + 32400000 - 86400000))
  yesterD.setHours(0, 1, 1); //어제날짜 0시 1분 1초
  const yesterDate = yesterD.getFullYear() + '' + ('0' + (yesterD.getMonth() + 1)).slice(-2) + '' + ('0' + (yesterD.getDate())).slice(-2)

  let startTime = new Date(new Date().getTime() - 604800000 + 32400000)
  startTime.setHours(0, 1, 1); // 0시 1분 1초
  startTime = startTime.getTime()

  let startTimeDate = new Date(startTime).getFullYear() + '' + (new Date(startTime).getMonth() + 1) + '' + new Date(startTime).getDate()

  let endTime = new Date().getTime() + 32400000
  let endTimeDate = new Date(endTime).getFullYear() + '' + (new Date(endTime).getMonth() + 1) + '' + new Date(endTime).getDate()

  var startTimem = new Date(new Date().getTime() - 2592000000 + 32400000)
  startTimem.setHours(0, 1, 1); //0시 1분 1분
  startTimem = startTimem.getTime()

  var startTimeDatem = new Date(startTimem).getFullYear() + '' + (new Date(startTimem).getMonth() + 1) + '' + new Date(startTimem).getDate()
  var endTimem = new Date().getTime() + 32400000
  var endTimeDatem = new Date(endTimem).getFullYear() + '' + (new Date(endTimem).getMonth() + 1) + '' + new Date(endTimem).getDate()


  res.json({
    todayD: todayD,
    todayDate: todayDate,
    yesterD: yesterD,
    yesterDate: yesterDate,
    startTime: startTime,
    endTime: endTime,
    startTimem: startTimem,
    startTimeDatem: startTimeDatem,
    endTimem: endTimem,
    endTimeDatem: endTimeDatem
  })
});



module.exports = router;
