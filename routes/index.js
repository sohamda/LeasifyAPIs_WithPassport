var express = require('express');
var users_crud = require('./users_crud'); 
var lease_crud = require('./lease_crud'); 
var router = express.Router();

var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

var ctrlAuth = require('./authenticate/authentication');

router.post('/login', ctrlAuth.login);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to DB Cloud CRUD Service for Leasify Application' });
});

router.get('/api/catalogue', function(req, res, next) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	var apis= [];
	
	var login = {
		uri: '/api/login',
		method: 'POST',
		requiredParams: 'email, password',
		authorization: 'None',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/login',
		exampleBody: '"email": "example.is@notcorrect.com", "password": "abc123"'
	};
	apis.push(login);
	
	var getAllUsers = {
		uri: '/api/getAllUsers',
		method: 'GET',
		requiredParams: '',
		authorization: 'Header > Authorization: Bearer <Token From /login>',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/getAllUsers',
		exampleBody: ''
	};
	apis.push(getAllUsers);
	
	var getUser = {
		uri: '/api/getUser',
		method: 'GET',
		requiredParams: 'userEmail',
		authorization: 'Header > Authorization: Bearer <Token From /login>',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/getUser?userEmail=myemail@myserver.com',
		exampleBody: ''
	};
	apis.push(getUser);
	
	var addUser = {
		uri: '/api/addUser',
		method: 'POST',
		requiredParams: 'email, name, lease_budget, grade, password',
		authorization: 'None',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/addUser',
		exampleBody: '"name": "Example","email": "example.is@notcorrect.com","grade": "14","lease_budget": "100", "password": "abc123"'
	};
	apis.push(addUser);
	
	var updateUser = {
		uri: '/api/updateUser',
		method: 'POST',
		requiredParams: 'email and atleast one other params name/lease_budget/grade/password',
		authorization: 'Header > Authorization: Bearer <Token From /login>',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/updateUser',
		exampleBody: '"name": "Example","email": "example.is@notcorrect.com","grade": "14","lease_budget": "100"'
	};
	apis.push(updateUser);
	
	var deleteUser = {
		uri: '/api/deleteUser',
		method: 'DELETE',
		requiredParams: 'email',
		authorization: 'Header > Authorization: Bearer <Token From /login>',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/deleteUser?userEmail=some.thing@somewhere.com',
		exampleBody: ''
	};
	apis.push(deleteUser);
	
	var addLeaseRequest = {
		uri: '/api/addLeaseRequest',
		method: 'POST',
		requiredParams: 'email, style_id',
		authorization: 'Header > Authorization: Bearer <Token From /login>',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/addLeaseRequest',
		exampleBody: '"email": "abc@cde.com","style_id": "112233445"'
	};
	apis.push(addLeaseRequest);
	
	var rejectLeaseRequest = {
		uri: '/api/rejectLeaseRequest/:order_id',
		method: 'PUT',
		requiredParams: 'order_id',
		authorization: 'None',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/rejectLeaseRequest/S2321332OM',
		exampleBody: ''
	};
	apis.push(rejectLeaseRequest);
	
	var approveLeaseRequest = {
		uri: '/api/approveLeaseRequest/:order_id',
		method: 'PUT',
		requiredParams: 'order_id',
		authorization: 'None',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/approveLeaseRequest/S2321332OM',
		exampleBody: ''
	};
	apis.push(approveLeaseRequest);
	
	var getLeaseRequest = {
		uri: '/api/getLeaseRequest/:order_id',
		method: 'GET',
		requiredParams: 'order_id',
		authorization: 'None',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/getLeaseRequest/S2321332OM',
		exampleBody: ''
	};
	apis.push(getLeaseRequest);
	
	var getLeaseRequest1 = {
		uri: '/api/getLeaseRequest',
		method: 'GET',
		requiredParams: 'userEmail',
		authorization: 'Header > Authorization: Bearer <Token From /login>',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/getLeaseRequest?userEmail=some.thing@somewhere.com',
		exampleBody: ''
	};
	apis.push(getLeaseRequest1);
	
	var getAllLeaseRequest = {
		uri: '/api/getAllLeaseRequest',
		method: 'GET',
		requiredParams: '',
		authorization: 'None',
		example: 'https://leasifyapis-communitypaas.apaas.us6.oraclecloud.com/api/getAllLeaseRequest',
		exampleBody: ''
	};
	apis.push(getAllLeaseRequest);
	
	res.end(JSON.stringify({apis :apis}));
});

router.get('/api/getAllUsers', auth, function(req, res, next) {
  users_crud.getAllUsers(req, res);
});

router.get('/api/getUser', auth, function(req, res, next) {
	if(!req.query.userEmail) {
		res.status(500).send({error: "getUser : Please specify user email as request param : ?userEmail=some.thing@somewhere.com"});
	} else {
		var userEmail = req.query.userEmail;
		users_crud.getUser(req, res, userEmail);
	}
});

router.post('/api/addUser', function(req, res, next) {
	if(!req.body.email || !req.body.name || !req.body.lease_budget || !req.body.password) {
		console.log(req.body);
		res.status(500).send({error: "addUser : Please specify all paramerters"});
	} else {
		users_crud.addUser(req, res);
	}
});

router.post('/api/updateUser', auth, function(req, res, next) {
	if(!req.body.email || (!req.body.name && !req.body.lease_budget && !req.body.grade && !req.body.password)) {
		console.log(req.body);
		res.status(500).send({error: "Places : Please specify user email and other updatable columns in request body : email=some.thing@somewhere.com"});
	} else {		
		users_crud.updateUser(req, res);
	}
});

router.delete('/api/deleteUser', auth, function(req, res, next) {
	if(!req.query.userEmail) {
		res.status(500).send({error: "Places : Please specify user email as request param : ?userEmail=some.thing@somewhere.com"});
	} else {
		var userEmail = req.query.userEmail;
		users_crud.deleteUser(req, res, userEmail);
	}
});

router.post('/api/addLeaseRequest', auth, function(req, res, next) {
	if(!req.body.email || !req.body.style_id) {
		console.log(req.body);
		res.status(500).send({error: "addLeaseRequest : Please specify all paramerters"});
	} else {
		lease_crud.addLeaseRequest(req, res);
	}
});

router.put('/api/rejectLeaseRequest/:order_id', function(req, res, next) {
	lease_crud.updateLeaseRequest(req, res, req.params.order_id, 'REJECTED');
});

router.put('/api/approveLeaseRequest/:order_id', function(req, res, next) {
	lease_crud.updateLeaseRequest(req, res, req.params.order_id, 'APPROVED');
});

router.get('/api/getLeaseRequest/:order_id', function(req, res, next) {
	lease_crud.getLeaseRequestByOrderId(req, res, req.params.order_id);
});

router.get('/api/getLeaseRequest', auth, function(req, res, next) {
	if(!req.query.userEmail) {
		console.log(req.body);
		res.status(500).send({error: "getLeaseRequest : Please specify all userEmail"});
	} else {
		lease_crud.getLeaseRequestByEmail(req, res, req.query.userEmail);
	}
});

router.get('/api/getAllLeaseRequest', function(req, res, next) {
	lease_crud.getAllLeaseRequest(req, res, null, null);
});

module.exports = router;
