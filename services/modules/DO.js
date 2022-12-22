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
   async create({ name, sensor, control }) {
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

      if (!control) {
         //control이 없으면 센서정보만 등록
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
         // redis의 "DO" list에 새로 생길 DO의 이름 추가
         await model.redis.rpush({ key: "DO", name });
         return obj;
      } else {
         //control이 있으면 포함해서 등록
         const obj = {
            name,
            sensor,
            control,
            sensorCount: sensor.length,
            controlCount: control.length,
            creationTime: new Date().getTime(),
         };
         await model.redis.set({ name, obj });
         // flink를 이용해 kafka에 DO 테이블 생성
         await model.flink.createDOTable({ obj });
         // redis의 "DO" list에 새로 생길 DO의 이름 추가
         await model.redis.rpush({ key: "DO", name });
         return obj;
      }
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
      // flink table 삭제 후 재 생성 필요
      await model.flink.dropTable({ name });
      await model.flink.createDOTable({ obj });

      return obj;
   }

   /**
    * 저장된 DO 삭제
    * @param {string} name
    * @returns {Json}
   
   async delete({ name }) {
      const model = new Model();

      const isExistName = await model.redis.checkNameExist({ name, key: "DO" });
      if (isExistName) {
         await model.redis.delete({ name });
         await model.redis.removeFromList({ name, key: "DO" });
         await model.flink.dropTable({ name });
         return { delete: name };
      } else {
         return "Unregistered DO";
      }
   }
    */

   /**
    * 저장된 DO & control 삭제
    * @param {string} name
    * @returns {Json}
    */
   async delete({ name }) {
      const model = new Model();

      let DOobj = await model.redis.get({ name: name });
      console.log("DOobj: ", DOobj);
      if (DOobj) {
         //DO가 null이 아니면
         await model.redis.delete({ name });
         await model.redis.removeFromList({ name, key: "DO" });
         await model.flink.dropTable({ name });

         if (DOobj.control) {
            DOobj.control.forEach(async (index) => {
               console.log(index);
               await model.redis.delete({ name: index.name });
               const dropSQL = `drop table ${name}_${index.name};`;
               await model.postgres.sendQuery({
                  sql: dropSQL,
               });
            });
         }
      } else {
         throw new ErrorHandler(412, 5252, "Unregistered DO");
      }

      return { delete: name };
   }

   /**
    * 저장된 모든 DO 삭제
    * @returns {}
    */
   async deleteAll() {
      const model = new Model();

      await model.redis.delete({ name: "DO" });
      const keys = await model.redis.getListLength_delete({ key: "DO" });
      keys.forEach(async (key) => {
         Rclient.DEL(key);
         await model.flink.dropTable({ name: key });
         if (key.control) {
            key.control.forEach(async (index) => {
               console.log(index);
               await model.redis.delete({ name: index.name });
               const dropSQL = `drop table ${key}_${index.name};`;
               await model.postgres.sendQuery({
                  sql: dropSQL,
               });
            });
         }
      });

      return { delete: keys.length };
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

   async saveDO2DigitalBase({ name }) {
      const model = new Model();

      const result = await model.kafka.postgresJBDCconnector({ name });
      return result;
   }
}

module.exports = DO;
