const where = require("lodash.where");
const Model = require("../../models");
const ErrorHandler = require("../../lib/error-handler");
class Control {
   /**
    * DO내부에 contol생성
    * DO가 존재하는지 확인
    * DO 에 control 이 있는지 확인
    * control이 있으면 등록된 control인지 확인
    *                   등록된 control이면 throw
    *                   없으면 DO obj에 contol추가, controlCount++,
    *                          redis hset저장 controlName, {key:value}
    * control이 없으면 DOobj.control, controlCount 추가
    * redis에 control 저장: hset으로 controlName, {key:value}
    * @param {*} param0
    * @returns
    */
   async create({
      DOname,
      name,
      controlCreator,
      controlDestinationType,
      controlDestination,
   }) {
      if (!DOname || !name) {
         throw new ErrorHandler(412, 5252, "please check mandatory field.");
      }

      const model = new Model();

      const isExistDOName = await model.redis.checkNameExist({
         name: DOname,
         key: "DO",
      });
      if (isExistDOName) {
         //DO있으면

         let DOobj = await model.redis.get({ name: DOname });
         console.log("DOobj: ", DOobj);
         if (DOobj.control) {
            var filtered = where(element.control, {
               name: name,
            });
            if (filtered[0]) {
               console.log("same control name exist: ", filtered[0]);
               throw new ErrorHandler(412, 5252, "control alredy exist.");
            } else {
               DOobj.control.push(controlNameObject);
               DOobj.controlCount++;
               console.log("push: ", DOobj);
               return DOobj;
            }
         } else {
            DOobj.control = [
               {
                  name,
                  controlCreator,
                  controlDestinationType,
                  controlDestination,
               },
            ];
            DOobj.controlCount = 1;
            return DOobj;
         }
      } else {
         throw new ErrorHandler(412, 5252, "Does not exist DOname.");
      }

      // redis에 key:value 데이터 생성
      const obj = {
         name,
         sensor,
         sensorCount: sensor.length,
         creationTime: new Date().getTime(),
      };
      await model.redis.set({ name, obj });

      //create table
      await model.Postgres.create();

      return obj;
   }
}
module.exports = Control;
