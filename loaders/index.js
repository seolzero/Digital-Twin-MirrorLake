const globalLoader = require("./global");
const mqttLoader = require("./mqtt");

exports.start = async ({ app }) => {
	// mqtt
	mqtt.init();

	// express
	await expressLoader.init({ app });

	console.log("\nall loaders initialized\n");
};
