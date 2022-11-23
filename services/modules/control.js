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
      const createSQL = `create table ${DO}_${name} (timestamp character varying, command character varying, deliveryResponse character varying);`;

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
               throw new ErrorHandler(412, 5252, "control alredy exist.");
            } else {
               DOobj.control.push(controlNameObject);
               DOobj.controlCount++;
               model.postgres.sendQuery({ sql: createSQL });
               await model.redis.set({ name: DO, obj: DOobj });
               return DOobj;
            }
         } else {
            model.postgres.sendQuery({ sql: createSQL });
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
            await Promise.all(
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
               filtered[0].controlDestination;
               const insertSQL = `insert into ${DO}_${control} values('${sensorID}', '${command}');`;
               await model.postgres.sendQuery({ sql: insertSQL });
               await lib.request({
                  url: `${filtered[0].controlDestination}`,
                  bodyParams: {
                     DOname: DO,
                     controlName: control,
                     sensorID,
                     command,
                  },
               });
               await model.redis.publish({
                  channel: "control",
                  message: {
                     DOname: DO,
                     controlName: control,
                     sensorID,
                     command,
                  },
               });
               return filtered[0];
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
    * @param {*} response control command
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
               const updateSQL = `update ${DO}_${control} set deliveryresponse = '${response}' where timestamp='${sensorID}';`;

               const result = await model.postgres.sendQuery({
                  sql: updateSQL,
               });
               return filtered[0];
            } else {
               throw new ErrorHandler(412, 5252, "control does not exist.");
            }
         }
      } else {
         throw new ErrorHandler(412, 5252, "DO does not exist.");
      }
   }

   /**
    * DO와 control이 존재하는지 조회하고 sensorID로 delivery response를 조회
    * @param {*} DO DOname
    * @param {*} control control name
    * @param {*} sensorID timestamp
    */
   async get({ DO, control, sensorID }) {
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
               const selectSQL = `select * from ${DO}_${control} where timestamp='${sensorID}';`;
               const result = await model.postgres.selectData({
                  sql: selectSQL,
               });
               return result;
            } else {
               throw new ErrorHandler(412, 5252, "control does not exist.");
            }
         }
      } else {
         throw new ErrorHandler(412, 5252, "DO does not exist.");
      }
   }

   /**
    * DO와 control이 존재하는지 조회하고 sensorID로 delivery response를 조회
    * @param {*} DO DOname
    * @param {*} control control name
    * @param {*} sensorID timestamp
    */
   async getData({ DO, control }) {
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
               const selectSQL = `select * from ${DO}_${control} order by timestamp desc limit 5;`;
               const result = await model.postgres.selectDataS({
                  sql: selectSQL,
               });
               return result;
            } else {
               throw new ErrorHandler(412, 5252, "control does not exist.");
            }
         }
      } else {
         throw new ErrorHandler(412, 5252, "DO does not exist.");
      }
   }

   /**
    * DO와 control이 존재하는지 조회하고 control 삭제
    * @param {*} DO DOname
    * @param {*} control control name
    */
   async delete({ DO, control }) {
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
               var controlIndex = DOobj.control.findIndex(
                  (i) => i.name == control
               );
               DOobj.control.splice(controlIndex, 1);
               DOobj.controlCount--;
               await model.redis.set({ name: DO, obj: DOobj });
               await model.redis.delete({ name: control });
               const dropSQL = `drop table ${DO}_${control};`;
               const result = await model.postgres.sendQuery({
                  sql: dropSQL,
               });

               return DOobj;
            } else {
               throw new ErrorHandler(412, 5252, "control does not exist.");
            }
         }
      } else {
         throw new ErrorHandler(412, 5252, "DO does not exist.");
      }
   }

   /**
    * command를 받으면 등록된 control을 조회하여 update
    */
   async update({
      DO,
      name,
      controlCreator,
      controlDestinationType,
      controlDestination,
   }) {
      const model = new Model();
      const controlNameObject = arguments[0];
      delete controlNameObject.DO;
      let DOobj = await model.redis.get({ name: DO });
      console.log("DOobj: ", DOobj);
      if (DOobj) {
         //DO가 null이 아니면
         if (DOobj.control) {
            var filtered = where(DOobj.control, {
               name: name,
            });
            if (filtered[0]) {
               //control이 null이 아니면
               var controlIndex = DOobj.control.findIndex(
                  (i) => i.name == name
               );

               DOobj.control.splice(controlIndex, 1);
               DOobj.control.push(controlNameObject);
               await model.redis.set({ name: DO, obj: DOobj });

               return DOobj;
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
const createSQL = `create table ${DO}_${control} (timestamp character varying, command character varying, deliveryResponse character varying);`;
const insertSQL = `insert into ${DO}_${control} values(${sensorID}, '${controlCommand}', '${deliveryResponse}');`;
const updateSQL = `update ${DO}_${control} set deliveryresponse = ${deliveryResponse} where timestamp=${sensorID};`;
const dropSQL = `drop table ${DO}_${control};`;
const selectSQL = `select * from ${DO}_${control} where timestamp=${sensorID};`;
*/
