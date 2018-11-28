var express = require('express');
var randtoken = require('rand-token');

let jwt = require("jsonwebtoken");
var request = require('request');
const session = require('express-session');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy
var cookieparser = require('cookie-parser');
// store session state in browser cookie

let checkCode = require("../jscode/checkForm.js");

var router = express.Router();
router.use(cookieparser('asd'));
router.use(session({
  secret: '1q2w3e4r',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 120000
  }
}));

let secretObj = require("../config/jwt");
let config = require("../config/googleApi");
var oauth = require('../jscode/oauth.js');
let knex = require("../config/database");

var GOOGLE_CLIENT_ID = config.clientId;
var GOOGLE_CLIENT_SECRET = config.clientSecret;
var REDIRECT_URI = config.redirect_uri;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: REDIRECT_URI,
}, function(accessToken, refreshToken, profile, done) {
  console.log(accessToken);
  console.log(refreshToken);
  console.log(profile.emails[0].value);
  const googleTime = new Date().getTime() + 3600 * 1000
  knex('Camelia_Users').where('email', profile.emails[0].value).update({
      googleAccessToken: accessToken,
      googleAccessTokenRefresh: refreshToken,
      googleTokenTime: googleTime
    })
    .catch((err) => {
      console.log(err);
      throw err
      return res.render('/login/oauthlogin.ejs', {
        result: 'mismatch'
      })
    })


  process.nextTick(function() {
    user = profile.emails[0].value;
    return done(null, user);
  });
}));

router.use(passport.initialize())
router.use(passport.session())


// oauth/login GET페이지
router.get('/login', function(req, res) {
  console.log(req.headers);
  console.log(req.query.redirect_uri);
  console.log(req.query.state);
  req.session.state = req.query.state
  return res.render('login/oauthlogin.ejs')
});

// oauth/login
router.post('/login', function(req, res) {
  console.log('login')
  const email = (req.body.email).toLowerCase();
  const password = req.body.password;
  console.log('password ', password)
  console.log('email ', email)
  console.log('state ', req.session.state)
  //true 나오면 return
  let checkEmail = checkCode.checkEmail(email)
  let checkPassword = checkCode.checkPassword(password)
  if (checkEmail) {
    return res.render('./login/oauthlogin.ejs', {
      result: 'email'
    })
  }
  if (checkPassword) {
    return res.render('./login/oauthlogin.ejs', {
      result: 'password'
    })
  }

  knex('Camelia_Users').where({
    email: email,
    confirm: 'Y'
  }).update('memo', req.session.state).then(rows => {
    console.log(rows)
  })

  knex('Camelia_Users').where({
      email: email,
      password: password,
      confirm: 'Y'
    })
    .then(rows => {
      console.log(rows.length)
      if (rows.length == 0) { //로그인 실패
        return res.render("./login/oauthlogin.ejs", {
          result: 'login',
        })
      } else {
        console.log('로그인된 아이디: ', rows[0].email)
        res.redirect('/oauth/google')
      }
    })
});

//https://www.googleapis.com/auth/fitness.location.read : 이동한 거리 읽기
router.get('/google', passport.authenticate('google', {
  scope: ['email', 'https://www.googleapis.com/auth/fitness.blood_pressure.read', 'https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.body.read', 'https://www.googleapis.com/auth/fitness.location.read'],
  accessType: 'offline',
  prompt: 'consent'
}));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    console.log(req.session.passport.user)
    let token = oauth.signToken(req.session.passport.user);
    knex('Camelia_Users').where(
        'email', req.session.passport.user)
      .update({
        token: token
      })
      .catch((err) => {
        console.log(err);
        throw err
      })

    knex('Camelia_Users').where(
        'email', req.session.passport.user).then(rows => {

        var url = 'https://developers.nugu.co.kr/app/callback.html'
        console.log(url)
        console.log(rows[0].memo)
        console.log(encodeURIComponent(rows[0].memo))

        var headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        var geturl = url + "?code=" + token +
          "&state=" +
          //rows[0].memo
          encodeURIComponent(rows[0].memo)

        res.setHeader('content-type', 'application/x-www-form-urlencoded');
        res.redirect(geturl)

        // res.writeHead(302, {
        //   'Content-type': 'application/x-www-form-urlencoded',
        //   'Location': geturl
        // });
        // res.end()


        // request(options, function(err, bodyres, body) {
        //   if (!err && bodyres.statusCode == 200) {
        //     // Print out the response body
        //     const jsons = JSON.parse(body.toString())
        //     console.log(body)
        //     res.json(body)
        //   } else {
        //     console.log('body', body)
        //     console.log('err', err);
        //     res.send(body)
        //   }
        //
        // });
      })
      .catch((err) => {
        console.log(err);
        throw err
      })


  });


