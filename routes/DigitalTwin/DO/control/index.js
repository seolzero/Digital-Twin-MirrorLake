const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

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
      res.end();
      //res.success(201, result);
   } catch (e) {
      if (!(e instanceof ErrorHandler)) {
         console.log(e);
         e = new ErrorHandler(500, 500, "Internal Server Error");
      }
      e.handle(req, res, "POST /DigitalTwin/DO/control");
   }
});

/**
 * control Creation
 * DigitalTwin/control/:DOname
 * DO에 control을 만듦
 * @path {String} DOName
 * @body {String} name
 * @returns {String} msg
 */
router.post("/:DOName", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var controlNameObject;
      controlNameObject = JSON.parse(fullBody);

      if (DONameList.includes(DOName)) {
         console.log("body: ", controlNameObject, "DOName: ", DOName);
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.control) {
                  var filtered = where(element.control, {
                     name: controlNameObject.name,
                  });
                  if (filtered[0]) {
                     res.status(400).send("control is already exist");
                     console.log("same name exist: ", filtered[0]);
                     console.log("element: ", element);
                  } else {
                     res.status(200).send(
                        `Received control Data ${controlNameObject.name}`
                     );
                     element.control.push(controlNameObject);
                     element.controlCount++;
                     console.log("push: ", element);
                  }
               } else {
                  res.status(200).send(controlNameObject.name);
                  element.control = [controlNameObject];
                  element.controlCount = 1;
                  console.log(
                     "control push: ",
                     util.inspect(element, false, null, true)
                  );
               }
            }
         });
      } else {
         res.status(404).send("DO does not exist");
      }
   });
});

/*
 * control data Creation
 * DigitalTwin/control/:DOname/data
 */
router.post("/:DOName/data", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var controlDataObject;
      controlDataObject = JSON.parse(fullBody);

      if (DONameList.includes(DOName)) {
         console.log("body: ", controlDataObject, "DOName: ", DOName);
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.control) {
                  var filtered = where(element.control, {
                     name: controlDataObject.name,
                  });
                  if (filtered[0]) {
                     res.status(200).send("Received control Data");
                     // console.log("control is exist: ", filtered[0]);
                     // console.log("element: ", util.inspect(element, false, null, true));
                     if (filtered[0].data) {
                        filtered[0].data.push(controlDataObject.data); //check please!!
                        var fifoControlDataPushArray = new FifoArray(
                           5,
                           filtered[0].data
                        );
                        filtered[0].data = fifoControlDataPushArray;
                        console.log(
                           "create data arr & push data: ",
                           util.inspect(element, false, null, true)
                        );
                        var controlDataElementToString =
                           JSON.stringify(element);
                        client.publish(
                           "dp_do_data",
                           controlDataElementToString
                        ); //send string text!
                        Rclient.set(key_DO, JSON.stringify(value));
                     } else {
                        filtered[0].data = [controlDataObject.data];
                        console.log(
                           "push data: ",
                           util.inspect(element, false, null, true)
                        );
                        var controlDataElementToString =
                           JSON.stringify(element);
                        client.publish(
                           "dp_do_data",
                           controlDataElementToString
                        ); //send string text!
                        Rclient.set(key_DO, JSON.stringify(value));
                     }
                  } else {
                     res.status(404).send("The control name does not exist");
                  }
               } else {
                  // control create tag does not exist
                  res.status(404).send("A DO with no control created");
               }
            }
         });
      } else {
         res.status(404).send("DO does not exist");
      }
   });
});

/*
 * control result update
 */
