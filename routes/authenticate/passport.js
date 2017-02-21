var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./users');
var oracledb = require('oracledb'); 
var dbutil = require('../dbutil'); 

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
	  
	  dbutil.executeDatabaseOperation(function(error) {
		  return done(err);
	  }, function(connection) {
		  var selectStatement = "SELECT NAME, EMAIL, HASH, SALT FROM USERS WHERE EMAIL= :userEmail";
		  connection.execute(   selectStatement   
			, [username], {outFormat: oracledb.OBJECT // Return the result as Object
			}, function (err, result) {
				if (err) {
				  console.log('Error in execution of select statement'+err.message);
				  return done(err);  
				} else {
				   console.log('db response is ready '+result.rows);
				   if(result.rows.length === 0) {
					   return done(null, false, {
						  message: 'User not found'
					   });
				   }
				   dbutil.doRelease(connection);
				   
				   var user = new User(result.rows[0].NAME, result.rows[0].EMAIL);	
				   user.setHash(result.rows[0].HASH);
				   user.setSalt(result.rows[0].SALT);
					// Return if password is wrong
				   if (!user.validPassword(password)) {
					return done(null, false, {
					  message: 'Password is wrong'
					});
				   }
				   // If credentials are correct, return the user object
				   return done(null, user);
				}				
			  }
		  );
	  });	
  }
));