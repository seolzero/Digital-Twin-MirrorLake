const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class simulationGroup {
	/**
	 * service create
	 * @param {String} name (required)
	 * @param {String} url (required)
	 * @returns {Boolean} true
	 */
	async craete({ name, arg, url }) {
		const model = new Model();

		const isExistName = await model.redis.checkNameExist({ name, key: "simulation" });
		if (isExistName) {
			throw new ErrorHandler(412, 5252, "already exist name.");
		}

		// redis의 "simulation" list에 새로 생길 simulation의 이름 추가
		await model.redis.rpush({ key: "simulation", name });
		// redis의 hmap set에 simulation 정보 추가
		await model.redis.hset({ key: `simulation_${name}`, field: "name", value: name });
		await model.redis.hset({ key: `simulation_${name}`, field: "arg", value: arg });
		await model.redis.hset({ key: `simulation_${name}`, field: "url", value: url });
	}
}

module.exports = simulationGroup;
