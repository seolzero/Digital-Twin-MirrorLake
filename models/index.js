const Flink = require("./modules/flink");
const Redis = require("./modules/redis");

class Models {
	#getInstance(_class) {
		const className = _class.name;

		// instance 최초 생성
		if (!this[className]) {
			this[className] = new _class();
		}

		return this[className];
	}

	get flink() {
		return this.#getInstance(Flink);
	}

	get redis() {
		return this.#getInstance(Redis);
	}
}

module.exports = Models;
