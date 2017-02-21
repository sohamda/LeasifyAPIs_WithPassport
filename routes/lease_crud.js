
var oracledb = require('oracledb'); 
var dbutil = require('./dbutil'); 

module.exports = {
	addLeaseRequest: function(request, response) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
	  
		  var email = request.body.email;
		  var style_id = request.body.style_id;
		  var order_id = generateOrderId(email);
		  var requestedOn = new Date();
		  var status = "REQUESTED";
		  console.log("adding lease request with order id:" + order_id);
		  var insertStatement = "INSERT INTO LEASE_HISTORY (ORDER_ID, USER_EMAIL, STYLE_ID, REQUESTED_ON, STATUS) VALUES (:order_id, :email, :style_id, :requestedOn, :status)";
		  connection.execute(insertStatement, [order_id, email, style_id, requestedOn, status], 
				{outFormat: oracledb.OBJECT // Return the result as Object
				}, function (err, result) {
					if (err) {
					  console.log('Error in execution of insert statement'+err.message);
					  response.writeHead(500, {'Content-Type': 'application/json'});
					  response.end(JSON.stringify({
						status: 500,
							message: "Error adding the lease request : " + email,
							detailed_message: err.message
					   })
					  );  
					} else {
						console.log("Add Lease request results :" + JSON.stringify(result));
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
	},
	
	updateLeaseRequest: function(request, response, order_id, status) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
			  var reviewedOn = new Date();
			  var updateStatement = "UPDATE LEASE_HISTORY SET STATUS = :status, REVIEWED_ON = :reviewedOn WHERE ORDER_ID = :order_id";
			  connection.execute(updateStatement, [status, reviewedOn, order_id], 
					{outFormat: oracledb.OBJECT // Return the result as Object
					}, function (err, result) {
						if (err) {
						  console.log('Error in execution of update statement'+err.message);
						  response.writeHead(500, {'Content-Type': 'application/json'});
						  response.end(JSON.stringify({
							status: 500,
								message: "Error updating the lease request : " + order_id,
								detailed_message: err.message
						   })
						  );  
						} else {
							console.log("Update Lease request result :" + JSON.stringify(result));
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
	},
	
	getLeaseRequestByOrderId: function(request, response, order_id) {
		return getLeaseRequest(request, response, " WHERE ORDER_ID = :order_id", order_id);
	},
	
	getLeaseRequestByEmail: function(request, response, email) {
		return getLeaseRequest(request, response, " WHERE USER_EMAIL = :email", email);
	},
	
	getAllLeaseRequest: function(request, response) {
		return getLeaseRequest(request, response, null, null);
	}
};

var getLeaseRequest = function(request, response, whereClause, bindVariable) {
		dbutil.handleDatabaseOperation( request, response, function (request, response, connection) {
			var selectStatement = "SELECT ORDER_ID, USER_EMAIL, STYLE_ID, REQUESTED_ON, REVIEWED_ON, STATUS FROM LEASE_HISTORY";
			var selectBindVariables = [];
			if(whereClause) {
				selectStatement = selectStatement + whereClause;
				selectBindVariables.push(bindVariable);
			}
			connection.execute(selectStatement, selectBindVariables, 
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
	}

var generateOrderId = function(email) {
	var firstLetter = email.substring(0,1);
	var last2Letters = email.substring(email.length - 2);
	// randon number between 999 to 99999999
	var randomNumber = Math.floor(Math.random() * (99999999 - 999 + 1)) + 999;
	return firstLetter.toUpperCase() + randomNumber + last2Letters.toUpperCase();
}