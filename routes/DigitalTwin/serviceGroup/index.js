const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

const ErrorHandler = require("../../../lib/error-handler");
// kafka 설정 불러오기
const config = require("../../../config");
const services = require("../../../services");
const kafka = config.kafka.host;

/**
 * service Creation
 * localhost:1005/DigitalTwin/serviceGroup
 * @body {String} name (required)
 * @body {Json} DO_arg (required)
 * @body {Json} SIM_arg (required)
 * @body {String} url (required)
 * @returns {Json} {}
 */
router.post("/", async function (req, res) {
   try {
      const { name, DO_arg, SIM_arg, url } = req.body;

      const result = await services.service.create({
         name,
         DO_arg,
         SIM_arg,
         url,
      });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `POST /DigitalTwin/serviceGroup ${e}`);
   }
});

/**
 * service Update
 * localhost:1005/DigitalTwin/serviceGroup
 * @body {String} name (required)
 * @body {Json} DO_arg (required)
 * @body {Json} SIM_arg (required)
 * @body {String} url (required)
 * @returns {Json} {}
 */
router.put("/", async function (req, res) {
   try {
      const { name, DO_arg, SIM_arg, url } = req.body;

      const result = await services.service.update({
         name,
         DO_arg,
         SIM_arg,
         url,
      });

      res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/serviceGroup");
   }
});

/**
 * service Retrieve
 * localhost:1005/DigitalTwin/serviceGroup?name=SEcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.get("/", async (req, res) => {
   const { name } = req.query;

   try {
      const result = await services.service.get({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Retrieve /DigitalTwin/serviceGroup`);
   }
});

/*
 * service delete
 * localhost:1005/DigitalTwin/serviceGroup?name=SEcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.delete("/", async (req, res) => {
   const { name } = req.query;

   try {
      const result = await services.service.delete({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Delete /DigitalTwin/serviceGroup`);
   }
});

/**
 * service all delete
 * localhost:1005/DigitalTwin/serviceGroup/all
 * @returns {Json} {}
 */
router.delete("/all", async (req, res) => {
   try {
      const result = await services.service.allDelete();

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `Delete /DigitalTwin/serviceGroup/all`);
   }
});

/*
 * service trigger
 * localhost:1005/DigitalTwin/serviceGroup/trigger?name=SEcrain
 * @param {string} name (required)
 * @returns {Json} {}
 */
router.post("/trigger", async function (req, res) {
   const { name } = req.query;

   try {
      const result = await services.service.trigger({ name });

      res.success(200, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, `POST /DigitalTwin/serviceGroup/trigger`);
   }
});

module.exports = router;
