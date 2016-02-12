// dependecies and options
var express = require('express');
var app = express();



var config = require('./config.js');

var chalk = require('chalk');

var db = require('./db.js');

var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// open connection to database
db.init();

// routing

// events
	//get
app.get("/events", function(req, res, err){
	db.events.getAll(function(merr, rows){
		var resp = [];
		if(merr){
			config.sendError(res, "mysql-001", merr.code, 500);
			return;
		}

		var ev_counter = rows.length;

		for(var ev in rows){
			
			var l = resp.push({
				id: rows[ev].id,
				name: rows[ev].name,
				description: rows[ev].description,
				start: rows[ev].start,
				end: rows[ev].end
			});

			db.prestas.getFromEvent(rows[ev].id, (function(current_event){
				return function(merr, prows){
					if(merr){
						config.sendError(res, "mysql-001", merr.code, 500);
						return;
					}
					var prestas_in_ev = [];

					for(var pr in prows){
						prestas_in_ev.push({
							id: prows[pr].id,
							event_id: prows[pr].id,
							type: prows[pr].type,
							name: prows[pr].name,
							description: prows[pr].description,
							"slots": prows[pr].slots,
							"remaining_slots": prows[pr].slots - prows[pr].active_shotguns
						});
					}

					current_event.prestas = prestas_in_ev;
					ev_counter--;
					
					if(!ev_counter){
						res.json(resp);
						res.end();
					}

				};
			})(resp[l-1]));
		}

	});
});

app.get("/events/:id", function (req, res, err){
	db.events.getById(req.params.id, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-001", merr.code, 500);
			return;
		}

		db.prestas.getFromEvent(req.params.id, function(merr, prows){
			var prestas = [];
			for(var pr in prows){
				prestas.push({
					id: prows[pr].id,
					event_id: prows[pr].id,
					type: prows[pr].type,
					name: prows[pr].name,
					description: prows[pr].description,
					"slots": prows[pr].slots,
					"remaining_slots": prows[pr].slots - prows[pr].active_shotguns
				});
			}

			res.json({
				id: rows[0].id,
				name: rows[0].name,
				description: rows[0].description,
				start: rows[0].start,
				end: rows[0].end,
				prestas: prestas
			});

			res.end();
		});


	});
});

	//post
app.post("/event", function (req, res, err){
	var check = config.checkParams(["name", "description", "start", "end", "creator"], req.body);
	if(!check.success){
		res.status(400);
		res.json({
			error:{
				message: "Missing field " + check.field
			}
		});
		return;
	}

	var params = {
		name: req.body.name,
		description: req.body.description,
		start: req.body.start, 
		end: req.body.end,
	};

	params.edit_key = Math.md5(params.name + req.body.creator);

	db.events.setEvent(params, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-002", merr.code, 400);
			return;
		}
		res.sendStatus(200);
	});
});

app.put("/event/:id", function(req, res, err){
	var params = {
		updating:req.body,
		id: req.params.id,
	};

	db.events.updateEvent(params, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-003", merr.code, 500);
			return;
		}
		res.sendStatus(200);
	});
});

// prestas
	//get
app.get("/presta/all", function (req, res, err){
	db.prestas.getAll(function(merr, prows){
		if(merr){
			config.sendError(res, "mysql-001", merr.code, 500);
			return;
		}

		var prestas = [];
		for(var pr in prows){
			prestas.push({
				id: prows[pr].id,
				event_id: prows[pr].id,
				type: prows[pr].type,
				name: prows[pr].name,
				description: prows[pr].description,
				"slots": prows[pr].slots,
				"remaining_slots": prows[pr].slots - prows[pr].active_shotguns
			});
		}

		res.json(prestas);
		res.end();

	});
});

app.get("/presta/:id", function (req, res, err){
	db.prestas.getById(req.params.id, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-001", merr.code, 500);
			return;
		}

		res.json({
			id: rows[0].id,
			event_id: rows[0].id,
			type: rows[0].type,
			name: rows[0].name,
			description: rows[0].description,
			"slots": rows[0].slots
		});
		res.end();
	});
});

	//post
app.post("/presta", function (req, res, err) {
	var check = config.checkParams(["event_id", "creator", "type", "name", "description", "slots"], req.body);
	if(!check.success){
		res.status(400);
		res.json({
			error:{
				message: "Missing field " + check.field,
			}
		});

		return;
	}

	var params = {
		event_id : req.body.event_id,
		type : req.body.type,
		name : req.body.name,
		description : req.body.description,
		slots: req.body.slots
	};

	params.edit_key = Math.md5(params.name + req.body.creator);

	db.prestas.setPresta(params, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-002", merr.code, 400);
			return;
		}

		res.sendStatus(200);
	});
});

//shotgun
app.get("/presta/:id/shotguns", function (req, res, err){
	db.getFromPresta(req.params.id, function(merr, rows){
		var shotguns = [];
		if(merr){
			config.sendError(res, "mysql-001", merr.code, 500);
			return;
		}

		for(var s in rows){
			shotguns.push({
				id: rows[s].id,
				mail: rows[s].mail,
				status: rows[s].status,
				name: rows[s].name,
			});
		}

		res.json({
			presta_id: req.params.id,
			number: shotguns.length,
			shotguns: shotguns,
		});
		res.end();
	});
});

app.put("/presta/:id", function(req, res, err){
	var check = config.checkParams(['key', 'name', 'description', 'type', 'slots'], req.body);
	if(!check.success){
		res.status(400);
		res.json({
			error:{
				message: "Missing field " + check.field,
			}
		});
		return;
	}

	var params = {
		updating:{},
		id: req.params.id,
		key: req.body.key
	};

	var ignoredKeys = ["key"];
	for(var k in req.body){
		if(ignoredKeys.indexOf(k) > -1) continue;
		params.updating[k] = req.body[k];
	}

	db.adminKeys.check(params.key, function(merr, check) {
		if (merr){
			config.sendError(res, "mysql-002", merr.code, 400);
			return;
		}
		if (!check){
			config.sendError(res, "Unauthorized", merr.code, 403);
			return;
		}

		db.prestas.updatePresta(params, function(merr, rows) {
			if (merr){
				config.sendError(res, "mysql-002", merr.code, 400);
				return;
			}

			res.sendStatus(200);
		})
	})
});

app.post("/presta/:id/shotgun", function (req, res, err){
	var check = config.checkParams(["mail", "name"], req.body);
	if(!check.success){
		res.status(400);
		res.json({
			error:{
				message: "Missing field " + check.field,
			}
		});
		return;
	}

	var params = {
		presta_id: req.params.id,
		mail: req.body.mail,
		name: req.body.name,
	};

	params.validate_key = Math.md5(params.mail + params.presta_id);

	db.shotguns.setShotgun(params, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-002", merr.code, 400);
			return;
		}

		res.sendStatus(200);
	});
});

app.delete("/shotgun/:id", function(req, res, err){
	db.shotguns.deleteShotgun(req.params.id, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-004", merr.code, 500);
			return;
		}

		res.sendStatus(200);
	});
});

// validates shotgun
app.post("/shotgun/:id", function(req, res, err){
	db.shotguns.validateShotgun(req.params.id, function(merr, rows){
		if(merr){
			config.sendError(res, "mysql-001", merr.code, 500);
			return;
		}

		res.sendStatus(200);
	});
});

// startup

app.listen(8080, function(){
	console.log(chalk.green("Server Up And Listening!"));
});

// to end connection
process.on('SIGINT', function() {
    console.log(chalk.red("\nCaught interrupt signal, quitting...."));

    db.end();
    process.exit();
});

