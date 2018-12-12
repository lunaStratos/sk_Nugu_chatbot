var express = require('express');
var router = express.Router();

const session = require('express-session');
var transporter = ('../config/mailConfig')

let secretObj = require("../config/jwt");
let randomCode = require("../jscode/authmail.js");
let checkCode = require("../jscode/checkForm.js");
let knex = require("../config/database");

router.use(session({
  secret: '1q2w3e4r',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
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
      result: 'emailError'
    })
  }
  if (checkPassword) {
    return res.render('./login/login.ejs', {
      result: 'passwordError'
    })
  }

  //SQL 넘어가기
  knex('Camelia_Users').where({
      email: email,
      password: password,
      confirm: 'Y'
    })
    .then(rows => {
      console.log(rows.length)
      if (rows.length == 0) { //실패
        return res.render("index.ejs", {
          result: 'noEmail'
        })
      } else { //성공
        req.session.email = email
        req.session.password = password
        return res.render("login/index.ejs", {
          result: true
        })
      }

    })
});

//로그인
router.get('/logout', function(req, res) {
  delete req.session.email; //세션 삭제
  delete req.session.password; //세션 삭제
  return res.render('index.ejs', {
    result: false
  })

});

//대쉬보드
router.get('/dashboard', function(req, res) {
  if (req.session.email == undefined) {
    return res.render('index.ejs')
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
        return res.render("/forgotPassword", {
          result: 'emailError'
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

        return res.render("login/index.ejs", {
          result: true
        })
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

  let flag = true
  if (checkEmail) {
    flag = false
  }
  if (checkPassword) {
    flag = false
  }
  if (checkSex) {
    flag = false
  }
  if (checkName) {
    flag = false
  }
  if (checkYear) {
    flag = false
  }
  if (checkLocation) {
    flag = false
  }

  if (flag == false) {
    return res.render('./login/login.ejs', {
      result: 'emailError'
    })
  }


  //인증코드 생성
  const authmailcode = randomCode(10000, 99999)

  //insert할 데이터 셋
  const insertValue = [{
    name: name,
    email: email,
    sex: sex,
    password: password,
    year: year,
    memo: '',
    registercode: authmailcode,
    confirm: 'N'
  }]

  knex('Camelia_Users').insert(insertValue).then(() => console.log("Users data inserted"))
    .then(function() {
      return res.render("index.ejs");
      console.log(true);
    })
    .catch((err) => {
      console.log(err);
      if (err) {
        return res.send('중복입니다.');
        return;
      } else {

        var mailOptions = {
          from: 'noreply.mailsenderaog@gmail.com',
          to: email,
          subject: '인증메일 입니다.',
          text: '<p>인증코드 : ' + authmailcode + '</p>' +
            "다음의 링크를 눌러서 인증을 완료하실수 있습니다. <a href='http://localhost:3000/registerAuth?email=" + email + "&code=" + authmailcode + "'>인증하기</a>"
        }

        //메일 보내기
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        return res.render("index.ejs");
      }
      throw err;


    })


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
        req.session.email = email
        req.session.password = password
        return res.render("login/index.ejs", {
          result: true
        })
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


module.exports = router;
