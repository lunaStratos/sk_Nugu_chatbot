let knex = require("../config/database");
let config = require("../config/googleApi");
const request = require('request'); // request

//request api section
function getDataRequest(insertData, callback) {

  //   POST /oauth2/v4/token HTTP/1.1
  // Host: www.googleapis.com
  // Content-Type: application/x-www-form-urlencoded
  //
  // client_id=<your_client_id>&
  // client_secret=<your_client_secret>&
  // refresh_token=<refresh_token>&
  // grant_type=refresh_token

  var url = 'https://www.googleapis.com/oauth2/v4/token'

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  var postVal = "grant_type=refresh_token" +
    "&refresh_token=" + insertData.refreshToken +
    "&client_id=" + config.clientId +
    "&client_secret=" + config.clientSecret

  var options = {
    url: url,
    headers: headers,
    body: postVal,
    method: 'POST',
  }

  request.post(options, function(err, bodyres, body) {
    if (err) {
      // Print out the response body
      res.render()
      return;
    }
    // {
    //   "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
    //   "expires_in": 3920,
    //   "token_type": "Bearer"
    // }
    console.log('body: ', body)
    const jsons = JSON.parse(body.toString())
    console.log('jsons.hasOwnProperty ', jsons.hasOwnProperty('access_token'))
    if (jsons.hasOwnProperty('access_token')) {
      console.log('jsons.access_token: ', jsons.access_token)

      const inserDateTime = new Date().getTime() + (jsons.expires_in * 1000)
      knex('Camelia_Users').where(
          'email', insertData.email
        )
        .update({
          googleAccessToken: jsons.access_token,
          googleTokenTime: inserDateTime
        }).then(result => {
          console.log('update result ', result)
        }).catch((err) => {
          console.log(err);
          throw err

        })
      callback(jsons.access_token)

    } else {
      callback(null, false)
    } // if

  }); // request


} // function

//email, refreshToken
module.exports = getDataRequest;
