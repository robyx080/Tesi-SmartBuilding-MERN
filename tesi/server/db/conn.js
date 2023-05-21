const { MongoClient } = require("mongodb"); //classe MongoClient che mi permette di creare un client per effettuare la connesione a mongodb
const Db = process.env.MONGO_URI;           //uri mongodb
const client = new MongoClient(Db, {        //creo il client
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var _db;

module.exports = {
    //connessione a mongodb
    connectToServer: async function(callback){
        try {
            await client.connect();
        } catch (e) {
            console.error(e);            
        }
        _db=client.db("SmartBuilding");  //connesione al db SmartBuilding
        console.log("Successfully connect to mongoDB");
        return (_db === undefined ? false : true);
    },
    getDb: function(){
        return _db;
    },
};

