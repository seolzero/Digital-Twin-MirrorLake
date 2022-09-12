class Redis {
	/**
	 * redis의 특정 키에 저장된 모든 이름 조회
	 * @param {String} key (required)
	 * @returns {String Array} [] redis에 저장된 모든 key들의 이름
	 */
	async getNameList(key) {
		const nameList = await new Promise((resolve) => {
			Rclient.lrange(key, 0, -1, function (err, keys) {
				if (err) throw err;
				resolve(keys);
			});
		});

		return nameList;
	}

	/**
	 * redis의 특정 키에 해당 이름이 사용 여부 체크
	 * @param {String} name (required)
	 * @param {String} key (required)
	 * @returns {Boolean} true = 이미 존재 하는 이름
	 */
	async checkNameExist({ name, key }) {
		let flag = false;

		const nameList = await this.getNameList(key);

		if (nameList.some((existName) => existName == name)) {
			flag = true;
		}

		return flag;
	}
}

module.exports = Redis;
