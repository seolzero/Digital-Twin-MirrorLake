const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());
const fs = require("fs");

const dirs = fs.readdirSync(__dirname).filter((d) => fs.lstatSync(__dirname + "/" + d).isDirectory());

dirs.forEach((dir) => {
	if (dir == "DO") {
		const r = require("./" + dir);
		router.use("/" + dir, r);
		console.log("\t/" + dir);
	}
});

module.exports = router;
