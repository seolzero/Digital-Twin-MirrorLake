const config = require("../../config");
const pgConfig = config.postgres.config;

var pg = require("pg");
pg.types.setTypeParser(1114, (str) => str);

exports.init = () => {
	global.pgClient = new pg.Client(pgConfig);

	pgClient.connect((err) => {
		if (err) throw err;
		else {
			console.log("PostgreSQL Database connected");
		}
	});
};

/*
let sql = "SELECT spatio.ae, spatio.container, spatio.latitude, spatio.longitude, spatio.altitude, spatio.time from (SELECT ae, MAX(spatio.time) as time FROM spatio where ae = '" + deviceID + "'  GROUP BY ae)  AS lastvalue, spatio   WHERE lastvalue.time=spatio.time AND lastvalue.ae=spatio.ae";

client.query(sql).then(response => {
  console.log(sql)
  //console.log(response)
  if(response.rowCount){    
	var {ae, container, latitude, longitude, altitude, creationtime} = response.rows[0];
	var time = moment(creationtime).format('YYYYMMDDTHHmmss');
	let parseresponse =  {ae, container, location: {latitude, longitude, altitude}, time};
  }else{ //if no response
	console.log(response)
  }
}).catch(e => {
  console.log(e.stack);    
})       
*/
