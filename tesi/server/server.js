const express = require("express");  //framework per la gestione delle richieste http
const app = express();
const cors = require("cors");  //middleware di Express (politica di sicurezza)
require("dotenv").config({ path: "./config.env"});  //mi carico nel progetto le variabili d'ambiente
const port =process.env.PORT || 5000;   //mi prendo la porta

app.use(cors());  //utilizziamo il middleware CORS per gestire le richieste HTTP cross-origin
app.use(express.json());  //abilita il parsing delle richieste HTTP in formato JSON
app.use(require("./routes/record"));  //aggiungiamo il routes "record" come middleware per gestire le richieste HTTP

const dbo = require("./db/conn");  //prendiamo il db

//avvio il server Express sulla porta specificata
app.listen(port, async () =>{
    // Connessione al database MongoDB
    await dbo.connectToServer(function(err){
        if(err){
            console.error(err);
        }
    });
    console.log("server is running on port: "+port);
});