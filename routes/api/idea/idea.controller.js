const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();
const conn = mysql.createConnection(config);

exports.createIdea = (req, res) => {
	const { title, content, base64 } = req.body;
	if (base64 === undefined || base64 === null) {
		conn.query(
			`select * from ideas where team_id = ${req.decoded.team_id}`,
			(err, result) => {
				if (err) throw err;
				if (result.length == 0) {
					conn.query(
						"INSERT INTO ideas(team_id, title, content, img_url, vote_cnt, status) VALUES(?, ?, ?, ?, ?, ?)",
						[req.decoded.team_id, title, content, "https://s3.ap-northeast-2.amazonaws.com/unitedideathon/KakaoTalk_Photo_2018-05-18-20-39-42_74.jpeg", 0, 1],
						(err, result) => {
							if (err) throw err;
							return res.status(200).json({
								message: "아이디어 등록이 완료되었습니다."
							})
						}
					)
				} else {
					return res.status(406).json({
						message: "한 팀에 한 아이디어만 등록이 가능합니다."
					})
				}
			}
		)

	} else {
		const d = new Date();
		d.setUTCHours(d.getUTCHours() + 9);
		const picKey = d.getFullYear() + '_'
			+ d.getMonth() + '_'
			+ d.getDate() + '_'
			+ crypto.randomBytes(20).toString('hex') +
			+ req.decoded._id + '.jpg';
		const picUrl = `https://s3-ap-northeast-2.amazonaws.com/unitedideathon/${picKey}`;
		let buf = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
		s3.putObject({
			Bucket: 'unitedideathon',
			Key: picKey,
			Body: buf,
			ACL: 'public-read'
		}, function (err, response) {
			if (err) {
				return res.status(406).json({
					err
				})
			} else {
				conn.query(
					`select * from ideas where team_id = ${req.decoded.team_id}`,
					(err, result) => {
						if (err) throw err;
						if (result.length == 0) {
							conn.query(
								"INSERT INTO ideas(team_id, title, content, img_url, vote_cnt, status) VALUES(?, ?, ?, ?, ?, ?)",
								[req.decoded.team_id, title, content, picUrl, 0, 1],
								(err, result) => {
									if (err) throw err;
									return res.status(200).json({
										message: "아이디어 등록이 완료되었습니다."
									})
								}
							)
						} else {
							return res.status(406).json({
								message: "한 팀에 한 아이디어만 등록이 가능합니다."
							})
						}
					}
				)
			}
		});
	}
	
}

exports.getIdeaList = (req, res) => {
	conn.query(
		'select ideas.id, title, content, img_url, vote_cnt, team_id, name, status from ideas join teams on ideas.team_id = teams.id order by vote_cnt desc',
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				result
			})
		}
	)
}

exports.editIdea = (req, res) => {
	const { idea_id } = req.params;
	const { title, content } = req.body;
	conn.query(
		`update ideas set title = '${title}', content = '${content}' where id = ${idea_id} and team_id = ${req.decoded.team_id}`,
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				message: 'done'
			})
		}
	)
}

exports.voteIdea = (req, res) => {
	conn.query(
		`select * from votes where user_id = ${req.decoded._id}`,
		(err, result1) => {
			if (result1.length < 11 ) {
				conn.query(
					`select id from ideas where team_id = ${req.decoded.team_id} and status = 0`,
					(err, result2) => {
						if (err) throw err;
						if (result2.length == 0) {
							conn.query(
								"select id from ideas where status = 0",
								(err, idea) => {
									if (err) throw err;
									if (idea.length == 0) {
										return res.status(406).json({
											message: '현재는 투표가능시간이 아닙니다.'
										})
									} else {
										conn.query(
											`select * from votes where user_id = ${req.decoded._id} and ideas_id = ${idea[0].id}`,
											(err, result3) => {
												if (result3.length == 0) {
													conn.query(
														`update ideas set vote_cnt = vote_cnt + 1 where id = ${idea[0].id}`,
														(err) => {
															if (err) throw err;
															conn.query(
																`insert into votes(user_id, ideas_id) values(${req.decoded._id},${idea[0].id})`,
																(err) => {
																	if (err) throw err;
																	return res.status(200).json({
																		message: '투표가 성공적으로 완료되었습니다.'
																	})
																}
															)
														}
													)
												} else {
													return res.status(406).json({
														message: '중복투표는 불가능합니다.'
													})
												}
											}
										)
									}
								}
							)
						} else {
							return res.status(406).json({
								message: '본인의 팀에는 투표를 하실 수 없습니다.'
							})
						}
					}
				)
			} else {
				return res.status(406).json({
					message: '모든 투표권을 행사했습니다.'
				})
			}
		}
	)
}


exports.presentNow = (req, res) => {
	conn.query(
		`select * from ideas where status = 0`,
		(err, result) => {
			return res.status(200).json({
				result
			})
		}
	)
}
