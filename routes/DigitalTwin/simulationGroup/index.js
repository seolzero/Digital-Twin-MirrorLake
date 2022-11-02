const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

const services = require("../../../services");
const ErrorHandler = require("../../../lib/error-handler");
/**
 * simulation Creation
 * localhost:1005/DigitalTwin/simulationGroup
 * @body {String} name (required)
 * @body {Json} arg (required)
 * @body {String} url (required)
 * @returns {Json} {}
 */
router.post("/", async function (req, res) {
   try {
      const { name, arg, url } = req.body;

      const result = await services.simulation.create({ name, arg, url });

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
 * localhost:1005/DigitalTwin/simulationGroup
 * @body {String} name (required)
 * @body {Json} arg (required)
 * @body {String} url (required)
 * @returns {Json} {}
 */
router.put("/", async function (req, res) {
   try {
      const { name, arg, url } = req.body;

      const result = await services.simulation.update({ name, arg, url });

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
      const result = await services.simulation.get({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/simulationGroup`);
   }
});

/*
 * simulation Entire Retrieve
 */
router.get("/all", async function (req, res) {
   try {
      const result = await services.simulation.getAll();

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/simulationGroup/all`);
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
      const result = await services.simulation.delete({ name });

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
 * simulation all delete
 * localhost:1005/DigitalTwin/simulationGroup/all
 * @returns {Json} {}
 */
router.delete("/all", async (req, res) => {
   try {
      const result = await services.simulation.allDelete();

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Delete /DigitalTwin/simulationGroup/all`);
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
      const result = await services.simulation.rtTrigger({ name });

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
      const result = await services.simulation.stTrigger({ name });
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
