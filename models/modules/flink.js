const config = require("../../config");
const { hostname, port } = config.flink.gwOption;
const { default: axios } = require("axios");

class Flink {
   constructor() {
      if (!global.SESSION_ID) {
         throw "Undefined flink session ID";
      }

      this.gwOptions = {
         hostname,
         port,
         path: `v1/sessions/${global.SESSION_ID}/statements`,
         method: "POST",
      };
   }

   /**
    *
    * @param {String} method
    * @param {String} url
    * @param {Json} queryParams
    * @param {Json} bodyParams
    * @returns
    */
   async #request({ method, url, queryParams, bodyParams }) {
      try {
         method = this.gwOptions.method;
         url = `http://${this.gwOptions.hostname}:${this.gwOptions.port}/${this.gwOptions.path}`;

         const response = await axios({
            method,
            url,
            params: queryParams,
            data: bodyParams,
         });

         return response.data;
      } catch (e) {
         console.log(e.response.data);
      }

      return 0;
   }

   /**
    * DO 데이터를 이용해 kafka에 테이블 생성
    * @param {Json} obj
    */
   async createDOTable({ obj }) {
      console.log("create DO Table");
      const DOName = obj.name;

      // Create DO Table
      let createStreamSQL = {
         statement: ``,
      };

      // Get Sensor List from DO Object
      let sensorList = obj.sensor;
      console.log(sensorList);

      if (sensorList.length == 1) {
         createStreamSQL.statement = `CREATE TABLE ${DOName}(tmpA BIGINT, name STRING, data STRING, rowtime TIMESTAMP(3), PRIMARY KEY (tmpA) NOT ENFORCED) WITH ('connector' = 'upsert-kafka', 'topic' = 'DO_${DOName}','properties.bootstrap.servers' = '${config.kafka.host}', 'key.format' = 'json', 'value.format' = 'json')`;
      } else {
         createStreamSQL.statement = `CREATE TABLE ${DOName} (tmpA BIGINT, name STRING, rowtime TIMESTAMP(3), `;

         for (let i = 0; i < sensorList.length; i++) {
            createStreamSQL.statement += `${sensorList[i]} STRING, `;
         }

         createStreamSQL.statement += `PRIMARY KEY (tmpA) NOT ENFORCED) WITH('connector' = 'upsert-kafka', 'topic' = 'DO_${DOName}','properties.bootstrap.servers' = '${config.kafka.host}', 'key.format' = 'json', 'value.format' = 'json')`;
      }

      console.log("createStreamSQL: ", createStreamSQL);

      let insertTableSQL = {
         statement: `INSERT INTO ${DOName} select `,
      };

      if (sensorList.length == 1) {
         insertTableSQL.statement += `${sensorList[0]}.tmp, '${DOName}', ${sensorList[0]}.sensor_value, ${sensorList[0]}.sensor_rowtime FROM ${sensorList[0]}`;
      } else {
         insertTableSQL.statement += `${sensorList[0]}.tmp, '${DOName}', ${sensorList[0]}.sensor_rowtime, `;

         for (let i = 0; i < sensorList.length; i++) {
            insertTableSQL.statement += `${sensorList[i]}.sensor_value `;
            if (i != sensorList.length - 1) {
               insertTableSQL.statement += `, `;
            } else if (i == sensorList.length - 1) {
               insertTableSQL.statement += `from  ${sensorList[0]} `;
            }
         }

         for (let i = 0; i < sensorList.length - 1; i++) {
            insertTableSQL.statement += ` left join ${
               sensorList[i + 1]
            } for system_time as of ${sensorList[0]}.sensor_rowtime on ${
               sensorList[i + 1]
            }.tmp=${sensorList[0]}.tmp`;
         }
      }

      console.log("insertTableSQL: ", insertTableSQL);

      const createTable = await this.#request({ bodyParams: createStreamSQL });
      console.log(createTable);

      const insertData = await this.#request({ bodyParams: insertTableSQL });
      console.log(insertData);
      return 0;
   }

   async dropTable({ name }) {
      console.log("drop Table");
      let dropStreamSQL = {
         statement: `drop table ${name}`,
      };
      const result = await this.#request({ bodyParams: dropStreamSQL });
      console.log(dropStreamSQL, result);
      return 0;
   }
}

module.exports = Flink;
