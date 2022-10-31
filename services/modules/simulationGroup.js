const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class simulationGroup {
	/**
	 * simulation create
	 * @param {String} name (required)
	 * @param {String} arg (required)
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

		return { success: 1 };
	}

	/**
	 * simulation update
	 * @param {String} name (required)
	 * @param {String} arg (required)
	 * @param {String} url (required)
	 * @returns {Boolean} true
	 */
	async update({ name, arg, url }) {
		const model = new Model();

		const isExistName = await model.redis.checkNameExist({ name, key: "simulation" });
		if (!isExistName) {
			throw new ErrorHandler(412, 5252, "Unregistered simulation");
		}

		// redis의 hmap set에 simulation 정보 추가
		await model.redis.hset({ key: `simulation_${name}`, field: "name", value: name });
		await model.redis.hset({ key: `simulation_${name}`, field: "arg", value: arg });
		await model.redis.hset({ key: `simulation_${name}`, field: "url", value: url });

		return { success: 1 };
	}

	/**
	 * 저장된 simulation 조회
	 * @param {string} name
	 * @returns {Json}
	 */
	async get({ name }) {
		const model = new Model();

		const isExistName = await model.redis.checkNameExist({ name, key: "simulation" });
		// simulation이 존재하면 조회
		if (isExistName) {
			const keys = await model.redis.getKeys({ name: `simulation_${name}` });
			let resObject = {};
			for (let key of keys) {
				const value = await model.redis.getValue({ name: `simulation_${name}`, key });
				resObject[key] = value;
			}
			return resObject;
		} else {
			return "Unregistered simulation";
		}
	}
}

module.exports = simulationGroup;
