var passport = require('passport');
var User = require('./users');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.login = function(req, res) {

  if(!req.body.email || !req.body.password) {
     sendJSONresponse(res, 400, {
       "message": "All fields required"
     });
     return;
  }

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
		console.log(err);
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
		console.log(info);
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};