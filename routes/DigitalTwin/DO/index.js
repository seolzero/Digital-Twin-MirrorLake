const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

const service = require("../../../services");
const ErrorHandler = require("../../../lib/error-handler");

/**
 * DO Creation
 * @body {String} name (required)
 * @body {String Array} sensor (required)
 * @returns {Json} {}
 */
router.post("/", async function (req, res) {
	try {
		const { name, sensor } = req.body;

		const result = await service.do.create({ name, sensor });

		res.success(201, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, "POST /DigitalTwin/DO");
	}

	// let fullBody = "";
	// req.on("data", function (chunk) {
	// 	fullBody += chunk;
	// });

	req.on("end", async function () {
		if (tryJSONparse(fullBody)) {
			DOWholeData = tryJSONparse(fullBody);
			if (DOWholeData?.name && DOWholeData?.sensor && DOWholeData.sensor.length > 0) {
				const flag = await checkNameExist(DOWholeData.name, "DO").then(function (flag) {
					return flag;
				});
				if (flag) {
					res.status(500).send("DO is already exist");
				} else {
					const DOName = DOWholeData.name;
					Rclient.rpush("DO", DOName);
					const DOobject = CheckKeyExistAndAddCount(DOWholeData);
					Rclient.set(DOName, JSON.stringify(DOobject));
					create_flink_DO_table(DOobject);
					res.status(200).send(DOobject);
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
 * DO Retrieve
 */
router.get("/:DOName", async (req, res) => {
	if (req.params.DOName) {
		let DOName = req.params.DOName;
		const flag = await checkNameExist(DOName, "DO").then(function (flag) {
			return flag;
		});
		if (flag) {
			Rclient.get(DOName, function (err, value) {
				if (err) throw err;
				res.status(200).send(JSON.parse(value));
			});
		} else {
			res.status(200).send("Unregistered DO");
		}
	} else {
		res.status(404).send("Bad Request");
		console.log("input value error");
	}
});

/*
 * DO Entire Retrieve
 */
router.get("/", async function (req, res) {
	let DONameEntireList = await getNameList("DO").then((List) => {
		res.status(200).send(JSON.parse(DONameEntireList));
	});
});

/*
 * DO DELETE
 */
router.delete("/:DOName", async (req, res) => {
	if (req.params.DOName) {
		let DOName = req.params.DOName;
		const flag = await checkNameExist(DOName, "DO").then(function (flag) {
			return flag;
		});
		if (flag) {
			Rclient.DEL(DOName);
			Rclient.LREM("DO", -1, DOName);
			res.send({ success: 1 });
		} else {
			res.status(200).send("Unregistered DO");
		}
	} else {
		res.status(404).send("Bad Request");
		console.log("input value error");
	}
});

/*
 * DO UPDATE
 */
router.put("/", async (req, res) => {
	var fullBody = "";
	req.on("data", function (chunk) {
		fullBody += chunk;
	});

	req.on("end", async function () {
		if (tryJSONparse(fullBody)) {
			DOWholeData = tryJSONparse(fullBody);
			if (DOWholeData?.name && DOWholeData?.sensor && DOWholeData.sensor.length > 0) {
				const flag = await checkNameExist(DOWholeData.name, "DO").then(function (flag) {
					return flag;
				});
				if (!flag) {
					res.status(500).send("Unregistered DO");
				} else {
					const DOName = DOWholeData.name;
					const DOobject = CheckKeyExistAndAddCount(DOWholeData);
					console.log("DO: ", DOobject);
					Rclient.set(DOName, JSON.stringify(DOobject));
					postDOobjectToKSQL(DOobject); //post DOobject
					res.status(200).send("update DO");
				}
			} else {
				res.status(500).send("please check mandatory field");
			}
		} else {
			res.status(500).send("is not a json structure");
		}
	});
});

module.exports = router;
