const lib = require("../../lib");
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
      DO,
      name,
      controlCreator,
      controlDestinationType,
      controlDestination,
   }) {
      if (!DO || !name) {
         throw new ErrorHandler(412, 5252, "please check mandatory field.");
      }
      const createSQL = `create table ${name} (timestamp character varying, command character varying, deliveryResponse character varying);`;

      const model = new Model();

      const controlNameObject = {
         name,
         controlCreator,
         controlDestinationType,
         controlDestination,
      };
      const isExistDO = await model.redis.checkNameExist({
         name: DO,
         key: "DO",
      });
      if (isExistDO) {
         //DO있으면

         let DOobj = await model.redis.get({ name: DO });
         console.log("DOobj: ", DOobj);
         if (DOobj.control) {
            var filtered = where(DOobj.control, {
               name: name,
            });
            if (filtered[0]) {
               console.log("same control name exist: ", filtered[0]);
               throw new ErrorHandler(412, 5252, "control alredy exist.");
            } else {
               DOobj.control.push(controlNameObject);
               DOobj.controlCount++;
               model.postgres.createTable({ sql: createSQL });
               console.log("push: ", DOobj);
               await model.redis.set({ name: DO, obj: DOobj });
               return DOobj;
            }
         } else {
            model.postgres.createTable({ sql: createSQL });
            DOobj.control = [controlNameObject];
            DOobj.controlCount = 1;
            await model.redis.set({ name: DO, obj: DOobj });
            const requestArr = [];
            for (let key in arguments[0]) {
               let value = arguments[0][key];
               requestArr.push({
                  key: name,
                  field: key,
                  value,
               });
            }
            const result = await Promise.all(
               requestArr.map((index) => model.redis.hset(index))
            );
            return DOobj;
         }
      } else {
         throw new ErrorHandler(412, 5252, "Does not exist DO.");
      }
   }

   /**
    * command를 받으면 등록된 control을 조회하여 controlDestination으로 controlCommand를 post
    * @param {*} DO DOname
    * @param {*} control control name
    * @param {*} sensorID timestamp
    * @param {*} command control command
    */
   async receiveControlCommand({ DO, control, sensorID, command }) {
      const model = new Model();

      let DOobj = await model.redis.get({ name: DO });
      console.log("DOobj: ", DOobj);
      if (DOobj) {
         //DO가 null이 아니면
         if (DOobj.control) {
            var filtered = where(DOobj.control, {
               name: control,
            });
            if (filtered[0]) {
               //control이 null이 아니면
               console.log(filtered[0]);
               filtered[0].controlDestination;
               const insertSQL = `insert into ${control} values('${sensorID}', '${command}');`;
               console.log(insertSQL);
               await model.postgres.createTable({ sql: insertSQL });
               await lib.request({
                  url: `${filtered[0].controlDestination}`,
                  bodyParams: { command },
               });
            } else {
               throw new ErrorHandler(412, 5252, "control does not exist.");
            }
         }
      } else {
         throw new ErrorHandler(412, 5252, "DO does not exist.");
      }
   }

   /**
    * command를 받으면 등록된 control을 조회하여 controlDestination으로 controlCommand를 post
    * @param {*} DO DOname
    * @param {*} control control name
    * @param {*} sensorID timestamp
    * @param {*} command control command
    */
   async receiveControlDeliveryResponse({ DO, control, sensorID, response }) {
      const model = new Model();

      let DOobj = await model.redis.get({ name: DO });
      console.log("DOobj: ", DOobj);
      if (DOobj) {
         //DO가 null이 아니면
         if (DOobj.control) {
            var filtered = where(DOobj.control, {
               name: control,
            });
            if (filtered[0]) {
               //control이 null이 아니면
               console.log(filtered[0]);
               const updateSQL = `update ${control} set deliveryresponse = '${response}' where timestamp='${sensorID}';`;

               await model.postgres.createTable({ sql: updateSQL });
            } else {
               throw new ErrorHandler(412, 5252, "control does not exist.");
            }
         }
      } else {
         throw new ErrorHandler(412, 5252, "DO does not exist.");
      }
   }
}
module.exports = Control;
/*
const createSQL = `create table ${name} (timestamp character varying, command character varying, deliveryResponse character varying);`;
const insertSQL = `insert into ${name} values(${sensorID}, '${controlCommand}', '${deliveryResponse}');`;
const updateSQL = `update ${name} set deliveryresponse = ${deliveryResponse} where timestamp=${sensorID};`;
const dropSQL = `drop table tempctl;`;
const selectSQL = `select * from ${name} where timestamp=${sensorID};`;
*/
