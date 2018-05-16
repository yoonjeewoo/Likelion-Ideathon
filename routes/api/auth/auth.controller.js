const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.register = (req, res) => {
	const secret = req.app.get('jwt-secret');
	const { username, password, school } = req.body;
	const encrypted = crypto.createHmac('sha1', config.secret)
		.update(password)
		.digest('base64');
	conn.query('SELECT * from users WHERE username=?', [username], (err, rows) => {
		if (err) throw err;
		if (rows.length == 0) {
			conn.query(
				'INSERT INTO users(username, password, school) VALUES (?, ?, ?)',
				[username, encrypted, school],
				(err, result) => {
					if (err) throw err;
					console.log(result);
					jwt.sign(
						{
							_id: result.insertId,
							username: username
						},
						secret,
						{
							expiresIn: '7d',
							issuer: 'ideathon',
							subject: 'userInfo'
						}, (err, token) => {
							if (err) return res.status(406).json({ message: 'register failed' });
							return res.status(200).json({
								message: 'registered successfully',
								token
							});
						});
				});
		} else {
			return res.status(406).json({
				message: 'username exists'
			})
		}
	});
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