const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const lineReader = require('line-reader');

exports.register = (req, res) => {
	const secret = req.app.get('jwt-secret');
	// lineReader.eachLine('users.txt', function(line, last) {
	// 	console.log(line);
	// 	let row = line.split(' ');
	// 	// let encrypted = 
	// 	conn.query(
	// 		'insert into users(username, password, team_id, school, admin) values(?, ?, ?, ?, ?)',
	// 		[row[1], crypto.createHmac('sha1', config.secret).update(row[2]).digest('base64'), 0, row[0], 1],
	// 		(err, result) => {
	// 			if (err) throw err;
	// 		}
	// 	)
	// 	if(last){
	// 		// or check if it's the last one
	// 		return res.status(200).json({
	// 			message: 'input users done'
	// 		})
	// 	}
	// });lineReader.eachLine('users.txt', function(line, last) {
	// 	console.log(line);
	// 	let row = line.split(' ');
	// 	// let encrypted = 
	// 	conn.query(
	// 		'insert into users(username, password, team_id, school, admin) values(?, ?, ?, ?, ?)',
	// 		[row[1], crypto.createHmac('sha1', config.secret).update(row[2]).digest('base64'), 0, row[0], 1],
	// 		(err, result) => {
	// 			if (err) throw err;
	// 		}
	// 	)
	// 	if(last){
	// 		// or check if it's the last one
	// 		return res.status(200).json({
	// 			message: 'input users done'
	// 		})
	// 	}
	// });
};

exports.login = (req, res) => {
	const { username, password } = req.body;
	const secret = req.app.get('jwt-secret');
	const encrypted = crypto.createHmac('sha1', config.secret)
		.update(password)
		.digest('base64');
	conn.query(
		'SELECT * from users WHERE username=? and password=?',
		[username, encrypted],
		(err, result) => {
			if (err) throw err;
			if (result.length == 0) {
				return res.status(406).json({ message: 'login failed' });
			} else {
				jwt.sign(
					{
						_id: result[0].id,
						username: result[0].username,
						school: result[0].school,
						team_id: result[0].team_id
					},
					secret,
					{
						expiresIn: '7d',
						issuer: 'ideathon',
						subject: 'userInfo'
					}, (err, token) => {
						if (err) return res.status(406).json({ message: 'login failed' });
						return res.status(200).json({
							message: 'logged in successfully',
							token
						});
					});
			}
		}
	)
};