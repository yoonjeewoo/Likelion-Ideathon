const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.getMyInfo = (req, res) => {
	conn.query(
		`select id, username, team_id, school, admin from users where id = ${req.decoded._id}`,
		(err, result) => {
			return res.status(200).json({
				result
			})
		}
	)
}

exports.checkIfAdmin = (req, res) => {
	conn.query(
		`select * from users where id = ${req.decoded._id} and admin = 0`,
		(err, result) => {
			if (result.length == 0) {
				return res.status(200).json({
					isAdmin: false
				})
			} else {
				return res.status(200).json({
					isAdmin: true
				})
			}
		}
	)
}