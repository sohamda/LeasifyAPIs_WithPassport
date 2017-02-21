
var oracledb = require('oracledb'); 

var connectionDetails = {
    user          : process.env.DBAAS_USER_NAME || "leasify_admin",
	password      : process.env.DBAAS_USER_PASSWORD || "leasecar123",
	connectString : process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "129.144.149.203:1521/PDB1.communitypaas.oraclecloud.internal"
  };

module.exports = {

executeDatabaseOperation: function(errorCallback, successCallback) {
  var connection = getDbConnection(connectionDetails, function(error){
	  errorCallback(connection);
  }, function(connection) {
	  successCallback(connection);
  });
},

handleDatabaseOperation: function( request, response, callback) {
  console.log(request.method + ":" + request.url );
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  
  console.log('Handle request: '+request.url);
  getDbConnection(connectionDetails, function(error){
	  // Error connecting to DB
      response.writeHead(500, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
              }));
      return;
  }, function(connection){
		callback(request, response, connection);
  });
  
}, //handleDatabaseOperation

doRelease: function(connection) {
  connection.release(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}
};

var getDbConnection = function(connectionDetails, errorCallback, successCallback) {
	
	oracledb.getConnection(connectionDetails, function(err, connection) {
		if (err) {
			console.log('Error in acquiring connection ...');
			console.log('Error message '+err.message);
			errorCallback(err);
			return;
		} else {        
			// do with the connection whatever was supposed to be done
			console.log('Connection acquired ; go execute ');
			successCallback(connection);
	}});
}