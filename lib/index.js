//get hash table
exports.getKeys = (Name) => {
	return new Promise((resolve) => {
		Rclient.hkeys(Name, function (err, keys) {
			resolve(keys);
		});
	});
};

//get hash table fliel value
exports.getValue = (Name, key) => {
	return new Promise((resolve, reject) => {
		Rclient.hget(Name, key, function (err, value) {
			if (err) reject(err);
			resolve(JSON.parse(value));
		});
	});
};

/**
 * json object 여부 체크
 * @param {Json} obj (required)
 * @returns {Booelan}
 */
exports.isObject = (obj) => {
	return obj?.constructor === {}.constructor || obj?.constructor.toString().includes("TextRow");
};

/**
 * json 데이터 형태인 string 값을 json으로 변환
 * @param {String} jsonString (required)
 * @returns {Json} obj
 */
exports.tryJSONparse = (jsonString) => {
	try {
		return JSON.parse(jsonString);
	} catch (e) {
		return false;
	}
};
