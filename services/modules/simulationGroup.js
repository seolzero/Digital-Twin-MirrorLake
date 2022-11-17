const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class simulationGroup {
   /**
    * simulation create
    * @param {String} name (required)
    * @param {Json} arg (required)
    * @param {String} url (required)
    * @returns {Boolean} true
    */
   async create({ name, arg, url }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "simulation",
      });
      if (isExistName) {
         throw new ErrorHandler(412, 5252, "already exist name.");
      }

      // redis의 "simulation" list에 새로 생길 simulation의 이름 추가
      await model.redis.rpush({ key: "simulation", name });
      // redis의 hmap set에 simulation 정보 추가
      const requestArr = [];
      for (let key in arguments[0]) {
         let value = arguments[0][key];
         if (key == "arg") {
            value = JSON.stringify(arguments[0][key]);
         }
         requestArr.push({ key: `simulation_${name}`, field: key, value });
      }
      await Promise.all(requestArr.map((index) => model.redis.hset(index)));
      return { success: name };
   }

   /**
    * simulation update
    * @param {String} name (required)
    * @param {Json} arg (required)
    * @param {String} url (required)
    * @returns {Boolean} true
    */
   async update({ name, arg, url }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "simulation",
      });
      if (!isExistName) {
         throw new ErrorHandler(412, 5252, "Unregistered simulation");
      }

      const requestArr = [];
      for (let key in arguments[0]) {
         let value = arguments[0][key];
         if (key == "arg") {
            value = JSON.stringify(arguments[0][key]);
         }
         requestArr.push({ key: `simulation_${name}`, field: key, value });
      }
      const result = await Promise.all(
         requestArr.map((index) => model.redis.hset(index))
      );
      return { success: name };
   }

   /**
    * 저장된 simulation 조회
    * @param {string} name
    * @returns {Json}
    */
   async get({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "simulation",
      });
      // simulation이 존재하면 조회
      if (isExistName) {
         const keys = await model.redis.getKeys({ name: `simulation_${name}` });
         let resObject = {};
         for (let key of keys) {
            const value = await model.redis.getValue({
               name: `simulation_${name}`,
               key,
            });
            resObject[key] = value;
         }
         return resObject;
      } else {
         return "Unregistered simulation";
      }
   }

   /**
    * 저장된 모든 simulation의 이름 조회
    * @returns {List}
    */
   async getAll() {
      const model = new Model();
      let simulationNameEntireList = await model.redis.getNameList(
         "simulation"
      );

      return simulationNameEntireList;
   }
   /**
    *  simulation 삭제
    * @param {string} name
    * @returns {Json}
    */
   async delete({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "simulation",
      });
      // simulation이 존재하면 조회
      if (isExistName) {
         await model.redis.delete({ name: `simulation_${name}` });
         await model.redis.removeFromList({ name, key: "simulation" });
         await model.kafka.deleteSink(name);

         return { delete: name };
      } else {
         return "Unregistered simulation";
      }
   }

   /**
    *  simulation 모두 삭제
    * @returns {Json}
    */
   async allDelete() {
      const model = new Model();

      await model.redis.delete({ name: "simulation" });
      let NameList = await model.redis
         .getNameList("simulation")
         .then((List) => {
            return List;
         });
      new Promise((resolve, reject) => {
         for (i in NameList) {
            model.redis.delete({ name: i });
         }
         resolve(NameList);
      });

      return { delete: NameList };
   }

   /**
    *  simulation RT(RealTime) trigger
    * @param {string} name
    * @returns {Json}
    */
   async rtTrigger({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "simulation",
      });
      // simulation이 존재하면 조회
      if (isExistName) {
         const keys = await model.redis.getKeys({ name: `simulation_${name}` });
         let resObject = {};
         for (let key of keys) {
            const value = await model.redis.getValue({
               name: `simulation_${name}`,
               key,
            });
            resObject[key] = value;
         }
         await model.kafka.CreateSimulationSinkConnector(resObject);
         return resObject;
      } else {
         return "Unregistered simulation";
      }
   }

   /**
    *  simulation ST(StaticTime) trigger
    * @param {string} name
    * @returns {Json}
    */
   async stTrigger({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "simulation",
      });
      // simulation이 존재하면 조회
      if (isExistName) {
         const keys = await model.redis.getKeys({ name: `simulation_${name}` });
         let resObject = {};
         for (let key of keys) {
            const value = await model.redis.getValue({
               name: `simulation_${name}`,
               key,
            });
            resObject[key] = value;
         }
         await model.kafka.CreateSimulationSinkConnector(resObject);
         return resObject;
      } else {
         return "Unregistered simulation";
      }
   }
}

module.exports = simulationGroup;
