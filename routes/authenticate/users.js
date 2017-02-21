
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

function User(name, email) {
	this.name = name;
	this.email = email;
	this.hash = '';
	this.salt = '';
}

User.prototype.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

User.prototype.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

User.prototype.setHash = function(hash){
	this.hash = hash;
}

User.prototype.setSalt = function(salt){
	this.salt = salt;
}

User.prototype.getHash = function(){
	return this.hash;
}

User.prototype.getSalt = function(){
	return this.salt;
}

User.prototype.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

module.exports = User;
