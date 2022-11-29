exports.digitalBrain = {
   ip: "localhost",
   port: "1005",
};

exports.redis = {
   ip: "localhost",
   port: "6379",
};

exports.mqtt = {
   ip: "localhost",
   port: "1883",
};

exports.kafka = {
   host: "192.168.140.123:9092",
   connectHost: "192.168.140.123:8083",
};

exports.flink = {
   ksqlOptions: {
      hostname: "localhost",
      port: 8088,
      headers: {
         "Content-Type": "application/vnd.ksql.v1+json",
         Accept: "application/vnd.ksql.v1+json",
      },
   },
   gwOption: {
      hostname: "192.168.140.123",
      port: 8087,
   },
};

exports.postgres = {
   config: {
      host: "192.168.140.123",
      port: 5432,
      user: "postgres",
      password: "keti123",
      database: "mirrorlake",
   },
};
