const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());
const fs = require("fs");

const dirs = fs
   .readdirSync(__dirname)
   .filter((d) => fs.lstatSync(__dirname + "/" + d).isDirectory());
console.log(dirs);
dirs.forEach((dir) => {
   if (["DO", "flink", "simulationGroup", "serviceGroup"].includes(dir)) {
      const r = require("./" + dir);
      router.use("/" + dir, r);
      console.log("\t/" + dir);
   }
});

/**
 * control Creation
 * @body {String} name (required)
 * @body {String Array} sensor (required)
 * @returns {Json} {}

router.post("/:DOname/control", async function (req, res) {
   try {
      //const { name, sensor } = req.body;
      console.log(req.params);
      console.log(req.body);
      //const result = await services.control.create();
      res.end();
      //res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin");
   }
});
 */

module.exports = router;
