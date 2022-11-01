const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class DO {
   /**
    * sensor 데이터를 담은 data object 생성
    *  1. redis에 중복된 이름 있는지 확인
    *  2. DO 이름이 담긴 배열에 새로운 DO name추가
    *  3. redis에 set으로 DO 저장 {key: DOname , value: DOobject}
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
      await model.redis.rpush({ key: "DO", name });

      // redis에 key:value 데이터 생성
      const obj = {
         name,
         sensor,
         sensorCount: sensor.length,
         creationTime: new Date().getTime(),
      };
      await model.redis.set({ name, obj });

      // flink를 이용해 kafka에 DO 테이블 생성
      await model.flink.createDOTable({ obj });

      return obj;
   }

   /**
    * 특정 DO 조회
    * @param {string} name
    * @returns {Json}
    */
   async get({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({ name, key: "DO" });
      // DOname이 존재하면 조회
      if (isExistName) {
         const result = await model.redis.get({ name });

         return result;
      } else {
         return "Unregistered DO";
      }
   }

   /**
    * 저장된 모든 DO의 이름 조회
    * @returns {List}
    */
   async getAll() {
      const model = new Model();
      let DONameEntireList = await model.redis.getNameList("DO");

      return DONameEntireList;
   }

   /**
    * 저장된 DO 수정
    * @param {String} name (required)
    * @param {String Array} sensor (required)
    * @returns {Json} {}
    */
   async update({ name, sensor }) {
      if (!name || !sensor || sensor.length < 1) {
         throw new ErrorHandler(412, 5252, "please check mandatory field.");
      }

      const model = new Model();

      const isExistName = await model.redis.checkNameExist({ name, key: "DO" });
      if (!isExistName) {
         throw new ErrorHandler(412, 5252, "Unregistered DO");
      }

      // redis에 key:value 데이터 생성
      const obj = {
         name,
         sensor,
         sensorCount: sensor.length,
         creationTime: new Date().getTime(),
      };
      await model.redis.set({ name, obj });

      // flink DO 테이블 수정
      await model.flink.updateDOTable({ obj });

      return obj;
   }

   /**
    * 저장된 DO 삭제
    * @param {string} name
    * @returns {Json}
    */
   async delete({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({ name, key: "DO" });
      if (isExistName) {
         await model.redis.delete({ name });
         await model.redis.removeFromList({ name, key: "DO" });

         return { delete: name };
      } else {
         return "Unregistered DO";
      }
   }

   /**
    * 저장된 모든 DO 삭제
    * @returns {}
    */
   async deleteAll() {
      const model = new Model();

      const result = await model.redis.delete({ name: "DO" });

      return { delete: result };
   }

   /**
    * DO object 에 sensor와 control의 개수를 field를 추가
    * @param {Json} DOWholeData
    * @returns {Json}
    */
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
