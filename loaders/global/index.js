exports.init = () => {
	global.http = require("http");
	global.DateTime = require("luxon").DateTime;
	global.util = require("util");
	global.where = require("lodash.where");
};
