class Postgres {
   async sendQuery({ sql }) {
      return pgClient
         .query(sql)
         .then((res) => {
            console.log(sql);
            return res.command;
         })
         .catch((e) => {
            throw e;
         });
   }

   async selectData({ sql }) {
      return pgClient
         .query(sql)
         .then((response) => {
            console.log(sql);
            if (response.rowCount) {
               return response.rows[0];
            } else {
               //if no response
               console.log("else, does not exist response.rowCount", response);
               return response.rows;
            }
         })
         .catch((e) => {
            throw e;
         });
   }

   async selectDataS({ sql }) {
      return pgClient
         .query(sql)
         .then((response) => {
            console.log(sql);
            if (response.rowCount) {
               return response.rows;
            } else {
               //if no response
               console.log("else, does not exist response.rowCount", response);
               return response.rows;
            }
         })
         .catch((e) => {
            throw e;
         });
   }
}

module.exports = Postgres;
