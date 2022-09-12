const colors = require("colors/safe");

class ErrorHandler {
	constructor(statusCode, errorCode, msg) {
		this.statusCode = statusCode || 500;
		this.errorCode = errorCode || 9999;
		this.msg = msg || "알 수 없는 에러";
	}

	handle(req, res, option) {
		console.log(`!! Error Occur ${colors.red(this.errorCode)} - ${new Date().toLocaleString()}`);
		console.log(`Message : ${colors.green(this.msg)}`);
		console.log(`URL : ${req.method} ${colors.bold(req.originalUrl)}`);
		console.log("Request : ");

		if (req.method === "GET" || req.method === "DELETE") {
			console.log(req.query);
		} else {
			console.log(req.body);
		}

		res.fail(this.statusCode, {
			code: this.errorCode,
			msg: this.msg,
		});
	}
}

module.exports = ErrorHandler;
