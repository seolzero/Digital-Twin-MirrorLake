const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class DO {
	/**
	 * sensor 데이터를 담은 data object 생성
	 *  1. redis에 중복된 이름 있는지 확인
	 *  2.
	 * @param {String} name (required)
	 * @param {String Array} sensor (required)
	 * @returns {Json} {}
	 */
	async create({ name, sensor }) {
		if (!name || !sensor || sensor.length < 1) {
			throw new ErrorHandler(412, 5252, "please check mandatory field.");
		}

		const model = new Model();

		const isExistName = await model.redis.checkNameExist({ name, key: "DO" });
		if (isExistName) {
			throw new ErrorHandler(412, 5252, "already exist name.");
		}

		// redis의 "DO" list에 새로 생길 DO의 이름 추가
		Rclient.rpush("DO", name);

		// redis에 key:value 데이터 생성
		const params = {
			name,
			sensor,
			sensorCount: sensor.length,
			creationTime: new Date().getTime(),
		};
		Rclient.set(name, JSON.stringify(params));

		// flink를 이용해 kafka에 DO 테이블 생성
		await model.flink.createDOtable({ params });

		return params;
	}

	CheckKeyExistAndAddCount(DOWholeData) {
		if (Object.keys(DOWholeData).some((v) => v == "sensor")) {
			DOWholeData.sensorCount = DOWholeData.sensor.length;
		}
		if (Object.keys(DOWholeData).some((v) => v == "control")) {
			DOWholeData.controlCount = DOWholeData.control.length;
		}
		DOWholeData.creationTime = new Date().getTime();
		return DOWholeData;
	}
}

module.exports = DO;
