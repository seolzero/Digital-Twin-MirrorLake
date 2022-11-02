const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class serviceGroup {
   /**
    * service create
    * @param {String} name (required)
    * @param {Json} DO_arg (required)
    * @param {Json} SIM_arg (required)
    * @param {String} url (required)
    * @returns {Boolean} true
    */
   async create({ name, DO_arg, SIM_arg, url }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "service",
      });
      if (isExistName) {
         throw new ErrorHandler(412, 5252, "already exist name.");
      }

      // redis의 "service" list에 새로 생길 service의 이름 추가
      await model.redis.rpush({ key: "service", name });
      // redis의 hmap set에 service 정보 추가
      await model.redis.hset({
         key: `service_${name}`,
         field: "name",
         value: name,
      });
      await model.redis.hset({
         key: `service_${name}`,
         field: "DO_arg",
         value: JSON.stringify(DO_arg),
      });
      await model.redis.hset({
         key: `service_${name}`,
         field: "SIM_arg",
         value: JSON.stringify(SIM_arg),
      });
      await model.redis.hset({
         key: `service_${name}`,
         field: "url",
         value: url,
      });

      return { success: 1 };
   }

   /**
    * service update
    * @param {String} name (required)
    * @param {Json} DO_arg (required)
    * @param {Json} SIM_arg (required)
    * @param {String} url (required)
    * @returns {Boolean} true
    */
   async update({ name, DO_arg, SIM_arg, url }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "service",
      });
      if (!isExistName) {
         throw new ErrorHandler(412, 5252, "Unregistered service");
      }

      // redis의 hmap set에 service 정보 추가
      await model.redis.hset({
         key: `service_${name}`,
         field: "name",
         value: name,
      });
      await model.redis.hset({
         key: `service_${name}`,
         field: "DO_arg",
         value: JSON.stringify(DO_arg),
      });
      await model.redis.hset({
         key: `service_${name}`,
         field: "SIM_arg",
         value: JSON.stringify(SIM_arg),
      });
      await model.redis.hset({
         key: `service_${name}`,
         field: "url",
         value: url,
      });

      return { success: 1 };
   }

   /**
    * 저장된 service 조회
    * @param {string} name
    * @returns {Json}
    */
   async get({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "service",
      });
      // service이 존재하면 조회
      if (isExistName) {
         const keys = await model.redis.getKeys({ name: `service_${name}` });
         let resObject = {};
         for (let key of keys) {
            const value = await model.redis.getValue({
               name: `service_${name}`,
               key,
            });
            resObject[key] = value;
         }
         return resObject;
      } else {
         return "Unregistered service";
      }
   }

   /**
    *  service 삭제
    * @param {string} name
    * @returns {Json}
    */
   async delete({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "service",
      });
      // service이 존재하면 조회
      if (isExistName) {
         await model.redis.delete({ name: `service_${name}` });
         await model.redis.removeFromList({ name, key: "service" });
         await model.kafka.deleteSink(name);

         return { delete: name };
      } else {
         return "Unregistered service";
      }
   }
   /**
    *  service 모두 삭제
    * @returns {Json}
    */
   async allDelete() {
      const model = new Model();

      await model.redis.delete({ name: "service" });
      let NameList = await model.redis.getNameList("service").then((List) => {
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
    *  service trigger
    * @param {string} name
    * @returns {Json}
    */
   async trigger({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({
         name,
         key: "service",
      });
      // service이 존재하면 조회
      if (isExistName) {
         const keys = await model.redis.getKeys({ name: `service_${name}` });
         let resObject = {};
         for (let key of keys) {
            const value = await model.redis.getValue({
               name: `service_${name}`,
               key,
            });
            resObject[key] = value;
         }
         await model.kafka.CreateServiceSinkConnector(resObject);
         return resObject;
      } else {
         return "Unregistered service";
      }
   }
}

module.exports = serviceGroup;
