const config = require("../../config");
const { hostname, port } = config.flink;

class Flink {
	constructor() {
		if (!global.SESSION_ID) {
			throw "Undefined flink session ID";
		}

		this.gwOptions = {
			hostname,
			port,
			path: `/v1/sessions/${global.SESSION_ID}/statements`,
			method: POST,
		};
	}

	createDOTable(DOobject) {
		console.log("create DO Table");
		const DOName = DOobject.name;

		// Create DO Table
		let createStreamSQL = {
			statement: ``,
		};

		// Get Sensor List from DO Object
		let sensorList = DOobject.sensor;
		console.log(sensorList);

		if (sensorList.length == 1) {
			createStreamSQL.statement = `CREATE TABLE ${DOName}(tmpA BIGINT, sensor1_id STRING, sensor1_value STRING, sensor1_rowtime TIMESTAMP(3), PRIMARY KEY (tmpA) NOT ENFORCED) WITH ('connector' = 'upsert-kafka', 'topic' = 'DO_${DOName}','properties.bootstrap.servers' = '${config.kafkaHost}', 'key.format' = 'json', 'value.format' = 'json')`;
		} else {
			createStreamSQL.statement = `CREATE TABLE ${DOName} (tmpA BIGINT, sensor1_rowtime TIMESTAMP(3), `;

			for (i = 1; i <= sensorList.length; i++) {
				createStreamSQL.statement += `sensor${i}_id STRING, sensor${i}_value STRING, `;
			}

			createStreamSQL.statement += `PRIMARY KEY (tmpA) NOT ENFORCED) WITH('connector' = 'upsert-kafka', 'topic' = 'DO_${DOName}','properties.bootstrap.servers' = '${config.kafkaHost}', 'key.format' = 'json', 'value.format' = 'json')`;
		}

		console.log("createStreamSQL: ", createStreamSQL);

		let insertTableSQL = {
			statement: `INSERT INTO ${DOName} select `,
		};

		if (sensorList.length == 1) {
			insertTableSQL.statement += `${sensorList[0]}.tmp, ${sensorList[0]}.sensor_id, ${sensorList[0]}.sensor_value, ${sensorList[0]}.sensor_rowtime FROM ${sensorList[0]}`;
		} else {
			insertTableSQL.statement += `${sensorList[0]}.tmp, ${sensorList[0]}.sensor_rowtime, `;

			for (i = 0; i < sensorList.length; i++) {
				insertTableSQL.statement += `${sensorList[i]}.sensor_id, ${sensorList[i]}.sensor_value `;
				if (i != sensorList.length - 1) {
					insertTableSQL.statement += `, `;
				} else if (i == sensorList.length - 1) {
					insertTableSQL.statement += `from  ${sensorList[0]} `;
				}
			}

			for (i = 0; i < sensorList.length - 1; i++) {
				insertTableSQL.statement += `left join ${sensorList[i + 1]} for system_time as of ${sensorList[i]}.sensor_rowtime on ${sensorList[i + 1]}.tmp=${sensorList[i]}.tmp `;
			}
		}

		console.log("insertTableSQL: ", insertTableSQL);

		//Send Request to sql-gateway Server
		var request = http.request(this.gwOptions, function (response) {
			let fullBody = "";

			response.on("data", function (chunk) {
				fullBody += chunk;
			});

			response.on("end", function () {
				console.log(fullBody);
				console.log("Insert Sensor Table to DO Table");

				var insertRequest = http.request(this.gwOptions, function (insertResponse) {
					let fullBody = "";

					insertResponse.on("data", function (chunk) {
						fullBody += chunk;
					});

					insertResponse.on("end", function () {
						console.log(fullBody);
					});

					insertResponse.on("error", function (error) {
						console.error(error);
					});
				});
				insertRequest.write(JSON.stringify(insertTableSQL));
				insertRequest.end();
			});

			response.on("error", function (error) {
				console.error(error);
			});
		});
		request.write(JSON.stringify(createStreamSQL));
		request.end();
	}
}

module.exports = Flink;
