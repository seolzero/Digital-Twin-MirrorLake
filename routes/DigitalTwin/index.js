const { dir } = require("console");
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

module.exports = router;
