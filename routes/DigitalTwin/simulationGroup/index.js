const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

/*
 * simulation Creation
 */
router.post("/", async function (req, res) {
	try {
		const { name, arg, url } = req.body;

		const result = await service.simulation.create({ name, arg, url });

		res.success(201, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, "POST /DigitalTwin/simulationGroup");
	}
});

/*
 * simulation Update
 */
router.put("/", function (req, res) {
	let fullBody = "",
		DataObject = "";
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", async function () {
		if (tryJSONparse(fullBody)) {
			DataObject = tryJSONparse(fullBody);
			if (DataObject?.name && DataObject?.arg && DataObject?.url) {
				const flag = await checkNameExist(DataObject.name, "simulation").then(function (flag) {
					return flag;
				});
				if (!flag) {
					res.status(500).send("Unregistered simulation");
				} else {
					const simulation = DataObject.name;
					const sensorFields = Object.keys(DataObject);
					for (var i = 0; i < sensorFields.length; i++) {
						const field = sensorFields[i];
						Rclient.hset(`simulation_${DataObject.name}`, sensorFields[i], JSON.stringify(DataObject[field]));
					}
					res.status(200).send("successfully update");
				}
			} else {
				res.status(500).send("please check mandatory field");
			}
		} else {
			res.status(500).send("is not a json structure");
		}
	});
});

/*
 * simulation Retrieve
 */
router.get("/:simulationName", async (req, res) => {
	if (req.params.simulationName) {
		let simulationName = req.params.simulationName;
		const flag = await checkNameExist(simulationName, "simulation").then(function (flag) {
			return flag;
		});
		if (flag) {
			const keys = await getKeys(`simulation_${req.params.simulationName}`).then(function (keys) {
				return keys;
			});

			let resObject = {};
			for (let key of keys) {
				const value = await getValue(`simulation_${req.params.simulationName}`, key);
				resObject[key] = value;
			}
			res.status(200).send(resObject);
		} else {
			res.status(200).send("Unregistered simulation");
		}
	} else {
		res.status(404).send("Bad Request");
		console.log("input value error");
	}
});

/*
 * simulation delete
 */
router.delete("/:simulationName", async (req, res) => {
	if (req.params.simulationName) {
		let simulationName = req.params.simulationName;
		const flag = await checkNameExist(simulationName, "simulation").then(function (flag) {
			return flag;
		});
		if (flag) {
			Rclient.DEL(`simulation_${req.params.simulationName}`);
			Rclient.LREM("simulation", -1, req.params.simulationName);
			deleteSink(req.params.simulationName);
			res.send({ success: 1 });
		} else {
			res.status(200).send("Unregistered simulation");
		}
	} else {
		res.status(404).send("Bad Request");
		console.log("input value error");
	}
});

/*
 * simulation Trigger
 * RT: RealTime
 */
router.post("/RTtrigger/:simName", function (req, res) {
	let fullBody = "",
		simName = "",
		resObject = {};
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", async function () {
		if (req.params.simName) {
			simName = req.params.simName;
		} else {
			res.status(500).send("please check simName parameter");
		}
		if (req.params.simName) {
			let simName = req.params.simName;
			const flag = await checkNameExist(simName, "simulation").then(function (flag) {
				return flag;
			});
			if (flag) {
				const keys = await getKeys(`simulation_${simName}`).then(function (keys) {
					return keys;
				});
				for (let key of keys) {
					const value = await getValue(`simulation_${simName}`, key);
					resObject[key] = value;
				}
				console.log(`createRTSink: `, util.inspect(resObject, false, null, true));
				CreateSimulationSinkConnector(resObject);
				res.status(200).send(resObject);
			} else {
				res.status(200).send("Unregistered simulation");
			}
		} else {
			res.status(500).send("please check simName parameter");
		}
	});
});

/*
 * simulation Trigger
 * ST: Static Time
 */
router.post("/STtrigger/:simName", function (req, res) {
	let fullBody = "",
		DataObject = "",
		simName = "",
		resObject = {};
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", async function () {
		if (req.params.simName) {
			simName = req.params.simName;
		} else {
			res.status(500).send("please check simName parameter");
		}
		if (tryJSONparse(fullBody)) {
			DataObject = tryJSONparse(fullBody);
			if (DataObject?.data) {
				const flag = await checkNameExist(simName, "simulation").then(function (flag) {
					return flag;
				});
				if (flag) {
					const keys = await getKeys(`simulation_${simName}`).then(function (keys) {
						return keys;
					});
					for (let key of keys) {
						const value = await getValue(`simulation_${simName}`, key);
						resObject[key] = value;
					}
					//resObject.url로 DataObject전송
					console.log(`createSTSink:  url => ${resObject.url} , data => ${util.inspect(DataObject.data)}`);
					//CreateSinkConnector(resObject);
					res.status(200).send(`createSTSink:  url => ${resObject.url} , data => ${util.inspect(DataObject.data)}`);
				} else {
					res.status(200).send("Unregistered simulation");
				}
			} else {
				res.status(500).send("please check mandatory field");
			}
		} else {
			res.status(500).send("is not a json structure");
		}
	});
});
