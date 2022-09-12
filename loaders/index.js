const globalLoader = require("./global");
const expressLoader = require("./express");
const mqttLoader = require("./mqtt");
const flinkLoader = require("./flink");
const kafkaLoader = require("./kafka");
const redisLoader = require("./redis");

exports.start = async ({ app }) => {
	globalLoader.init();
	expressLoader.init({ app });
	mqttLoader.init();
	flinkLoader.init();
	kafkaLoader.init();
	redisLoader.init();

	console.log("\nall loaders initialized\n");
};
