const mqtt = require("mqtt");
const config = require("../../config");
const { ip, port } = config.mqtt;

exports.init = () => {
	global.Mclient = mqtt.connect(`mqtt://${ip}:${port}`);

	Mclient.on("connect", () => {
		console.log(" > MQTT connected!", Mclient.connected);
	});

	Mclient.on("error", (error) => {
		console.log(" > MQTT disconnect!" + error);
		process.exit(1);
	});
};
