const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());
const services = require("../../../../services");
const ErrorHandler = require("../../../../lib/error-handler");
/**
 * control Creation
 * @params {String} DOname
 * @body {String} name,controlCreator, controlDestinationType, controlDestination (required)
 * @returns {Json} {}
 * localhost:1005/DigitalTwin/DO/control?DO=DOname
 */
router.post("/", async function (req, res) {
   try {
      const { DO } = req.query;
      const {
         name,
         controlCreator,
         controlDestinationType,
         controlDestination,
      } = req.body;
      const result = await services.control.create({
         DO,
         name,
         controlCreator,
         controlDestinationType,
         controlDestination,
      });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/DO/control");
   }
});

/**
 * control 에 대한 command를 받아서 control 생성 시 작성한 url로 전송
 * @params {String} DOname, controlName
 * @body {String} sensorID : timestamp
 * @body {String} command
 * @returns {Json} {}
 * localhost:1005/DigitalTwin/DO/control?DO=<DOname>&control=<controlName>
 */
router.post("/command", async function (req, res) {
   try {
      const { DO, control } = req.query;
      const { sensorID, command } = req.body;
      const result = await services.control.receiveControlCommand({
         DO,
         control,
         sensorID,
         command,
      });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/DO/control");
   }
});

/**
 * control command에 대한 결과값으로 delivery response를 받아 저장
 * @params {String} DOname, controlName
 * @body {String} sensorID : timestamp
 * @body {String} command
 * @returns {Json} {}
 * localhost:1005/DigitalTwin/DO/control/response?DO=<DOname>&control=<controlName>
 */
router.post("/response", async function (req, res) {
   try {
      const { DO, control } = req.query;
      const { sensorID, response, qos } = req.body;
      const result = await services.control.receiveControlDeliveryResponse({
         DO,
         control,
         sensorID,
         response,
         qos,
      });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/DO/control");
   }
});

/* sensorID를 통해 저장된 control command와 deliveryresponse를 조회할 수 있음
 * control Retrieve
 * localhost:1005/DigitalTwin/DO/control?DO=<DOname>&control=<controlName>&sensorID=<ts>
 */
router.get("/", async (req, res) => {
   const { DO, control, sensorID } = req.query;
   try {
      const result = await services.control.get({ DO, control, sensorID });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/DO/control`);
   }
});

/* 저장된 control의 command를 최대 5개 조회할 수 있음
 * control data Retrieve
 * localhost:1005/DigitalTwin/DO/control/data?DO=<DOname>&control=<controlName>
 */
router.get("/data", async (req, res) => {
   const { DO, control } = req.query;
   try {
      const result = await services.control.getData({ DO, control });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/DO/control/data`);
   }
});

/*
 * control Delete
 * localhost:1005/DigitalTwin/DO/control?DO=<DOname>&control=<controlName>
 */
router.delete("/", async (req, res) => {
   const { DO, control } = req.query;
   try {
      const result = await services.control.delete({ DO, control });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Delete /DigitalTwin/DO/control`);
   }
});

/**
 * control Update
 * @params {String} DOname
 * @body {String} name,controlCreator, controlDestinationType, controlDestination (required)
 * @returns {Json} {}
 * localhost:1005/DigitalTwin/DO/control?DO=DOname
 */
router.put("/", async function (req, res) {
   try {
      const { DO } = req.query;
      const {
         name,
         controlCreator,
         controlDestinationType,
         controlDestination,
      } = req.body;
      const result = await services.control.update({
         DO,
         name,
         controlCreator,
         controlDestinationType,
         controlDestination,
      });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "PUT /DigitalTwin/DO/control");
   }
});

module.exports = router;
