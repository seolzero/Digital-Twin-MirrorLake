const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

const services = require("../../../services");
const ErrorHandler = require("../../../lib/error-handler");

/**
 * DO Creation
 * @body {String} name (required)
 * @body {String Array} sensor (required)
 * @returns {Json} {}
 */
router.post("/", async function (req, res) {
   try {
      const { name, sensor, control } = req.body;

      const result = await services.do.create({ name, sensor, control });
      //DO save -> DigitalBase(postgreSQL)
      await services.do.saveDO2DigitalBase({ name });
      if (control) {
         await services.control.createControlWithDO(name, control);
      }
      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/DO");
   }
});

/*
 * DO Retrieve
 * localhost:1005/DigitalTwin/DO?name=DOcrain26
 */
router.get("/", async (req, res) => {
   const { name } = req.query;
   try {
      const result = await services.do.get({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/DO`);
   }
});

/*
 * DO Entire Retrieve
 */
router.get("/all", async function (req, res) {
   try {
      const result = await services.do.getAll();

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/DO/all`);
   }
});

/*
 * DO DELETE
 * localhost:1005/DigitalTwin/DO?name=DOcrain26
 */
router.delete("/", async (req, res) => {
   const { name } = req.query;
   try {
      const result = await services.do.delete({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/DO/all`);
   }
});

/*
 * DO Entire Delete
 */
router.delete("/all", async function (req, res) {
   try {
      const result = await services.do.deleteAll();

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/DO/all`);
   }
});

/*
 * DO UPDATE
 * flink alter table 구현X  * delete하고 새로 생성하는 방식으로 가면 될듯
 * CREATE TABLE DOt (tmpA BIGINT, sensor1_rowtime TIMESTAMP(3), sensor1_id STRING, sensor1_value STRING, sensor2
_id STRING, sensor2_value STRING, PRIMARY KEY (tmpA) NOT ENFORCED) WITH('connector' = 'upsert-kafka', 'topic' = 'DO_DOcr
ain26','properties.bootstrap.servers' = 'localhost:9092', 'key.format' = 'json', 'value.format' = 'json');
 * alter table DOt SET  ('tmpA'='ssul1');
 * org.apache.flink.table.api.ValidationException: Unsupported options found for connector 'upsert-kafka'.
 */
router.put("/", async (req, res) => {
   try {
      const { name, sensor } = req.body;

      const result = await services.do.update({ name, sensor });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "UPDATE /DigitalTwin/DO");
   }
});

router.use("/control", require("./control"));

module.exports = router;
