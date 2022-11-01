const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

const service = require("../../../services");
const ErrorHandler = require("../../../lib/error-handler");
/**
 * simulation Creation
 * @body {String} name (required)
 * @body {Json} arg (required)
 * @body {String} url (required)
 * @returns {Json} {}
 */
router.post("/", async function (req, res) {
   try {
      const { name, arg, url } = req.body;

      const result = await service.simulation.create({ name, arg, url });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `POST /DigitalTwin/simulationGroup ${e}`);
   }
});

/**
 * simulation Update
 * @body {String} name (required)
 * @body {Json} arg (required)
 * @body {String} url (required)
 * @returns {Json} {}
 */
router.put("/", async function (req, res) {
   try {
      const { name, arg, url } = req.body;

      const result = await service.simulation.update({ name, arg, url });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/simulationGroup");
   }
});

/**
 * simulation Retrieve
 * localhost:1005/DigitalTwin/simulationGroup?name=SIcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.get("/", async (req, res) => {
   const { name } = req.query;

   try {
      const result = await service.simulation.get({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/simulationGroup`);
   }
});

/**
 * simulation delete
 * localhost:1005/DigitalTwin/simulationGroup?name=SIcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.delete("/", async (req, res) => {
   const { name } = req.query;

   try {
      const result = await service.simulation.delete({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Delete /DigitalTwin/simulationGroup`);
   }
});

/**
 * simulation RT(RealTime) trigger
 * localhost:1005/DigitalTwin/simulationGroup/RTtrigger?name=SIcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.post("/RTtrigger", async function (req, res) {
   const { name } = req.query;

   try {
      const result = await service.simulation.rtTrigger({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `POST /DigitalTwin/simulationGroup/RTtrigger`);
   }
});

/**
 * simulation ST(StaticTime) trigger
 * localhost:1005/DigitalTwin/simulationGroup/STtrigger?name=SIcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.post("/STtrigger", async function (req, res) {
   const { name } = req.query;

   try {
      const result = await service.simulation.stTrigger({ name });
      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `POST /DigitalTwin/simulationGroup/STtrigger`);
   }
});

module.exports = router;
