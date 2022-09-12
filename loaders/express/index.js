const express = require("express");
const http = require("http");
const port = 1005;

exports.init = ({ app }) => {
	// body parser
	app.use(express.json());
	app.use(
		express.urlencoded({
			extended: true,
		})
	);

	// response format
	app.use((req, res, next) => {
		res.success = function (statusCode = 200, data = {}) {
			res.status(statusCode).json(data);
		};

		res.fail = function (statusCode = 500, data = {}) {
			res.status(statusCode).json(data);
		};

		next();
	});

	// all
	app.all("/*", function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With, Authorization, Content-Type, X-Platform, X-Version");
		res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE, OPTIONS");
		res.header("Access-Control-Expose-Headers", "Content-Disposition");
		if (req.method === "OPTIONS") {
			return res.status(200).end();
		}
		next();
	});

	app.all("*"),
		function (req, res, next) {
			res.send("Bad Request (Wrong Url)", 404);
		};

	const server = http.createServer(app);
	server.listen(port, () => {
		console.log(`Server Start on port ${port}`);
	});

	return app;
};
