var mysql = require('mysql');
var chalk = require('chalk');
var appConfig = require("./config.js");

var db = {
	connection: null,

	init: function(){
		db.connection = mysql.createConnection({
			host: appConfig.db.host,
			user: appConfig.db.username,
			password: appConfig.db.password,
			database: appConfig.db.db
		});
		db.connection.connect();
	},

	end: function(){
		db.connection.end();
	},

	events:{
		getAll: function(callback){
			db.connection.query("SELECT * FROM `Events` ORDER BY id", function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		getById: function(id, callback){
			db.connection.query("SELECT * FROM `Events` WHERE `id`="+db.connection.escape(id), function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		getPrestas: function(id, callback){

		},

		setEvent: function(params, callback){

			db.connection.query("INSERT INTO `Events`(id, name, description, start, end, edit_key) VALUES (null, ?, ?, ?, ?, ?)",
				[params.name, params.description, params.start, params.end, params.edit_key],
				function (err, rows, fields){
					if (err){
						logErr(err);
						callback(err);
					}

					callback(null, rows);
				}
			);
		},

		updateEvent: function(callback){

		}
	},

	prestas:{
		getAll:function(callback){
			db.connection.query("SELECT Prestas.*, COUNT(Shotguns.id) AS active_shotguns FROM `Prestas` LEFT OUTER JOIN Shotguns ON (Shotguns.presta_id = Prestas.id) GROUP BY Prestas.id", function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		getById: function(id, callback){
			db.connection.query("SELECT Prestas.*, COUNT(Shotguns.id) AS active_shotguns FROM `Prestas` LEFT OUTER JOIN Shotguns ON (Shotguns.presta_id = Prestas.id) WHERE Prestas.id="+db.connection.escape(id)+" GROUP BY Prestas.id", function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		getFromEvent: function(ev_id, callback){
			db.connection.query("SELECT Prestas.*, COUNT(Shotguns.id) AS active_shotguns FROM `Prestas` LEFT OUTER JOIN Shotguns ON (Shotguns.presta_id = Prestas.id) WHERE `event_id`="+db.connection.escape(ev_id)+" GROUP BY Prestas.id", function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		setPresta: function(params, callback){
			db.connection.query("INSERT INTO `Prestas`(id, event_id, type, name, description, edit_key, slots) VALUES (null, ?, ?, ?, ?, ?, ?)",
				[params.event_id, params.type, params.name, params.description, params.edit_key, params.slots],
				function (err, rows, fields){
					if (err){
						logErr(err);
						callback(err);
					}

					callback(null, rows);
				}
			);
		},

		updatePresta: function(callback){

		}
	},

	shotguns:{
		getById: function(id, callback){
			db.connection.query("SELECT * FROM `Shotguns` WHERE `id`="+db.connection.escape(id), function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		getFromPresta: function(pr_id, callback){
			db.connection.query("SELECT * FROM `Shotguns` WHERE `presta_id`="+db.connection.escape(pr_id), function (err, rows, fields){
				if (err){
					logErr(err);
					callback(err);
				}

				callback(null, rows);
			});
		},

		setShotgun: function(params, callback){
			db.connection.query("INSERT INTO `Shotguns`(id, name, presta_id, mail, status, validate_key) VALUES (null, ?, ?, ?, ?, ?)",
				[params.name, params.presta_id, params.mail, 'E', params.validate_key],
				function (err, rows, fields){
					if (err){
						logErr(err);
						callback(err);
					}

					callback(null, rows);
				}
			);
		},

		removeShotgun: function(id, callback){
			db.connection.query("DELETE FROM `Shotguns` WHERE `id`=?",
				[id],
				function (err, rows, fields){
					if (err){
						logErr(err);
						callback(err);
					}

					callback(null, rows);
				}
			);
		}
	}
};

module.exports = db;

function logErr(err) {
	console.error(chalk.red("Error in db:"));
	console.log(err);
}