// oauth/token => 인증코드 들어오면 accessToken 내보냄
router.post('/token', function(req, res) {
  console.log('oauth token')
  console.log(req.headers)
  console.log(req.body)
  let authHeader = req.body.code;
  const client_secret = req.body.client_secret;
  const client_id = req.body.client_id;

  console.log('authHeader ', authHeader);
  console.log('client_secret ', client_secret);

  console.log('client_id ', client_id);

  // 인증으로 사용해야 할 값이 없다면 Deny
  if (client_id !== secretObj.client_id) {
    return res.json({
      error: 'invalid_client',
      description: 'Client id does not match.'
    });
  }
  // 인증으로 사용해야 할 값이 없다면 Deny
  if (client_secret !== secretObj.client_secret) {
    return res.json({
      error: 'unauthorized_client',
      description: 'Client secret does not match.'
    });
  }
  // 인증으로 사용해야 할 값이 없다면 Deny
  if (typeof authHeader == 'undefined') {
    return res.json({
      error: 'invalid_request',
      description: 'Need authHeader'
    });
  }

  // if (authHeader.startsWith('Bearer ')) {
  //   // Remove Bearer from string
  //    authHeader = authHeader.slice(7, authHeader.length);
  // }

  try {
    var decoded = jwt.verify(authHeader, secretObj.client_secret);
    console.log('decoded: ', decoded)
  } catch (e) {
    return res.json({
      error: 'unauthorized_client',
      description: 'JWT Code does not have Authorization.'
    });
  }

  if (!decoded || decoded.auth !== 'camelia') { //확인
    return res.json({
      error: 'unauthorized_client',
      description: 'JWT Code does not have Authorization.'
    });
  } else { // 정상실행

    const email = decoded.email;
    console.log(decoded) //


    knex('Camelia_Users')
      .where('email', email.toLowerCase())
      .then(rows => {

        if (rows.length == 0) { //실패
          return res.json({
            error: 'unauthorized_client',
            description: 'Your Google Email does not have Camelia Project Site. Please sign in site. '
          });

        } else {
          const inserData = {
            email: email,
            sex: rows[0].sex,
            location: rows[0].location,
            year: rows[0].year,
            name: rows[0].name
          }

          const emailBase64 = Buffer.from(JSON.stringify(inserData)).toString('base64')
          const accessToken = randtoken.uid(32) + '//' + emailBase64;
          knex('Camelia_Users')
            .where('email', email)
            .update({
              accessToken: accessToken
            })

          return res.json({
            access_token: accessToken,
            token_type: "bearer",
            expires: 9999999
          })

        }

      })

  } //  (!decoded || decoded.auth !== 'camelia

});

// oauth/login
router.post('/request', function(req, res) {
  console.log('request')
  console.log(req.query)

  const token = req.query.token
  console.log('token ', token)

  if (typeof token == 'undefined') {
    return res.json({
      error: 'error'
    });
  }

  knex('Camelia_Users').where({
      accessToken: token
    })
    .then(rows => {
      console.log(rows.length)
      if (rows.length == 0) { //실패시
        return res.json({
          error: 'error'
        });
      } else {
        //나이 성별 이메일 이름
        return res.json({
          email: rows[0].email,
          name: rows[0].name,
          age: rows[0].age,
          sex: rows[0].sex
        })
      }

    })
});

module.exports = router;
