class DO {
	getNameList(key) {
		return new Promise((resolve) => {
			Rclient.lrange(key, 0, -1, function (err, keys) {
				if (err) throw err;
				resolve(keys);
			});
		});
	}

	async checkNameExist(Name, key) {
		let NameList = await getNameList(key).then((List) => {
			return List;
		});
		let flag = false;
		return new Promise((resolve, reject) => {
			for (i in NameList) {
				if (NameList[i] == Name) {
					flag = true;
				}
			}
			resolve(flag);
		});
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
