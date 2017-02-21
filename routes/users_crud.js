
var oracledb = require('oracledb'); 
var dbutil = require('./dbutil'); 
var User = require('./authenticate/users');

module.exports = {

	deleteUser: function (request, response, userEmail) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
		  
		  var deleteStatement = "DELETE FROM USERS WHERE EMAIL = :userEmail";
		  connection.execute(deleteStatement, [userEmail], 
				{outFormat: oracledb.OBJECT // Return the result as Object
				}, function (err, result) {
					if (err) {
					  console.log('Error in execution of delete statement'+err.message);
					  response.writeHead(500, {'Content-Type': 'application/json'});
					  response.end(JSON.stringify({
						status: 500,
							message: "Error deleting the user : " + userEmail,
							detailed_message: err.message
					   })
					  );  
					} else {
						console.log("Delete User result:" + JSON.stringify(result));
						connection.commit(function(error){
							if(error) {
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end(JSON.stringify("error in commit"));
							} else {
								console.log('db response is ready ');
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end(JSON.stringify({operation :"successful", result : result}));
							}
						});		       
					}
					dbutil.doRelease(connection);
			  }
		  );
		});
	}, //deleteUser

	updateUser: function(request, response) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
		  
		  var email = request.body.email;
		  var name = request.body.name;
		  var grade = request.body.grade;
		  var lease_budget = request.body.lease_budget;
		  var password = request.body.password;
		  
		  var updateBindVariables = [];
		  
		  var updateStatement = "UPDATE USERS SET ";
		  if(name) {
			  updateStatement = updateStatement + " NAME = :name";
			  updateBindVariables.push(name);
		  }
		  if(grade) {
			  if(name) {
				  updateStatement = updateStatement + ",";
			  }
			  updateStatement = updateStatement + " GRADE = :grade";
			  updateBindVariables.push(grade);
		  }
		  if(lease_budget) {
			  if(grade || name) {
				  updateStatement = updateStatement + ",";
			  }
			  updateStatement = updateStatement + " LEASE_BUDGET = :lease_budget";
			  updateBindVariables.push(lease_budget);
		  }
		  if(password) {
			  if(lease_budget || grade || name) {
				  updateStatement = updateStatement + ",";
			  }
			  var user = new User(name, email);
			  user.setPassword(request.body.password);
			  updateStatement = updateStatement + " HASH = :hash, SALT = :salt";
			  updateBindVariables.push(user.getHash());
			  updateBindVariables.push(user.getSalt());
		  }
		  
		  updateStatement = updateStatement + " WHERE EMAIL = :email";
		  updateBindVariables.push(email);
		  console.log(updateStatement);
		  connection.execute(updateStatement, updateBindVariables, 
				{outFormat: oracledb.OBJECT // Return the result as Object
				}, function (err, result) {
					if (err) {
					  console.log('Error in execution of update statement'+err.message);
					  response.writeHead(500, {'Content-Type': 'application/json'});
					  response.end(JSON.stringify({
						status: 500,
							message: "Error updating the user : " + email,
							detailed_message: err.message
					   })
					  );  
					} else {
						console.log("Update User result :" + JSON.stringify(result));
						connection.commit(function(error){
							if(error) {
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end(JSON.stringify("error in commit"));
							} else {
								console.log('db response is ready ');
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end(JSON.stringify({operation :"successful", result : result}));
							}
						});		       
					}
					dbutil.doRelease(connection);
			  }
		  );
		});
	}, //updateUser

	addUser: function(request, response) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
		  
		  var email = request.body.email;
		  var name = request.body.name;
		  var grade = request.body.grade;
		  var lease_budget = request.body.lease_budget;
		  var user = new User(name, email);
		  user.setPassword(request.body.password);
		  
		  var insertStatement = "INSERT INTO USERS (NAME, EMAIL, GRADE, LEASE_BUDGET, HASH, SALT) VALUES (:name, :email, :grade, :lease_budget, :hash, :salt)";
		  connection.execute(insertStatement, [name, email, grade, lease_budget, user.getHash(), user.getSalt()], 
				{outFormat: oracledb.OBJECT // Return the result as Object
				}, function (err, result) {
					if (err) {
					  console.log('Error in execution of insert statement'+err.message);
					  response.writeHead(500, {'Content-Type': 'application/json'});
					  response.end(JSON.stringify({
						status: 500,
							message: "Error adding the user : " + name,
							detailed_message: err.message
					   })
					  );  
					} else {
						console.log("Add User results :" + JSON.stringify(result));
						connection.commit(function(error){
							if(error) {
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end(JSON.stringify("error in commit"));
							} else {
								console.log('db response is ready ');
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end(JSON.stringify({operation :"successful", result : result}));
							}
						});		       
					}
					dbutil.doRelease(connection);
			  }
		  );
		});
	}, //addUser

	getUser: function(request, response, userEmail) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
		  
		  var selectStatement = "SELECT NAME, EMAIL, GRADE, LEASE_BUDGET FROM USERS WHERE EMAIL= :userEmail";
		  connection.execute(   selectStatement   
			, [userEmail], {outFormat: oracledb.OBJECT // Return the result as Object
			}, function (err, result) {
				if (err) {
				  console.log('Error in execution of select statement'+err.message);
				  response.writeHead(500, {'Content-Type': 'application/json'});
				  response.end(JSON.stringify({
					status: 500,
						message: "Error getting the user",
						detailed_message: err.message
				   })
				  );  
				} else {
				   console.log('db response is ready '+result.rows);
				   response.writeHead(200, {'Content-Type': 'application/json'});
				   response.end(JSON.stringify(result.rows));
				  }
				dbutil.doRelease(connection);
			  }
		  );
		});
	}, //getUser

	getAllUsers: function(request, response) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
		  
		  var selectStatement = "SELECT NAME, EMAIL, GRADE, LEASE_BUDGET FROM USERS";
		  connection.execute(selectStatement, [], 
				{outFormat: oracledb.OBJECT // Return the result as Object
			}, function (err, result) {
				if (err) {
				  console.log('Error in execution of select statement'+err.message);
				  response.writeHead(500, {'Content-Type': 'application/json'});
				  response.end(JSON.stringify({
					status: 500,
						message: "Error getting the departments",
						detailed_message: err.message
				   })
				  );  
				} else {
				   console.log('db response is ready '+result.rows);
				   response.writeHead(200, {'Content-Type': 'application/json'});
				   response.end(JSON.stringify(result.rows));
				  }
				dbutil.doRelease(connection);
			  }
		  );
		});
	} //getAllUsers
};

