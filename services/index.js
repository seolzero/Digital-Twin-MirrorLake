const DO = require("./modules/DO");

class Service {
	#getInstance(_class) {
		const className = _class.name;

		// instance 최초 생성
		if (!this[className]) {
			this[className] = new _class();
		}

		return this[className];
	}

	get do() {
		return this.#getInstance(DO);
	}
}

module.exports = new Service();
