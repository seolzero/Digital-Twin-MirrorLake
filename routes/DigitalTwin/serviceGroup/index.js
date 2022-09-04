const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

// kafka 설정 불러오기
const config = require("../../../config");
const kafka = config.kafka.host;

/*
 * service Creation
 */
router.post("/", function (req, res) {
	let fullBody = "",
		DataObject = "";
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", async function () {
		if (tryJSONparse(fullBody)) {
			DataObject = tryJSONparse(fullBody);
			if (DataObject?.name && DataObject?.url) {
				const flag = await checkNameExist(DataObject.name, "service").then(function (flag) {
					return flag;
				});
				if (flag) {
					res.status(500).send("is already exist");
				} else {
					const service = DataObject.name;
					Rclient.rpush("service", service);
					const sensorFields = Object.keys(DataObject);
					for (var i = 0; i < sensorFields.length; i++) {
						const field = sensorFields[i];
						Rclient.hset(`service_${DataObject.name}`, sensorFields[i], JSON.stringify(DataObject[field]));
					}
					res.status(200).send("successfully registered");
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
 * service Update
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
			if (DataObject?.name && DataObject?.url) {
				const flag = await checkNameExist(DataObject.name, "service").then(function (flag) {
					return flag;
				});
				if (!flag) {
					res.status(500).send("Unregistered service");
				} else {
					const service = DataObject.name;
					const sensorFields = Object.keys(DataObject);
					for (var i = 0; i < sensorFields.length; i++) {
						const field = sensorFields[i];
						Rclient.hset(`service_${DataObject.name}`, sensorFields[i], JSON.stringify(DataObject[field]));
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
 * service Retrieve
 */
router.get("/:serviceName", async (req, res) => {
	if (req.params.serviceName) {
		let serviceName = req.params.serviceName;
		const flag = await checkNameExist(serviceName, "service").then(function (flag) {
			return flag;
		});
		if (flag) {
			const keys = await getKeys(`service_${req.params.serviceName}`).then(function (keys) {
				return keys;
			});

			let resObject = {};
			for (let key of keys) {
				const value = await getValue(`service_${req.params.serviceName}`, key);
				resObject[key] = value;
			}
			res.status(200).send(resObject);
		} else {
			res.status(200).send("Unregistered service");
		}
	} else {
		res.status(404).send("Bad Request");
		console.log("input value error");
	}
});

/*
 * service delete
 */
router.delete("/:serviceName", async (req, res) => {
	if (req.params.serviceName) {
		let serviceName = req.params.serviceName;
		const flag = await checkNameExist(serviceName, "service").then(function (flag) {
			return flag;
		});
		if (flag) {
			Rclient.DEL(`service_${req.params.serviceName}`);
			Rclient.LREM("service", -1, req.params.serviceName);
			deleteSink(req.params.serviceName);
			res.send({ success: 1 });
		} else {
			res.status(200).send("Unregistered service");
		}
	} else {
		res.status(404).send("Bad Request");
		console.log("input value error");
	}
});

/*
 * service Trigger
 */
router.post("/trigger/:serviceName", function (req, res) {
	let fullBody = "",
		serviceName = "",
		resObject = {};
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", async function () {
		if (req.params.serviceName) {
			serviceName = req.params.serviceName;
			const flag = await checkNameExist(serviceName, "service").then(function (flag) {
				return flag;
			});
			if (flag) {
				const keys = await getKeys(`service_${serviceName}`).then(function (keys) {
					return keys;
				});
				for (let key of keys) {
					const value = await getValue(`service_${serviceName}`, key);
					resObject[key] = value;
				}
				CreateServiceSinkConnector(resObject);
				res.status(200).send(resObject);
			} else {
				res.status(412).send("Unregistered service");
			}
		} else {
			res.status(500).send("please check serviceName parameter");
		}
	});
});
