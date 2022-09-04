const config = require("./configs.json");
const express = require("express");
const app = express();
const util = require("util");
const where = require("lodash.where");

app.listen(1005, () => {
	console.log("Server Start on port 1005");
});
const { tryJSONparse } = require("./lib");

// var options = { retain:true, qos:1 }; //client.publish(topic, dataToString, options);

//========================================================================>>DO

//========================================================================>> SERVICE

//=======================================================================================>> simulation

/*
 * simulation Creation
 */
app.post("/DigitalTwin/simulationGroup", function (req, res) {
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
				if (flag) {
					res.status(500).send("is already exist");
				} else {
					const simulation = DataObject.name;
					Rclient.rpush("simulation", simulation);
					const sensorFields = Object.keys(DataObject);
					for (var i = 0; i < sensorFields.length; i++) {
						const field = sensorFields[i];
						Rclient.hset(`simulation_${DataObject.name}`, field, JSON.stringify(DataObject[field]));
					}
					res.status(200).send(DataObject);
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
 * simulation Update
 */
app.put("/DigitalTwin/simulationGroup", function (req, res) {
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
app.get("/DigitalTwin/simulationGroup/:simulationName", async (req, res) => {
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
app.delete("/DigitalTwin/simulationGroup/:simulationName", async (req, res) => {
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

function deleteSink(connectorName) {
	console.log("Delete Sink Connector");
	options.method = DELETE;
	options.path = `/connectors/${connectorName}`;
	/**
	 * Send Request to Kafka Connect Server
	 */
	var request = http.request(options, function (response) {
		let fullBody = "";

		response.on("data", function (chunk) {
			fullBody += chunk;
		});

		response.on("end", function () {
			console.log(fullBody);
		});

		response.on("error", function (error) {
			console.error(error);
		});
	});
	request.end();
}

/*
 * simulation Trigger
 * RT: RealTime
 */
app.post("/DigitalTwin/simulationRTtrigger/:simName", function (req, res) {
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
app.post("/DigitalTwin/simulationSTtrigger/:simName", function (req, res) {
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
//=======================================================================>> control

/*
 * control Creation
 */
app.post("/DigitalTwin/:DOName/control", function (req, res) {
	var fullBody = "";
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", function () {
		let DOName = req.params.DOName;
		var controlNameObject;
		controlNameObject = JSON.parse(fullBody);

		if (DONameList.includes(DOName)) {
			console.log("body: ", controlNameObject, "DOName: ", DOName);
			DOWholeDataList.forEach((element, index) => {
				if (element.name == DOName) {
					if (element.control) {
						var filtered = where(element.control, {
							name: controlNameObject.name,
						});
						if (filtered[0]) {
							res.status(400).send("control is already exist");
							console.log("same name exist: ", filtered[0]);
							console.log("element: ", element);
						} else {
							res.status(200).send("Received control Data");
							element.control.push(controlNameObject);
							element.controlCount++;
							console.log("push: ", element);
						}
					} else {
						res.status(200).send("Received control Data");
						element.control = [controlNameObject];
						element.controlCount = 1;
						console.log("control push: ", util.inspect(element, false, null, true));
					}
				}
			});
		} else {
			res.status(404).send("DO does not exist");
		}
	});
});

/*
 * control data Creation
 */
app.post("/DigitalTwin/:DOName/controlData", function (req, res) {
	var fullBody = "";
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", function () {
		let DOName = req.params.DOName;
		var controlDataObject;
		controlDataObject = JSON.parse(fullBody);

		if (DONameList.includes(DOName)) {
			console.log("body: ", controlDataObject, "DOName: ", DOName);
			DOWholeDataList.forEach((element, index) => {
				if (element.name == DOName) {
					if (element.control) {
						var filtered = where(element.control, {
							name: controlDataObject.name,
						});
						if (filtered[0]) {
							res.status(200).send("Received control Data");
							// console.log("control is exist: ", filtered[0]);
							// console.log("element: ", util.inspect(element, false, null, true));
							if (filtered[0].data) {
								filtered[0].data.push(controlDataObject.data); //check please!!
								var fifoControlDataPushArray = new FifoArray(5, filtered[0].data);
								filtered[0].data = fifoControlDataPushArray;
								console.log("create data arr & push data: ", util.inspect(element, false, null, true));
								var controlDataElementToString = JSON.stringify(element);
								client.publish("dp_do_data", controlDataElementToString); //send string text!
								Rclient.set(key_DO, JSON.stringify(value));
							} else {
								filtered[0].data = [controlDataObject.data];
								console.log("push data: ", util.inspect(element, false, null, true));
								var controlDataElementToString = JSON.stringify(element);
								client.publish("dp_do_data", controlDataElementToString); //send string text!
								Rclient.set(key_DO, JSON.stringify(value));
							}
						} else {
							res.status(404).send("The control name does not exist");
						}
					} else {
						// control create tag does not exist
						res.status(404).send("A DO with no control created");
					}
				}
			});
		} else {
			res.status(404).send("DO does not exist");
		}
	});
});

/*
 * control result update
 */
app.put("/DigitalTwin/:DOName/:controlName", function (req, res) {
	var fullBody = "";
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", function () {
		let DOName = req.params.DOName;
		let controlName = req.params.controlName;
		var controlUpdateDataObject;
		controlUpdateDataObject = JSON.parse(fullBody);
		if (DONameList.includes(DOName)) {
			res.status(200).send("Received control Data");
			DOWholeDataList.forEach((element, index) => {
				if (element.name == DOName) {
					if (element.control) {
						var filtered = where(element.control, { name: controlName });
						if (filtered[0]) {
							if (filtered[0].data) {
								filtered[0].data.forEach((data, index) => {
									const controlData = data.toString();
									let controlDataStringArr = controlData.split(", ");
									const updateControlData = controlUpdateDataObject.data.toString();
									let updateControlDataStringArr = updateControlData.split(", ");

									if (controlDataStringArr[0] == updateControlDataStringArr[0] && controlDataStringArr[1] == updateControlDataStringArr[1]) {
										if (controlUpdateDataObject.controlDone) {
											let dataString = controlUpdateDataObject.data + ", " + controlUpdateDataObject.controlReceived + ", " + controlUpdateDataObject.controlDone;
											filtered[0].data.splice(index, 1, dataString);
											let controlDataSetToString = JSON.stringify(element);
											client.publish("dp_do_data", controlDataSetToString);
											Rclient.set(key_DO, JSON.stringify(value));
											console.log("Update controlReceived, controlDone: ", util.inspect(element, false, null, true));
										} else {
											let dataString = controlUpdateDataObject.data + ", " + controlUpdateDataObject.controlReceived;
											filtered[0].data.splice(index, 1, dataString);
											let controlDataSetToString = JSON.stringify(element);
											client.publish("dp_do_data", controlDataSetToString);
											Rclient.set(key_DO, JSON.stringify(value));
											console.log("Update controlReceived: ", util.inspect(element, false, null, true));
										}
									}
								});
							}
						}
					}
				}
			});
		} else {
			res.status(404).send("DO does not exist");
		}
	});
});

/*
 * control delete
 */
app.delete("/DigitalTwin/:DOName/control/:controlName", (req, res) => {
	let DOName = req.params.DOName;
	let controlName = req.params.controlName;
	console.log(DOName, controlName);
	if (DONameList.includes(DOName)) {
		DOWholeDataList.forEach((element, index) => {
			if (element.name == DOName) {
				if (element.control) {
					var filtered = where(element.control, { name: controlName });
					if (filtered[0]) {
						var controlIndex = element.control.findIndex((i) => i.name == controlName);
						element.control.splice(controlIndex, 1);
						element.controlCount--;
						console.log("element: ", util.inspect(element, false, null, true));

						res.status(200).send(`control ${controlName} delete`);
					} else {
						res.status(200).send("control does not exist");
						console.log("element: ", util.inspect(element, false, null, true));
					}
				} else {
					res.status(404).send("control object does not exist");
					console.log("control does not exist");
					console.log("element: ", util.inspect(element, false, null, true));
				}
			}
		});
	} else {
		res.status(404).send("DO does not exist");
	}
});

//=============================================================================> KAFKA SINK
const url = require("url");
const http = require("http");
const POST = "post";
const GET = "get";
const DELETE = "delete";
const PUT = "put";

let kafkaConnectServer = `http://${config.kafkaconnectHost}/connectors`; //create connector address
kafkaConnectServer = url.parse(kafkaConnectServer, true);
var options = {
	hostname: kafkaConnectServer.hostname,
	port: kafkaConnectServer.port,
	path: kafkaConnectServer.pathname,
	headers: {
		"Content-Type": "application/json",
	},
	maxRedirects: 20,
	method: POST,
};

/**
 * CreateSinkConnector => service, simulation
 * MQTT, HTTP
 */

async function CreateServiceSinkConnector(resObject) {
	let sinkConnectorBody;
	const { name, url, DO_arg, SIM_arg } = { ...resObject };
	console.log("resObject", resObject);
	let splitURLsink = url.split(":");
	switch (splitURLsink[0]) {
		case "http":
			sinkConnectorBody = await ServiceHttpSinkConnector(resObject);
			console.log("http sink");
			break;
		case "mqtt":
			sinkConnectorBody = await ServiceMQTTSinkConnector(resObject, splitURLsink);
			console.log("mqtt sink");
			break;
		default:
			console.log(`out of ${splitURLsink[0]}`);
	}

	console.log("sinkConnectorBody\n", sinkConnectorBody);
	/**
	 * Send Request to Kafka Connect Server
	 */
	var request = http.request(options, function (response) {
		var chunks = [];

		response.on("data", function (chunk) {
			chunks.push(chunk);
		});

		response.on("end", function (chunk) {
			var body = Buffer.concat(chunks);
			console.log(body.toString());
		});

		response.on("error", function (error) {
			console.error(error);
		});
	});
	request.write(JSON.stringify(sinkConnectorBody));
	request.end();
}

function ServiceHttpSinkConnector(resObject) {
	let topicArg = resObject.arg;
	let topics = "";
	for (i in topicArg) {
		topics += topicArg[i];
		if (i != topicArg.length - 1) {
			topics += ",";
		}
	}
	//console.log(topics);

	let sinkConnectorBody = {
		name: resObject.name,
		config: {
			"connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
			"tasks.max": "1",
			"request.method": "",
			headers: "Content-Type:application/json|Accept:application/json",
			"key.converter": "org.apache.kafka.connect.storage.StringConverter",
			"value.converter": "org.apache.kafka.connect.storage.StringConverter",
			"http.api.url": resObject.url,
			"request.method": "POST",
			topics: topics,
			"response.topic": `Service_${resObject.name}`,
			"kafka.api.url": `${config.kafkaHost}`,
		},
	};

	return sinkConnectorBody;
}

function ServiceMQTTSinkConnector(resObject, splitURLsink) {
	const DOs = Object.keys(resObject.DO_arg); //[ 'DO1', 'DO2' ]
	const SIMs = Object.keys(resObject.SIM_arg);
	let DO_DOs = DOs.map((d) => "DO_" + d);
	let SIM_SIMs = SIMs.map((s) => "SIM_" + s);
	let DO_SIM_arr = DO_DOs.concat(SIM_SIMs);
	//console.log(DO_SIM_arr);

	let topics = "";
	for (i in DO_SIM_arr) {
		topics += DO_SIM_arr[i];
		if (i != DO_SIM_arr.length - 1) {
			topics += ",";
		}
	}
	//console.log(topics);

	let SQL = "";
	for (i in DO_DOs) {
		SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
	}

	for (i in SIM_SIMs) {
		SQL += `INSERT INTO /mqtt/simulation SELECT * FROM ${SIM_SIMs[i]};`;
	}

	let sinkConnectorBody = {
		name: resObject.name,
		config: {
			"connector.class": "com.datamountaineer.streamreactor.connect.mqtt.sink.MqttSinkConnector",
			"tasks.max": "1",
			topics: topics,
			"connect.mqtt.hosts": `tcp:${splitURLsink[1]}:${splitURLsink[2]}`,
			"connect.mqtt.clean": "true",
			"connect.mqtt.timeout": "1000",
			"connect.mqtt.keep.alive": "1000",
			"connect.mqtt.service.quality": "1",
			"key.converter": "org.apache.kafka.connect.json.JsonConverter",
			"key.converter.schemas.enable": "false",
			"value.converter": "org.apache.kafka.connect.json.JsonConverter",
			"value.converter.schemas.enable": "false",
			"connect.mqtt.kcql": SQL,
		},
	};

	//console.log("sinkConnectorBody\n", sinkConnectorBody);
	return sinkConnectorBody;
}

async function CreateSimulationSinkConnector(resObject) {
	let sinkConnectorBody;
	const { name, url, arg } = { ...resObject };
	console.log("resObject", resObject);
	let splitURLsink = url.split(":");
	switch (splitURLsink[0]) {
		case "http":
			sinkConnectorBody = await SimulationHttpSinkConnector(resObject);
			console.log("http sink");
			break;
		case "mqtt":
			sinkConnectorBody = await SimulationMQTTSinkConnector(resObject, splitURLsink);
			console.log("mqtt sink");
			break;
		default:
			console.log(`out of ${splitURLsink[0]}`);
	}

	console.log("sinkConnectorBody\n", sinkConnectorBody);
	/**
	 * Send Request to Kafka Connect Server
	 */
	var request = http.request(options, function (response) {
		var chunks = [];

		response.on("data", function (chunk) {
			chunks.push(chunk);
		});

		response.on("end", function (chunk) {
			var body = Buffer.concat(chunks);
			console.log(body.toString());
		});

		response.on("error", function (error) {
			console.error(error);
		});
	});
	request.write(JSON.stringify(sinkConnectorBody));
	request.end();
}

function SimulationHttpSinkConnector(resObject) {
	const DOs = Object.keys(resObject.arg); //[ 'DO1', 'DO2' ]
	console.log("DOs: ", DOs);
	let DO_DOs = DOs.map((d) => "DO_" + d);
	console.log("DO_DOs: ", DO_DOs);
	let topics = "";
	for (i in DO_DOs) {
		topics += DO_DOs[i];
		if (i != DO_DOs.length - 1) {
			topics += ",";
		}
	}
	console.log("topics", topics);

	let sinkConnectorBody = {
		name: resObject.name,
		config: {
			"connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
			"tasks.max": "1",
			"request.method": "",
			headers: "Content-Type:application/json|Accept:application/json",
			"key.converter": "org.apache.kafka.connect.storage.StringConverter",
			"value.converter": "org.apache.kafka.connect.storage.StringConverter",
			"http.api.url": resObject.url,
			"request.method": "POST",
			topics: topics,
			"response.topic": `SIM_${resObject.name}`,
			"kafka.api.url": `${config.kafkaHost}`,
		},
	};

	return sinkConnectorBody;
}

function SimulationMQTTSinkConnector(resObject, splitURLsink) {
	const DOs = Object.keys(resObject.arg); //[ 'DO1', 'DO2' ]
	let DO_DOs = DOs.map((d) => "DO_" + d);

	let topics = "";
	for (i in DO_DOs) {
		topics += DO_DOs[i];
		if (i != DO_DOs.length - 1) {
			topics += ",";
		}
	}
	console.log(topics);
	let SQL = "";
	for (i in DO_DOs) {
		SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
	}
	let sinkConnectorBody = {
		name: resObject.name,
		config: {
			"connector.class": "com.datamountaineer.streamreactor.connect.mqtt.sink.MqttSinkConnector",
			"tasks.max": "1",
			topics: topics,
			"connect.mqtt.hosts": `tcp:${splitURLsink[1]}:${splitURLsink[2]}`,
			"connect.mqtt.clean": "true",
			"connect.mqtt.timeout": "1000",
			"connect.mqtt.keep.alive": "1000",
			"connect.mqtt.service.quality": "1",
			"key.converter": "org.apache.kafka.connect.json.JsonConverter",
			"key.converter.schemas.enable": "false",
			"value.converter": "org.apache.kafka.connect.json.JsonConverter",
			"value.converter.schemas.enable": "false",
			"connect.mqtt.kcql": SQL,
		},
	};
	return sinkConnectorBody;
}