router.put("/:DOName/:controlName", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      let controlName = req.params.controlName;
      var controlUpdateDataObject;
      controlUpdateDataObject = JSON.parse(fullBody);
      if (DONameList.includes(DOName)) {
         res.status(200).send("Received control Data");
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.control) {
                  var filtered = where(element.control, { name: controlName });
                  if (filtered[0]) {
                     if (filtered[0].data) {
                        filtered[0].data.forEach((data, index) => {
                           const controlData = data.toString();
                           let controlDataStringArr = controlData.split(", ");
                           const updateControlData =
                              controlUpdateDataObject.data.toString();
                           let updateControlDataStringArr =
                              updateControlData.split(", ");

                           if (
                              controlDataStringArr[0] ==
                                 updateControlDataStringArr[0] &&
                              controlDataStringArr[1] ==
                                 updateControlDataStringArr[1]
                           ) {
                              if (controlUpdateDataObject.controlDone) {
                                 let dataString =
                                    controlUpdateDataObject.data +
                                    ", " +
                                    controlUpdateDataObject.controlReceived +
                                    ", " +
                                    controlUpdateDataObject.controlDone;
                                 filtered[0].data.splice(index, 1, dataString);
                                 let controlDataSetToString =
                                    JSON.stringify(element);
                                 client.publish(
                                    "dp_do_data",
                                    controlDataSetToString
                                 );
                                 Rclient.set(key_DO, JSON.stringify(value));
                                 console.log(
                                    "Update controlReceived, controlDone: ",
                                    util.inspect(element, false, null, true)
                                 );
                              } else {
                                 let dataString =
                                    controlUpdateDataObject.data +
                                    ", " +
                                    controlUpdateDataObject.controlReceived;
                                 filtered[0].data.splice(index, 1, dataString);
                                 let controlDataSetToString =
                                    JSON.stringify(element);
                                 client.publish(
                                    "dp_do_data",
                                    controlDataSetToString
                                 );
                                 Rclient.set(key_DO, JSON.stringify(value));
                                 console.log(
                                    "Update controlReceived: ",
                                    util.inspect(element, false, null, true)
                                 );
                              }
                           }
                        });
                     }
                  }
               }
            }
         });
      } else {
         res.status(404).send("DO does not exist");
      }
   });
});

/*
 * control delete
 */
router.delete("/:DOName/:controlName", (req, res) => {
   let DOName = req.params.DOName;
   let controlName = req.params.controlName;
   console.log(DOName, controlName);
   if (DONameList.includes(DOName)) {
      DOWholeDataList.forEach((element, index) => {
         if (element.name == DOName) {
            if (element.control) {
               var filtered = where(element.control, { name: controlName });
               if (filtered[0]) {
                  var controlIndex = element.control.findIndex(
                     (i) => i.name == controlName
                  );
                  element.control.splice(controlIndex, 1);
                  element.controlCount--;
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );

                  res.status(200).send(`control ${controlName} delete`);
               } else {
                  res.status(200).send("control does not exist");
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );
               }
            } else {
               res.status(404).send("control object does not exist");
               console.log("control does not exist");
               console.log(
                  "element: ",
                  util.inspect(element, false, null, true)
               );
            }
         }
      });
   } else {
      res.status(404).send("DO does not exist");
   }
});

/*
 * control retrieve
 */
router.get("/:DOName/:controlName", async function (req, res) {
   let DOName = req.params.DOName;
   let controlName = req.params.controlName;
   console.log(DOName, controlName);
   if (DONameList.includes(DOName)) {
      DOWholeDataList.forEach((element, index) => {
         if (element.name == DOName) {
            if (element.control) {
               var filtered = where(element.control, { name: controlName });
               if (filtered[0]) {
                  var controlIndex = element.control.findIndex(
                     (i) => i.name == controlName
                  );
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );

                  res.status(200).send(`control ${controlName} ${element}`);
               } else {
                  res.status(200).send("control does not exist");
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );
               }
            } else {
               res.status(404).send("control object does not exist");
               console.log("control does not exist");
               console.log(
                  "element: ",
                  util.inspect(element, false, null, true)
               );
            }
         }
      });
   } else {
      res.status(404).send("DO does not exist");
   }
});

module.exports = router;
