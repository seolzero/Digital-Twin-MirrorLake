const globalLoader = require("./global");
const expressLoader = require("./express");
const mqttLoader = require("./mqtt");
const redisLoader = require("./redis");
const postgresLoader = require("./postgres");

exports.start = async ({ app }) => {
	globalLoader.init();
	expressLoader.init({ app });
	mqttLoader.init();
	redisLoader.init();
	postgresLoader.init();
	console.log("\nall loaders initialized\n");
};
