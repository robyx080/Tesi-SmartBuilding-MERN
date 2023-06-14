const { MongoClient } = require("mongodb"); //classe MongoClient che mi permette di creare un client per effettuare la connesione a mongodb

const Db = process.env.MONGO_URI;           //uri mongodb
const Db_atlas = process.env.MONGO_ATLAS;

const client = new MongoClient(Db, {        //creo il client
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const client_atlas = new MongoClient(Db_atlas, {        //creo il client
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var _db;
var _dbAtlas;

module.exports = {
    connectToServer: async function (callback) {
      try {
        await Promise.all([client.connect(), client_atlas.connect()]);
      } catch (error) {
        console.error(error);
      }
  
      _db = client.db("SmartBuilding");
      _dbAtlas = client_atlas.db("SmartBuilding");
  
      console.log("Successfully connected to MongoDB");
      return _db !== undefined && _dbAtlas !== undefined;
    },
    getDb: function () {
      return _db
    },
    getDbAtlas: function(){
        return _dbAtlas
    }
  };