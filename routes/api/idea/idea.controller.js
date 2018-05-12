const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

let findTeamId = (team_name) => {
	return new Promise((resolve, reject) => {
		conn.query(
			"SELECT id FROM teams WHERE name = ?",
			[team_name],
			(err, result) => {
				if(err) reject();
				resolve(result);
			}
		)
	})
}

let input = (result, title, content) => {
	return new Promise((resolve, reject) => {
		conn.query(
			"INSERT INTO ideas(team_id, title, content, img_url, vote_cnt, status) VALUES(?, ?, ?, ?, ?, ?)",
			[result[0].id, title, content, "http://news.unn.net/news/photo/Gisa/200910/30/image/20091030161129.jpg", 0, 1],
			(err, result) => {
				if (err) reject();
				resolve();
			}
		)
	})
}


exports.createIdea = (req, res) => {
	const { title, content, team_name } = req.body;
	async function create_idea(title, content, team_name) {
		let result = await findTeamId(team_name);
		await input(result, title, content);
		await res.status(200).json({
			message: 'done'
		})
	}
	create_idea(title, content, team_name);
}

exports.getIdeaList = (req, res) => {
	conn.query(
		'select ideas.id, title, content, img_url, vote_cnt, name, status from ideas join teams on ideas.team_id = teams.id order by vote_cnt desc',
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
		`update ideas set title = '${title}', content = '${content}' where id = ${idea_id}`,
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				message: 'done'
			})
		}
	)
}