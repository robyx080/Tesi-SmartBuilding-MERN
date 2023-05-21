const { el } = require("date-fns/locale");
const express = require("express");   //framework per la gestione delle richieste http
const recordRoutes = express.Router(); // Crea un nuovo router per le route relative alle operazioni sui record
const dbo = require("../db/conn");  //prendiamo il db

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /login
recordRoutes.route("/login").post(async function (req, res) {
    
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta
    email=req.body.email;
    password=req.body.hash;

    //Cerco nel database l'utente con l'email e la password specificata
    try {
        //mi prendo il risultato della query
        var records = await db_connect.collection("login").find({email,password}).toArray();

        // Se l'utente esiste, restituisco il tipo di utente, altrimenti c'è un errore
        if (records[0]){
                res.send(records[0].tipo);            
            }
        else{
            res.send('invalid credentials')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /signupCC
recordRoutes.route("/signupCC").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    cognome=req.body.cognome;
    cf=req.body.cf.toLowerCase();
    data=new Date(req.body.data);
    luogo=req.body.luogo;
    telefono=req.body.telefono;
    email=req.body.email;
    password=req.body.hash;
    Cpassword=req.body.Chash;
    tipo="CC";
    idEdificio=Number(req.body.selectEdificio);
    //se le password combaciano continuo, altrimenti c'è un errore
    if(password===Cpassword){
        try {
            //query per vedere se ci sono già utenti con queste credenziali
            var records = await db_connect.collection("persona").countDocuments({ $or:[ {email}, {cf}] });
            if(records===1){
                res.send("email o cf già esistenti")
            }else{
                //query per vedere se esiste già il capocondomino dell'edificio 
                var records = await db_connect.collection("persona").countDocuments({ idEdificio });
                if(records===1){
                    res.send("già capocondomino")
                }else{  //se non risultano dati uguali inserisco il capocondomino
                    var records = await db_connect.collection("login").insertOne({email,password,tipo});  //query inserimento su login
                    var records = await db_connect.collection("persona").insertOne({ nome, cognome, cf, data, luogo,telefono,tipo, email,emailAzienda:"",idFamiglia:"",idEdificio });  //query inserimento su persona
                    // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
                    if (records) {
                        res.send('valid entry');
                    }
                    else {
                        res.send('errore nella registrazione')
                    }
                }              
            } 
        } catch (e) {
            console.log("An error occurred pulling the records. " + e);
        }
    }else{
        res.send('invalid password')
    }  
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /profiloSU
recordRoutes.route("/profiloSU").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email=req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({email}).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        const json=[] //array che mi conterra i due json relativi alle query
        json.push(records[0],records2[0])
        //se entrambe le query hanno ottenuto un risultato, restituisco l'array,altrimenti ci sarà un errore nella query
        if (records[0] && records2[0] ){
                res.json(json);            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /selectEdifici
recordRoutes.route("/Edifici").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        var city = records2[0].city;  //mi prendo la città dell'azienda
        var records3 = await db_connect.collection("edificio").find({NomeCitta:city}).toArray(); //query su edificio 
        // Se la query da esito positvo, restituisco gli edifici,altrimenti ci sarà un errore nella query
        if (records3.length>0){
            res.json(records3);            
        }else{
          res.json('nessun edificio')
      }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send("error query")
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addBuilding
recordRoutes.route("/addBuilding").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    NomeEdificio=req.body.nomeEdificio;
    NumeroPiani=req.body.numeroPiani;
    Indirizzo=req.body.indirizzo;
    NumeroCivico=req.body.numeroCivico;
    Altezza=req.body.altezza;
    email=req.body.email;    
   
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        var NomeCitta = records2[0].city;  //mi prendo la città dell'azienda

        //query per vedere se esiste già un edificio in una via
        var records = await db_connect.collection("edificio").countDocuments({ NomeEdificio,Indirizzo });
        if (records === 1) {
            res.send("edificio già esistente")
        } else {  //se non risultano dati uguali inserisco l'edificio
            var records = await db_connect.collection("edificio").find().sort({id:-1}).limit(1).toArray();
            id=records[0].id + 1;
            var records = await db_connect.collection("edificio").insertOne({ id,NomeEdificio,Indirizzo,NumeroCivico,NomeCitta,NumeroPiani,Altezza});  //query inserimento su edificio
            // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
            if (records) {
                res.send('valid entry');
            }
            else {
                res.send('errore nella registrazione')
            }
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /deleteEdi
recordRoutes.route("/deleteEdi").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    id=Number(req.body.id);
    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("edificio").deleteOne({id});
        var appartamenti = await db_connect.collection("appartamento").find({idEdificio:id}).toArray();
        if(appartamenti.length>0){
            for(var i=0;i<appartamenti.length;i++){
                idFamiglia=appartamenti[i].idFamiglia;
                if(!isNaN(idFamiglia) || idFamiglia!=null){
                    var famiglia = await db_connect.collection("famiglia").deleteOne({id:idFamiglia});
                    var membri = await db_connect.collection("persona").find({ idFamiglia }).toArray();
                    if (membri.length > 0) {
                        for(var j=0;j<membri.length;j++){
                            email = membri[j].email;
                            var persona = await db_connect.collection("persona").deleteOne({ email: email });
                            var loginPe = await db_connect.collection("login").deleteOne({ email: email });
                        }
                    }
                }
                var idAppartamento = appartamenti[i].id;
                var stanze = await db_connect.collection("stanza").find({ idAppartamento }).toArray();
                if (stanze.length > 0) {
                    for (var j = 0; j < stanze.length; j++) {
                        idStanza = stanze[j].id;
                        var elettr = await db_connect.collection("elettrodomestico").deleteMany({ idStanza });
                        var sens = await db_connect.collection("sensore").deleteMany({ idStanza });
                    }
                }
                var stanze = await db_connect.collection("stanza").deleteMany({ idAppartamento: id })
                var impSol = await db_connect.collection("impiantoSolare").deleteOne({ idAppartamento: id });
                var impEol = await db_connect.collection("impiantoEolico").deleteOne({ idAppartamento: id });
            }
        }
        var records4 = await db_connect.collection("appartamento").deleteMany({idEdificio:id})
        var impSol = await db_connect.collection("impiantoSolare").deleteOne({ idEdificio:id });
        var impEol = await db_connect.collection("impiantoEolico").deleteOne({ idEdificio: id });
        var sens = await db_connect.collection("sensore").deleteMany({ idEdificio:id });       
        var garage = await db_connect.collection("garage").find({IdEdificio:id}).toArray();
        if(garage.length>0){
            for(var j=0;j<garage.length;j++){
                idGarage=garage[j].id;
                var wallBox = await db_connect.collection("wallbox").deleteOne({idGarage});
            }
        }
        var garage = await db_connect.collection("garage").deleteMany({IdEdificio:id});
        //se c'è un capo condomino in quell'edificio lo elimino
        var records2 = await db_connect.collection("persona").find({idEdificio:id}).toArray();
        if(records2.length>0){
            email=records2[0].email;
            var records2 = await db_connect.collection("persona").deleteOne({email:email});
            var records3 = await db_connect.collection("login").deleteOne({email:email});
        }

        //se le query hanno ottenuto un risultato restituisco la risposta,altrimenti ci sarà un errore nella query
        if (records.deletedCount===1 || records2.deletedCount===1 || records3.deletedCount===1 || records4.deletedCount>=0 || famiglia.deletedCount>=0 || persona.deletedCount>=0 || loginPe.deletedCount>=0 || garage.deletedCount>=0 || sens.deletedCount>=0 || elettr.deletedCount>=0 || impSol.deletedCount>=0 || impEol.deletedCount>=0 || wallBox.deletedCount>=0){
                res.send("eliminated completed");            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /profiloSUcc
recordRoutes.route("/profiloSUcc").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email=req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({email}).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        var city = records2[0].city;
        var records = await db_connect.collection("edificio").find({NomeCitta:city}).toArray();  //query su edificio
        var arr = new Array();
        //per ogni edificio che abbiamo in una determinata città restituiamo i capocondomino
        for(var i=0;i<records.length;i++){
            var persona = await db_connect.collection("persona").find({idEdificio:Number(records[i].id) }).toArray();
            if(persona[0])
                arr.push(persona[0])
        }
        //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
        if (arr.length>0){
                res.json(arr);            
            }
        else{
            res.json('nessun capo condominio')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /eliminaCC
recordRoutes.route("/eliminaCC").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    emailCC=req.body.emailCC;

    // elimino da persona e login i record con email = emailCC 
    try {
        var records = await db_connect.collection("persona").deleteOne({email:emailCC});
        var records2 = await db_connect.collection("login").deleteOne({email:emailCC});
        
        //se entrambe le query hanno ottenuto un risultato restituisco la risposta,altrimenti ci sarà un errore nella query
        if (records.deletedCount===1 || records2.deletedCount===1){
                res.send("eliminated completed");            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /AppartamentiSU
recordRoutes.route("/AppartamentiSU").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        var city = records2[0].city;  //mi prendo la città dell'azienda
        var records3 = await db_connect.collection("edificio").find({NomeCitta:city}).toArray(); //query su edificio 
        var arr = new Array();
        
        //per ogni edificio che abbiamo in una determinata città restituiamo gli appartamenti
        for(var i=0;i<records3.length;i++){
            var appartamento = await db_connect.collection("appartamento").find({idEdificio:Number(records3[i].id) }).toArray();
            for (var j=0;j<appartamento.length;j++){
                if(appartamento[j])
                    arr.push(appartamento[j])
            }
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (arr.length>0){
            res.json(arr);            
        }else{
          res.json('nessun appartamento')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /deleteApp
recordRoutes.route("/deleteApp").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    id=Number(req.body.id);
    try {
        var appartamento = await db_connect.collection("appartamento").find({id}).toArray();
        if(appartamento.length>0){
            var stanze = await db_connect.collection("stanza").find({idAppartamento:id}).toArray();
            if(stanze.length>0){
                for (var j = 0; j < stanze.length; j++) {
                    idStanza=stanze[j].id;
                    var elettr = await db_connect.collection("elettrodomestico").deleteMany({idStanza});
                    var sens = await db_connect.collection("sensore").deleteMany({idStanza});
                }
            }
            var stanze = await db_connect.collection("stanza").deleteMany({idAppartamento:id})
            var impSol = await db_connect.collection("impiantoSolare").deleteOne({idAppartamento:id});
            var impEol = await db_connect.collection("impiantoEolico").deleteOne({idAppartamento:id});

            idFamiglia = appartamento[0].idFamiglia;
            if (!isNaN(idFamiglia) || idFamiglia != null) {
                var famiglia = await db_connect.collection("famiglia").deleteOne({ id: idFamiglia });
                var garage = await db_connect.collection("garage").updateOne({IdFamiglia:idFamiglia},{$set:{IdFamiglia: null}});
                var membri = await db_connect.collection("persona").find({ idFamiglia }).toArray();
                if (membri.length > 0) {
                    for (var j = 0; j < membri.length; j++) {
                        email = membri[j].email;
                        var persona = await db_connect.collection("persona").deleteOne({ email: email });
                        var loginPe = await db_connect.collection("login").deleteOne({ email: email });
                    }
                }
            }
        }
        //Cancello  l'appartamento
        var records = await db_connect.collection("appartamento").deleteOne({id});

        //se le query hanno ottenuto un risultato restituisco la risposta,altrimenti ci sarà un errore nella query
        if (records.deletedCount===1 || persona.deletedCount>=0 || loginPe.deletedCount>=0 || famiglia.deletedCount>=0 || garage.modifiedCount===1 || stanze.deletedCount>=0 || impEol.deletedCount>=0 || impSol.deletedCount>=0 || elettr.deletedCount>=0 || sens.deletedCount>=0){
                res.send("eliminated completed");            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addApartment
recordRoutes.route("/addApartment").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    grandezza=req.body.grandezza;
    piano=req.body.numeroPiano;
    idEdificio=Number(req.body.selectEdificio);
    idFamiglia=NaN;
    var id=1;

    try {
        //faccio una query per prendere l'id più grande
        var records = await db_connect.collection("appartamento").find().sort({id:-1}).limit(1).toArray();
        if(records[0]){
            id=records[0].id + 1;
        }

        var records = await db_connect.collection("appartamento").insertOne({id,piano,grandezza,idEdificio,idFamiglia});  //query inserimento su edificio
        // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records) {
            res.send('valid entry');
        }
        else {
            res.send('errore nella registrazione')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /profiloCC 
recordRoutes.route("/profiloCC").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email=req.body.email;

    // Prendi dal db le informazioni sulla persona tramite l'email
    try {
        var records = await db_connect.collection("persona").find({email}).toArray();  //query su persona
        //se la query ha ottenuto un risultato restituisco l'array,altrimenti ci sarà un errore nella query
        if (records[0]){
                res.json(records[0]);            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /selectAppartamentiCC
recordRoutes.route("/selectAppartamentiCC").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idEdificio = records[0].idEdificio;  //mi prendo l'idEdificio da persona
        var arr = new Array();
        //mi prendo gli appartamenti di quel edificio che non sono stati assegnati
        var appartamento = await db_connect.collection("appartamento").find({ idEdificio }).toArray();
        for (var j = 0; j < appartamento.length; j++) {
            if (isNaN(appartamento[j].idFamiglia) || appartamento[j].idFamiglia===null)
                arr.push(appartamento[j])
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (arr){
            res.json(arr);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addFamily
recordRoutes.route("/addFamily").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nomeFamiglia=req.body.nomeFamiglia;
    idAppartamento=Number(req.body.selectAppartamento);
    var id=1

    try {
        var records = await db_connect.collection("famiglia").find().sort({id:-1}).limit(1).toArray();
        if(records[0]){
            id=records[0].id + 1;
        }
        var records = await db_connect.collection("famiglia").insertOne({id,nomeFamiglia});  //query inserimento su famiglia
        var records2 = await db_connect.collection("appartamento").updateOne({id: idAppartamento},{$set:{idFamiglia: Number(id)}}) //query aggiornamento su appartamento
        // Se l'inserimento e l'aggiornamento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records || records2) {
            res.send('valid entry');
        }
        else {
            res.send('errore nella registrazione')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /garageSU
recordRoutes.route("/garageSU").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        var city = records2[0].city;  //mi prendo la città dell'azienda
        var records3 = await db_connect.collection("edificio").find({NomeCitta:city}).toArray(); //query su edificio 
        var arr = new Array();
        
        //per ogni edificio che abbiamo in una determinata città restituiamo i garage
        for(var i=0;i<records3.length;i++){
            var garage = await db_connect.collection("garage").find({IdEdificio:Number(records3[i].id) }).toArray();
            for (var j=0;j<garage.length;j++){
                if(garage[j])
                    arr.push(garage[j])
            }
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if(arr.length>0){
            res.json(arr);            
        }else{
          res.json('nessun garage')
      }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send("error query")
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /deleteGa
recordRoutes.route("/deleteGa").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    id=Number(req.body.id);

    try {
        //elimino il garage
        var records = await db_connect.collection("garage").deleteOne({Id:id});
        var wallBox = await db_connect.collection("wallBox").deleteOne({idGarage:id});
        //se le query hanno ottenuto un risultato restituisco la risposta,altrimenti ci sarà un errore nella query
        if (records.deletedCount===1 || wallBox.deletedCount>=0){
                res.send("eliminated completed");            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addGarage").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    NumPostAuto=req.body.numeroPostiAuto;
    Larghezza=req.body.larghezza;
    Lunghezza=req.body.lunghezza;
    Altezza=req.body.altezza;
    IdEdificio=Number(req.body.selectEdificio);
    IdFamiglia=NaN;
    var Id=1;

    try {
        var records = await db_connect.collection("garage").find().sort({Id:-1}).limit(1).toArray();
        if(records[0]){
            Id=records[0].Id + 1;
        }
        var records = await db_connect.collection("garage").insertOne({Id,NumPostAuto,Larghezza,Lunghezza,Altezza,IdEdificio,IdFamiglia});  //query inserimento su garage
        // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records) {
            res.send('valid entry');
        }
        else {
            res.send('errore nella registrazione')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /selectGarageCC
recordRoutes.route("/selectGarageCC").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio
        var arr = new Array();
        //restituisco i garage di quel determinato edificio
        var garage = await db_connect.collection("garage").find({ IdEdificio: Number(idEdificio) }).toArray();
        for (var j = 0; j < garage.length; j++) {
            if (isNaN(garage[j].IdFamiglia) || garage[j].IdFamiglia===null)
                arr.push(garage[j])
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (arr){
            res.json(arr);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP GET alla route /selectFamigliaCC
recordRoutes.route("/selectFamigliaCC").get(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    try {
        var records = await db_connect.collection("famiglia").find().toArray();  //query su famiglia
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (records){
            res.json(records);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP PUT alla route /addFamGarage
recordRoutes.route("/addFamGarage").put(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    IdFamiglia = Number(req.body.selectFamiglia);
    IdGarage = Number(req.body.selectGarage);

    try {
        var records = await db_connect.collection("garage").countDocuments({ IdFamiglia});
        if(records===1)
            res.send("garage già assegnato")
        else{
            var records = await db_connect.collection("garage").updateOne({ Id: IdGarage }, { $set: { IdFamiglia } });  //query update garage
            //se la modifica è andata a buon fine restituisco un messaggio,altrimenti ci sarà un errore nella query
            if (records.modifiedCount === 1) {
                res.send('valid entry');
            }
            else {
                res.send('error query')
            }
        }  
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /garageCC
recordRoutes.route("/garageCC").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio     
        var arr = new Array();
        //per l'edificio che abbiamo restituiamo i garage
        var garage = await db_connect.collection("garage").find({ IdEdificio: Number(idEdificio) }).toArray();
        for (var j = 0; j < garage.length; j++) {
            if (garage[j])
                arr.push(garage[j])
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (arr){
            res.json(arr);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /famigliaCC
recordRoutes.route("/famigliaCC").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio
        var records2 = await db_connect.collection("appartamento").find({idEdificio}).toArray(); //query su appartamento
        var arr = new Array();
        //per ogni appartamento che abbiamo in una determinato edificio restituiamo le famiglie
        for(var i=0;i<records2.length;i++){
            var famiglia = await db_connect.collection("famiglia").find({id:Number(records2[i].idFamiglia)}).toArray();
            if (famiglia[0])
                arr.push(famiglia[0])
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
        if (arr.length>0){
            res.json(arr);            
        }else{
          res.json('nessuna famiglia')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /signupMECF
recordRoutes.route("/signupMECF").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    cognome=req.body.cognome;
    cf=req.body.cf.toLowerCase();
    data=new Date(req.body.data);
    luogo=req.body.luogo;
    telefono=req.body.telefono;
    email=req.body.email;
    password=req.body.hash;
    Cpassword=req.body.Chash;
    tipo=req.body.selectTipo;
    idFamiglia=Number(req.body.selectFamiglia);
    
    //se le password combaciano continuo, altrimenti c'è un errore
    if(password===Cpassword){
        try {
            //query per vedere se ci sono già utenti con queste credenziali
            var records = await db_connect.collection("persona").countDocuments({ $or:[ {email}, {cf}] });
            if(records===1){
                res.send("email o cf già esistenti")
            }else{
                //controllo per vedere se esiste il capo famiglia nella famiglia
                var records = await db_connect.collection("persona").countDocuments({ idFamiglia,tipo:"CF" });
                if(tipo==="CF" && records===1){
                    res.send("già capofamiglia");         
                }else{  //se non risultano dati uguali inserisco il capofamiglia o membro
                    var records1 = await db_connect.collection("login").insertOne({email,password,tipo});  //query inserimento su login
                    var records2 = await db_connect.collection("persona").insertOne({ nome, cognome, cf, data, luogo,telefono,tipo, email,emailAzienda:"",idFamiglia,idEdificio:"" });  //query inserimento su persona
                    // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
                    if (records1 && records2) {
                        res.send('valid entry');
                    }
                    else {
                        res.send('errore nella registrazione');
                    } 
                }              
            }
        } catch (e) {
            console.log("An error occurred pulling the records. " + e);
        }
    }else{
        res.send('invalid password');
    }  
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /showFamiglia
recordRoutes.route("/showFamiglia").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    idFamiglia = req.body.idFa;

    try {
        var records = await db_connect.collection("persona").find({ idFamiglia }).toArray();  //query su persona
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
        if (records.length>0){
            res.json(records);            
        }else{
            //console.log(arr.length)
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /deleteFa
recordRoutes.route("/deleteFa").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    idFamiglia=Number(req.body.id);
    console.log(idFamiglia)
    try {
        var records = await db_connect.collection("famiglia").deleteOne({id:idFamiglia}); //elimino la famiglia
        //prendo le persone inserite in quella famiglia e le elimina 
        var persone = await db_connect.collection("persona").find({idFamiglia}).toArray();
        for(var i=0;i<persone.length;i++){
            email=persone[i].email;
            var records2 = await db_connect.collection("persona").deleteOne({email:email});
            var records3 = await db_connect.collection("login").deleteOne({email:email});
        }
        //tolgo la famiglia da appartamento e garage
        var records4 = await db_connect.collection("appartamento").updateOne({idFamiglia:idFamiglia},{$set:{idFamiglia: null}})
        var records5 = await db_connect.collection("garage").updateOne({IdFamiglia:idFamiglia},{$set:{IdFamiglia: null}})

        //se le query hanno ottenuto un risultato restituisco la risposta,altrimenti ci sarà un errore nella query
        if (records.deletedCount===1 || records2.deletedCount===1 || records3.deletedCount===1 || records4.modifiedCount === 1 || records5.modifiedCount === 1){
                res.send("eliminated completed");            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /AppartamentiCC
recordRoutes.route("/AppartamentiCC").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idEdificio = records[0].idEdificio;  //mi prendo l'idEdificio da persona
        //mi prendo gli appartamenti di quel edificio
        var appartamento = await db_connect.collection("appartamento").find({ idEdificio }).toArray();
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (appartamento){
            res.json(appartamento);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /profiloCF 
recordRoutes.route("/profiloCF").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email=req.body.email;

    // Prendi dal db le informazioni sulla persona tramite l'email
    try {
        var records = await db_connect.collection("persona").find({email}).toArray();  //query su persona
        //se la query ha ottenuto un risultato restituisco l'array,altrimenti ci sarà un errore nella query
        if (records[0]){
                res.json(records[0]);            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /famigliaCF
recordRoutes.route("/famigliaCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta
    email = req.body.email

    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();
        var idFamiglia = records[0].idFamiglia;
        var famiglia = await db_connect.collection("persona").find({ idFamiglia }).toArray();  //query su persona
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
        if (famiglia.length>0){
            res.json(famiglia);            
        }else{
            //console.log(arr.length)
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /AppartamentiCC
recordRoutes.route("/AppartamentiCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'idFamiglia da persona
        //mi prendo gli appartamenti di quel edificio
        var appartamento = await db_connect.collection("appartamento").find({ idFamiglia }).toArray();
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (appartamento){
            res.json(appartamento);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /garageCF
recordRoutes.route("/garageCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'id dell'edificio     
        //per la famiglia che abbiamo restituiamo il garage
        var garage = await db_connect.collection("garage").find({ IdFamiglia: Number(idFamiglia) }).toArray();
        
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (garage.length>0){
            res.json(garage);            
        }else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addRoom").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    larghezza=req.body.larghezza;
    lunghezza=req.body.lunghezza;
    altezza=req.body.altezza;
    idAppartamento=Number(req.body.selectAppartamento);
    var id=1;

    try {
        var records = await db_connect.collection("stanza").find().sort({id:-1}).limit(1).toArray();
        if(records[0]){
            id=records[0].id + 1;
        }
        var records = await db_connect.collection("stanza").insertOne({id,nome,larghezza,lunghezza,altezza,idAppartamento});  //query inserimento su garage
        // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records) {
            res.send('valid entry');
        }
        else {
            res.send('errore nella registrazione')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /garageSU
recordRoutes.route("/roomSU").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulla persona e sulla azienda tramite l'email
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var emailAzienda = records[0].emailAzienda;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("azienda").find({email:emailAzienda}).toArray();  //query su azienda
        var city = records2[0].city;  //mi prendo la città dell'azienda
        var records3 = await db_connect.collection("edificio").find({NomeCitta:city}).toArray(); //query su edificio 
        var arr = new Array();
        
        //per ogni edificio che abbiamo in una determinata città restituiamo le stanze degli appartamenti
        for(var i=0;i<records3.length;i++){
            var appartamenti = await db_connect.collection("appartamento").find({idEdificio:Number(records3[i].id) }).toArray();
            for (var j=0;j<appartamenti.length;j++){
                var stanze = await db_connect.collection("stanza").find({idAppartamento:Number(appartamenti[j].id) }).toArray();
                if(stanze.length>0)
                    for (var k=0;k<stanze.length;k++)
                        arr.push(stanze[k])
            }
        }
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (arr.length>0){
            res.json(arr);            
        }else{
          res.json('nessuna stanza')
      }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send("error query")
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /deleteGa
recordRoutes.route("/deleteRoom").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    id=Number(req.body.id);

    try {
        //elimino stanza e dispositivis
        var records = await db_connect.collection("stanza").deleteOne({id:id});
        var elettr = await db_connect.collection("elettrodomestico").deleteMany({idStanza:id});
        var sens = await db_connect.collection("sensore").deleteMany({idStanza:id});


        //se le query hanno ottenuto un risultato restituisco la risposta,altrimenti ci sarà un errore nella query
        if (records.deletedCount===1 || elettr.deletedCount>=0 || sens.deletedCount>=0){
                res.send("eliminated completed");            
            }
        else{
            res.send('error query')
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/roomCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda
        var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio 
        
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (stanze.length>0){
            res.json(stanze);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/deviceCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda
        var IdFamiglia = records2[0].idFamiglia;
        var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio 
        var arr= new Array();
        var arr2= new Array();
        var dispositivi = new Array();
        var elettr = {}
        var sens = {}
        var impSol = {}
        var impEol = {}
        var wallBox = {}
        
        //prendo elettrodomestici e sensori
        for(var i=0;i<stanze.length;i++){
            idStanza = stanze[i].id;
            var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
            var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
            for(var j=0;j<deviceE.length;j++)
                arr.push(deviceE[j]);
            for(var j=0;j<deviceS.length;j++)
                arr2.push(deviceS[j]);
        }
        if(arr.length>0){
          elettr={elettrodomestici : arr};
        }else{
          elettr={elettrodomestici :"nessun dispositivo"}
        }

        if(arr2.length>0){
          sens={sensori : arr2};
        }else{
          sens={sensori :"nessun dispositivo"}
        }

        //prendo impianto solare e eolico
        var deviceSol = await db_connect.collection("impiantoSolare").find({idAppartamento}).toArray(); //query su edificio 
        if(deviceSol.length>0){
          impSol = {impiantoSolare : deviceSol}
        }else{
          impSol = {impiantoSolare :"nessun dispositivo"}
        }
        
        var deviceEol = await db_connect.collection("impiantoEolico").find({idAppartamento}).toArray(); //query su edificio 
        if(deviceEol.length>0){
          impEol = {impiantoEolico : deviceEol}
        }else{
          impEol={impiantoEolico :"nessun dispositivo"}
        }

        //prendo wallbox
        var garage = await db_connect.collection("garage").find({IdFamiglia}).toArray(); //query su edificio
        if(garage.length>0){
          var idGarage = garage[0].Id;
          var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio 
          if(deviceW.length>0){
            wallBox = {wallBox : deviceW}
          }else{
            wallBox={wallBox :"nessun dispositivo"}
          }
        }else{
          wallBox={wallBox :"nessun dispositivo"}
        } 
        

        dispositivi.push(elettr,sens,impSol,impEol,wallBox)

        //console.log(dispositivi)
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (dispositivi.length>0){
            res.json(dispositivi);            
        }else{
          res.send('error query')
      }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addElet").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    classeEnergetica=req.body.classeEnergetica;
    marca=req.body.marca;
    idStanza=Number(req.body.selectStanza);
    var id=1;
    var tipoHardware=1;

    try {
        var records = await db_connect.collection("elettrodomestico").find().sort({id:-1}).limit(1).toArray();
        if(records[0]){
            id=records[0].id + 1;
        }
        var records = await db_connect.collection("elettrodomestico").insertOne({id,nome,potenzaMax,potenzaMin,classeEnergetica,marca,idStanza,tipoHardware});  //query inserimento su garage
        // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records) {
            res.send('valid entry');
        }
        else {
            res.send("errore nell'inserimento")
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addSen").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    marca=req.body.marca;
    idStanza=Number(req.body.selectStanza);
    var id=1;
    var tipoHardware=4;
    var idEdificio=null

    try {
        var records = await db_connect.collection("sensore").find().sort({id:-1}).limit(1).toArray();
        if(records[0]){
            id=records[0].id + 1;
        }
        var records = await db_connect.collection("sensore").insertOne({id,nome,potenzaMax,potenzaMin,marca,idStanza,idEdificio,tipoHardware});  //query inserimento su garage
        // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records) {
            res.send('valid entry');
        }
        else {
            res.send("errore nell'inserimento")
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addSol").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    numeroPannelli=req.body.numeroPannelli;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    email=req.body.email;
    var id=1;
    var tipoHardware=2;
    var idEdificio=null

    try {
        var records = await db_connect.collection("persona").find({email}).toArray();
        idFamiglia=records[0].idFamiglia;
        var appartamento = await db_connect.collection("appartamento").find({idFamiglia}).toArray();
        idAppartamento=appartamento[0].id;
        records = await db_connect.collection("impiantoSolare").countDocuments({ idAppartamento });
        if(records===1){
            res.send("già esistente");
        }else{
            records = await db_connect.collection("impiantoSolare").find().sort({id:-1}).limit(1).toArray();
            if (records[0]) {
                id = records[0].id + 1;
            }
            records = await db_connect.collection("impiantoSolare").insertOne({ id, numeroPannelli, potenzaMax, potenzaMin, idAppartamento, idEdificio, tipoHardware });  //query inserimento su garage
            // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
            if (records) {
                res.send('valid entry');
            }
            else {
                res.send("errore nell'inserimento")
            }
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addEol").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    numeroPale=req.body.numeroPale;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    email=req.body.email;
    var id=1;
    var tipoHardware=3;
    var idEdificio=null

    try {
        var records = await db_connect.collection("persona").find({email}).toArray();
        idFamiglia=records[0].idFamiglia;
        var appartamento = await db_connect.collection("appartamento").find({idFamiglia}).toArray();
        idAppartamento=appartamento[0].id;
        records = await db_connect.collection("impiantoEolico").countDocuments({ idAppartamento });
        if(records===1){
            res.send("già esistente");
        }else{
            records = await db_connect.collection("impiantoEolico").find().sort({id:-1}).limit(1).toArray();
            if (records[0]) {
                id = records[0].id + 1;
            }
            records = await db_connect.collection("impiantoEolico").insertOne({ id, numeroPale, potenzaMax, potenzaMin, idAppartamento, idEdificio, tipoHardware });  //query inserimento su garage
            // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
            if (records) {
                res.send('valid entry');
            }
            else {
                res.send("errore nell'inserimento")
            }
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addWallbox").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    email=req.body.email;
    marca=req.body.marca;
    var id=1;
    var tipoHardware=5;

    try {
        var records = await db_connect.collection("persona").find({email}).toArray();
        idFamiglia=records[0].idFamiglia;
        var garage = await db_connect.collection("garage").find({IdFamiglia:idFamiglia}).toArray();
        idGarage=garage[0].Id;
        records = await db_connect.collection("wallbox").countDocuments({ idGarage });
        if(records===1){
            res.send("già esistente");
        }else{
            records = await db_connect.collection("wallbox").find().sort({id:-1}).limit(1).toArray();
            if (records[0]) {
                id = records[0].id + 1;
            }
            records = await db_connect.collection("wallbox").insertOne({ id, nome, potenzaMax, potenzaMin, marca,idGarage, tipoHardware });  //query inserimento su garage
            // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
            if (records) {
                res.send('valid entry');
            }
            else {
                res.send("errore nell'inserimento")
            }
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP DELETE alla route /deleteFa
recordRoutes.route("/deleteDevice").delete(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    idDevice=Number(req.body.id);
    tipoHardware=Number(req.body.tipoHardware);
    try {
        var records;
        switch (tipoHardware) {
            case 1:
                records = await db_connect.collection("elettrodomestico").deleteOne({id:idDevice});
                if (records.deletedCount===1)
                    res.send("eliminated completed");
                else
                    res.send('error query')           
                break;
        
            case 2:
                records = await db_connect.collection("impiantoSolare").deleteOne({id:idDevice});
                if (records.deletedCount===1)
                    res.send("eliminated completed"); 
                else
                    res.send('error query')           
                break;

            case 3:
                records = await db_connect.collection("impiantoEolico").deleteOne({ id: idDevice });
                if (records.deletedCount === 1)
                    res.send("eliminated completed");
                else
                    res.send('error query')
                break;

            case 4:
                records = await db_connect.collection("sensore").deleteOne({ id: idDevice });
                if (records.deletedCount === 1)
                    res.send("eliminated completed");
                else
                    res.send('error query')
                break;

            case 5:
                records = await db_connect.collection("wallbox").deleteOne({ id: idDevice });
                if (records.deletedCount === 1)
                    res.send("eliminated completed");
                else
                    res.send('error query')
                break;

            default:
                break;
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addSenCC").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    nome=req.body.nome;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    marca=req.body.marca;
    email=req.body.email;
    var idStanza=null;
    var id=1;
    var tipoHardware=4;

    try {
        var persona = await db_connect.collection("persona").find({email}).toArray();
        var idEdificio = persona[0].idEdificio
        var records = await db_connect.collection("sensore").find().sort({id:-1}).limit(1).toArray();
        if(records[0]){
            id=records[0].id + 1;
        }
        var records = await db_connect.collection("sensore").insertOne({id,nome,potenzaMax,potenzaMin,marca,idStanza,idEdificio,tipoHardware});  //query inserimento su garage
        // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
        if (records) {
            res.send('valid entry');
        }
        else {
            res.send("errore nell'inserimento")
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});



//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addSolCC").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    numeroPannelli=req.body.numeroPannelli;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    email=req.body.email;
    var id=1;
    var tipoHardware=2;
    var idAppartamento=null

    try {
        var records = await db_connect.collection("persona").find({email}).toArray();
        idEdificio=records[0].idEdificio;
        records = await db_connect.collection("impiantoSolare").countDocuments({ idEdificio });
        if(records===1){
            res.send("già esistente");
        }else{
            records = await db_connect.collection("impiantoSolare").find().sort({id:-1}).limit(1).toArray();
            if (records[0]) {
                id = records[0].id + 1;
            }
            records = await db_connect.collection("impiantoSolare").insertOne({ id, numeroPannelli, potenzaMax, potenzaMin, idAppartamento, idEdificio, tipoHardware });  //query inserimento su garage
            // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
            if (records) {
                res.send('valid entry');
            }
            else {
                res.send("errore nell'inserimento")
            }
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /addGarage
recordRoutes.route("/addEolCC").post(async function (req, res) {
    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();
  
    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    numeroPale=req.body.numeroPale;
    potenzaMax=req.body.potenzaMax;
    potenzaMin=req.body.potenzaMin;
    email=req.body.email;
    var id=1;
    var tipoHardware=3;
    var idAppartamento=null;

    try {
        var records = await db_connect.collection("persona").find({email}).toArray();
        idEdificio=records[0].idEdificio;
        records = await db_connect.collection("impiantoEolico").countDocuments({ idEdificio });
        if(records===1){
            res.send("già esistente");
        }else{
            records = await db_connect.collection("impiantoEolico").find().sort({id:-1}).limit(1).toArray();
            if (records[0]) {
                id = records[0].id + 1;
            }
            records = await db_connect.collection("impiantoEolico").insertOne({ id, numeroPale, potenzaMax, potenzaMin, idAppartamento, idEdificio, tipoHardware });  //query inserimento su garage
            // Se l'inserimento è andato a buon fine, restituisco una risposta, altrimenti c'è un errore
            if (records) {
                res.send('valid entry');
            }
            else {
                res.send("errore nell'inserimento")
            }
        }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
    
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/deviceCC").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idEdificio = records[0].idEdificio;  //mi prendo l'email dell'azienda
        var dispositivi = new Array();
        var sens = {}
        var impSol = {}
        var impEol = {}
        var arr= new Array();

        var deviceS = await db_connect.collection("sensore").find({idEdificio}).toArray(); //query su edificio 
        for(var j=0;j<deviceS.length;j++)
          arr.push(deviceS[j]);
        if(arr.length>0)
          sens={sensori : arr};
        else
          sens={sensori : "nessun dispositivo"}

        //prendo impianto solare e eolico
        var deviceSol = await db_connect.collection("impiantoSolare").find({idEdificio}).toArray(); //query su edificio 
        if(deviceSol.length>0){
          impSol = {impiantoSolare : deviceSol}
        }else{
          impSol = {impiantoSolare :"nessun dispositivo"}
        }
        
        var deviceEol = await db_connect.collection("impiantoEolico").find({idEdificio}).toArray(); //query su edificio 
        if(deviceEol.length>0){
          impEol = {impiantoEolico : deviceEol}
        }else{
          impEol={impiantoEolico :"nessun dispositivo"}
        }

        dispositivi.push(sens,impSol,impEol)

        //console.log(dispositivi)
         //se l'array non è vuoto restituisco l'array,altrimenti ci sarà un errore nella query
         if (dispositivi.length>0){
            res.json(dispositivi);            
        }
    else{
        res.send('error query')
    }
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/ConProCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;
    ora = new Date(req.body.ora);
    ora2 = new Date(ora.getTime() - (60 * 60 * 1000)); //restituisco la data - 1 ora
    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda
        var IdFamiglia = records2[0].idFamiglia;
        var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
        var elettr = new Array();
        var sens = new Array();
        var totConsumo =0
        var prodEol=0
        var prodSol=0
        var deviceW = []

        //prendo elettrodomestici e sensori
        for(var i=0;i<stanze.length;i++){
            idStanza = stanze[i].id;
            var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
            var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
            for(var j=0;j<deviceE.length;j++){
                var idDispositivo=deviceE[j].id
                elettr.push(idDispositivo)
            }
            for(var j=0;j<deviceS.length;j++){
                idDispositivo=deviceS[j].id;
                sens.push(idDispositivo)
            }
        }

        //prendo wallbox
        var garage = await db_connect.collection("garage").find({IdFamiglia}).toArray(); //query su edificio 
        if(garage.length>0){
          var idGarage = garage[0].Id;
          var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
          if(deviceW.length>0)
            idWall=deviceW[0].id;
          else
            idWall=null
        }
        
        //prendo impianto solare e eolico e query per produzione istantaneo
        var deviceSol = await db_connect.collection("impiantoSolare").find({idAppartamento}).toArray(); //query su edificio 
        if(deviceSol.length>0){
          idSol=deviceSol[0].id;
          var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:idSol},{idTipoHardware:2}] }).sort({orario:-1}).limit(1).toArray();
          if(produzione.length>0){
            prodSol=produzione[0].produzione
          }else
            prodSol="ancora nessuna produzione"
          }else
          prodSol="nessun dispositivo collegato"

        var deviceEol = await db_connect.collection("impiantoEolico").find({idAppartamento}).toArray(); //query su edificio 
        if(deviceEol.length>0){
          idEol=deviceEol[0].id;
          var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:idEol},{idTipoHardware:3}] }).sort({orario:-1}).limit(1).toArray();
          if(produzione.length>0){
            prodEol=produzione[0].produzione
          }else
            prodEol="ancora nessuna produzione"
        }else
          prodEol="nessun dispositivo collegato"
        
      if (elettr.length > 0 || sens.length > 0 || deviceW.length > 0) {
        
        numConsEl=0
        numConsSe=0
        numConsWa=0
        for(var i=0;i<elettr.length;i++){
          var consumoEl = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:elettr[i]},{idTipoHardware:1}] }).sort({orario:-1}).limit(1).toArray();
          if(consumoEl.length>0){
            totConsumo=totConsumo+consumoEl[0].consumo
            numConsEl=numConsEl+1
          }
        }
        for(var i=0;i<sens.length;i++){
          var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
          if(consumoSe.length>0){
            totConsumo=totConsumo+consumoSe[0].consumo
            numConsSe=numConsSe+1
          }
        }
        
        if(deviceW.length>0){
          var consumoWa = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:deviceW[0].id},{idTipoHardware:5}] }).sort({orario:-1}).limit(1).toArray();
          if(consumoWa.length>0){
            totConsumo=totConsumo+consumoWa[0].consumo
            numConsWa=numConsWa+1
          }
        }
  
        if(numConsEl===0 && numConsSe===0 && numConsWa===0){
          totConsumo = "ancora nessun consumo"
        }
      } else {
        totConsumo = "nessun dispositivo collegato"
      }
        var arr = new Array()
        arr.push(totConsumo,prodSol,prodEol)
        res.json(arr);   

    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/ConProCFreale").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
      var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
      var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
      var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
      var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda
      var IdFamiglia = records2[0].idFamiglia;
      var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
      var elettr = new Array();
      var sens = new Array();
      var totConsumo =0
      var prodEol=0
      var prodSol=0
      var deviceW = []

      //prendo elettrodomestici e sensori
      for(var i=0;i<stanze.length;i++){
          idStanza = stanze[i].id;
          var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
          var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
          for(var j=0;j<deviceE.length;j++){
              var idDispositivo=deviceE[j].id
              elettr.push(idDispositivo)
          }
          for(var j=0;j<deviceS.length;j++){
              idDispositivo=deviceS[j].id;
              sens.push(idDispositivo)
          }
      }

      //prendo wallbox
      var garage = await db_connect.collection("garage").find({IdFamiglia}).toArray(); //query su edificio 
      if(garage.length>0){
        var idGarage = garage[0].Id;
        var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
        if(deviceW.length>0)
          idWall=deviceW[0].id;
        else
          idWall=null
      }
      
      //prendo impianto solare e eolico e query per produzione istantaneo
      var deviceSol = await db_connect.collection("impiantoSolare").find({idAppartamento}).toArray(); //query su edificio 
      if(deviceSol.length>0){
        idSol=deviceSol[0].id;
        var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:idSol},{idTipoHardware:2}] }).sort({orario:-1}).limit(1).toArray();
        if(produzione.length>0){
          prodSol=produzione[0].produzione
        }else
          prodSol="ancora nessuna produzione"
        }else
        prodSol="nessun dispositivo collegato"

      var deviceEol = await db_connect.collection("impiantoEolico").find({idAppartamento}).toArray(); //query su edificio 
      if(deviceEol.length>0){
        idEol=deviceEol[0].id;
        var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:idEol},{idTipoHardware:3}] }).sort({orario:-1}).limit(1).toArray();
        if(produzione.length>0){
          prodEol=produzione[0].produzione
        }else
          prodEol="ancora nessuna produzione"
      }else
        prodEol="nessun dispositivo collegato"
      
    if (elettr.length > 0 || sens.length > 0 || deviceW.length > 0) {
        consumo= await db_connect.collection("consumoReale").find({}).sort({orario:-1}).limit(1).toArray();
        totConsumo=consumo[0].consumo
    } else {
      totConsumo = "nessun dispositivo collegato"
    }
      var arr = new Array()
      arr.push(totConsumo,prodSol,prodEol)
      res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/statConCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;
    ora = new Date(req.body.ora);
    oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
    oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
    //restituisco la data - 1 mese
    oraM = new Date(ora.getTime()) 
    oraM.setMonth(oraM.getMonth() -1)

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda
        var IdFamiglia = records2[0].idFamiglia;
        var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
        var elettr = new Array()
        var sens = new Array()
        var idWall=null

        //prendo elettrodomestici e sensori
        for(var i=0;i<stanze.length;i++){
            idStanza = stanze[i].id;
            var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
            var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
            for(var j=0;j<deviceE.length;j++){
                var idDispositivo=deviceE[j].id
                elettr.push(idDispositivo)
            }
            for(var j=0;j<deviceS.length;j++){
                idDispositivo=deviceS[j].id;
                sens.push(idDispositivo)
            }
        }

        //prendo wallbox
        var garage = await db_connect.collection("garage").find({ IdFamiglia }).toArray(); //query su edificio 
        if(garage.length>0){
          var idGarage = garage[0].Id;
          var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
          if(deviceW.length>0)
            idWall=deviceW[0].id;
          else
            idWall=null
        }

      if (elettr.length > 0 || sens.length > 0 || idWall != null) {
        var totConsumoGel=0
        var numConsGel=0
        var totConsumoGse=0
        var numConsGse=0
        var totConsumoGwa=0
        var numConsGwa=0
        
        var totConsumoSel=0
        var numConsSel=0
        var totConsumoSse=0
        var numConsSse=0
        var totConsumoSwa=0
        var numConsSwa=0

        var totConsumoMel=0
        var numConsMel=0
        var totConsumoMse=0
        var numConsMse=0
        var totConsumoMwa=0
        var numConsMwa=0
        //media giornaliera
        for(var i=0;i<elettr.length;i++){
          var consumoEl = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:elettr[i]},{idTipoHardware:1}] }).toArray();
          for(var j=0;j<consumoEl.length;j++){
            totConsumoGel=totConsumoGel+consumoEl[j].consumo
            numConsGel=numConsGel+1
          }
        }
        for(var i=0;i<sens.length;i++){
          var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).toArray();
          for(var j=0;j<consumoSe.length;j++){
            totConsumoGse=totConsumoGse+consumoSe[j].consumo
            numConsGse=numConsGse+1
          }
        }
        if(idWall!=null){
          var consumoWa = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:idWall},{idTipoHardware:5}] }).toArray();
          for(var j=0;j<consumoWa.length;j++){
            totConsumoGwa=totConsumoGwa+consumoWa[j].consumo
            numConsGwa=numConsGwa+1
          }
        }

        //media settimanale
        for(var i=0;i<elettr.length;i++){
          var consumoEl = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraS } }, {idDispositivo:elettr[i]},{idTipoHardware:1}] }).toArray();
          for(var j=0;j<consumoEl.length;j++){
            totConsumoSel=totConsumoSel+consumoEl[j].consumo
            numConsSel=numConsSel+1
          }
        }
        for(var i=0;i<sens.length;i++){
          var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraS } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).toArray();
          for(var j=0;j<consumoSe.length;j++){
            totConsumoSse=totConsumoSse+consumoSe[j].consumo
            numConsSse=numConsSse+1
          }
        }
        if(idWall!=null){
          var consumoWa = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraS } }, {idDispositivo:idWall},{idTipoHardware:5}] }).toArray();
          for(var j=0;j<consumoWa.length;j++){
            totConsumoSwa=totConsumoSwa+consumoWa[j].consumo
            numConsSwa=numConsSwa+1
          }
        }

        //media mensile
        for(var i=0;i<elettr.length;i++){
          var consumoEl = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraM } }, {idDispositivo:elettr[i]},{idTipoHardware:1}] }).toArray();
          for(var j=0;j<consumoEl.length;j++){
            totConsumoMel=totConsumoMel+consumoEl[j].consumo
            numConsMel=numConsMel+1
          }
        }
        for(var i=0;i<sens.length;i++){
          var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraM } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).toArray();
          for(var j=0;j<consumoSe.length;j++){
            totConsumoMse=totConsumoMse+consumoSe[j].consumo
            numConsMse=numConsMse+1
          }
        }
        if(idWall!=null){
          var consumoWa = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraM } }, {idDispositivo:idWall},{idTipoHardware:5}] }).toArray();
          for(var j=0;j<consumoWa.length;j++){
            totConsumoMwa=totConsumoMwa+consumoWa[j].consumo
            numConsMwa=numConsMwa+1
          }
        }

        if (numConsGel > 0 || numConsGse > 0 || numConsGwa > 0) {
          mediaG = ((totConsumoGel/numConsGel) + (totConsumoGse/numConsGse) + (totConsumoGwa/numConsGwa)).toFixed(2);
          mediaS = ((totConsumoSel/numConsSel) + (totConsumoSse/numConsSse) + (totConsumoSwa/numConsSwa)).toFixed(2);
          mediaM = ((totConsumoMel/numConsMel) + (totConsumoMse/numConsMse) + (totConsumoMwa/numConsMwa)).toFixed(2);
        } else { //nessun dispositivo con consumo
          var mediaG = "ancora nessun consumo"
          var mediaS = "ancora nessun consumo"
          var mediaM = "ancora nessun consumo"
        }
      } else {
        var mediaG = "nessun dispositivo collegato"
        var mediaS = "nessun dispositivo collegato"
        var mediaM = "nessun dispositivo collegato"
      }
      var arr = new Array()
      arr.push(mediaG,mediaS,mediaM)
      res.json(arr);   

    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/statConCFreale").post(async function (req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime())
  oraM.setMonth(oraM.getMonth() - 1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var totConsumoGel = 0
    var numConsGel = 0
    var totConsumoSel = 0
    var numConsSel = 0
    var totConsumoMel = 0
    var numConsMel = 0

    //media giornaliera
    var consumoEl = await db_connect.collection("consumoReale").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }] }).toArray();
    for (var j = 0; j < consumoEl.length; j++) {
      totConsumoGel = totConsumoGel + consumoEl[j].consumo
      numConsGel = numConsGel + 1
    }

    //media settimanale
    var consumoEl = await db_connect.collection("consumoReale").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }] }).toArray();
    for (var j = 0; j < consumoEl.length; j++) {
      totConsumoSel = totConsumoSel + consumoEl[j].consumo
      numConsSel = numConsSel + 1
    }

    //media mensile
    var consumoEl = await db_connect.collection("consumoReale").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }] }).toArray();
    for (var j = 0; j < consumoEl.length; j++) {
      totConsumoMel = totConsumoMel + consumoEl[j].consumo
      numConsMel = numConsMel + 1
    }

    if (numConsGel > 0) {
      mediaG = Number(((totConsumoGel / numConsGel)).toFixed(2));
      mediaS = Number(((totConsumoSel / numConsSel)).toFixed(2));
      mediaM = Number(((totConsumoMel / numConsMel)).toFixed(2));
    } else { //nessun dispositivo con consumo
      var mediaG = "ancora nessun consumo"
      var mediaS = "ancora nessun consumo"
      var mediaM = "ancora nessun consumo"
    }

    var arr = new Array()
    arr.push(mediaG, mediaS, mediaM)
    res.json(arr);

  } catch (e) {
    console.log("An error occurred pulling the records. " + e);
    res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartConCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;
    ora = new Date(req.body.ora);
    oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
    //restituisco la data - 1 mese
    oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
    oraMensile =oraM  //faccio cosi perche nel while si modificava la data senza motivo

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda
        var IdFamiglia = records2[0].idFamiglia;
        var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
        var elettr = new Array()
        var sens = new Array()
        var idWall=null

        //prendo elettrodomestici e sensori
        for(var i=0;i<stanze.length;i++){
            idStanza = stanze[i].id;
            var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
            var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
            for(var j=0;j<deviceE.length;j++){
                var idDispositivo=deviceE[j].id
                elettr.push(idDispositivo)
            }
            for(var j=0;j<deviceS.length;j++){
                idDispositivo=deviceS[j].id;
                sens.push(idDispositivo)
            }
        }

        //prendo wallbox
        var garage = await db_connect.collection("garage").find({ IdFamiglia }).toArray(); //query su edificio 
        if(garage.length>0){
          var idGarage = garage[0].Id;
          var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
          if(deviceW.length>0)
            idWall=deviceW[0].id;
          else
            idWall=null
        }
    
        var arrConsumo = new Array()
        var arrDate = new Array()
        const arr = new Array()
                
        //queri per le varie medie
      if (elettr.length > 0 || sens.length > 0 || idWall != null) {
        while (oraMensile <= ora) {

          var totConsumoGel=0
          var numConsGel=0
          var totConsumoGse=0
          var numConsGse=0
          var totConsumoGwa=0
          var numConsGwa=0
          //media giornaliera
          for(var i=0;i<elettr.length;i++){
            var consumoEl = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:elettr[i]},{idTipoHardware:1}] }).toArray();
            for(var j=0;j<consumoEl.length;j++){
              totConsumoGel=totConsumoGel+consumoEl[j].consumo
              numConsGel=numConsGel+1
            }
          }
          for(var i=0;i<sens.length;i++){
            var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).toArray();
            for(var j=0;j<consumoSe.length;j++){
              totConsumoGse=totConsumoGse+consumoSe[j].consumo
              numConsGse=numConsGse+1
            }
          }
          if(idWall!=null){
            var consumoWa = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:idWall},{idTipoHardware:5}] }).toArray();
            for(var j=0;j<consumoWa.length;j++){
              totConsumoGwa=totConsumoGwa+consumoWa[j].consumo
              numConsGwa=numConsGwa+1
            }
          }

          if (numConsGel > 0 || numConsGse > 0 || numConsGwa > 0) {
            mediaG = ((totConsumoGel/numConsGel) + (totConsumoGse/numConsGse) + (totConsumoGwa/numConsGwa)).toFixed(2);
            if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
              arrConsumo.push(Number(mediaG))
              arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
            }
          }else{
            arr.push("ancora nessun consumo")
            break; //esci dal while
          }
          oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
          ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
        }
        if(arr.length===0) //perchè potrebbe esserci "ancora nessun consumo" per via del break
          arr.push(arrConsumo,arrDate)
      }else{
        arr.push("nessun dispositivo collegato")
      }
        res.json(arr);   
    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartConCFreale").post(async function (req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
  oraMensile = oraM  //faccio cosi perche nel while si modificava la data senza motivo

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {

    var arrConsumo = new Array()
    var arrDate = new Array()
    const arr = new Array()

    //queri per le varie medie

    while (oraMensile <= ora) {
      var totConsumoGel = 0
      var numConsGel = 0

      //media giornaliera
      var consumoEl = await db_connect.collection("consumoReale").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }] }).toArray();
      for (var j = 0; j < consumoEl.length; j++) {
        totConsumoGel = totConsumoGel + consumoEl[j].consumo
        numConsGel = numConsGel + 1
      }

      if (numConsGel >= 0) {
        mediaG = Number(((totConsumoGel / numConsGel)).toFixed(2));
        if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
          arrConsumo.push(Number(mediaG))
          arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
        }
      } else {
        arr.push("ancora nessun consumo")
        break; //esci dal while
      }
      oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
      ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
    }
    if (arr.length === 0) //perchè potrebbe esserci "ancora nessun consumo" per via del break
      arr.push(arrConsumo, arrDate)
    res.json(arr);
  } catch (e) {
    console.log("An error occurred pulling the records. " + e);
    res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartDevice").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();
  var idDevice=req.body.idDevice
  var tipoHardware=req.body.tipoHardware
  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
  oraMensile =oraM  //faccio cosi perche nel while si modificava la data senza motivo

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
  
      var arrConsumo = new Array()
      var arrDate = new Array()
      const arr = new Array()
              
      //queri per le varie medie
      while (oraMensile <= ora) {

        var tot=0
        var numC=0

        //media giornaliera
        if(tipoHardware===1 || tipoHardware===4 || tipoHardware===5){
          var consumo = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:idDevice},{idTipoHardware:tipoHardware}] }).toArray();
          for(var j=0;j<consumo.length;j++){
            tot=tot+consumo[j].consumo
            numC=numC+1
          }
        }else{
          var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:idDevice},{idTipoHardware:tipoHardware}] }).toArray();
          for(var j=0;j<produzione.length;j++){
            tot=tot+produzione[j].produzione
            numC=numC+1
          }
        }
          

        if (numC > 0) {
          mediaG = ((tot/numC)).toFixed(2);
          if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
            arrConsumo.push(Number(mediaG))
            arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
          }
        }else{
          arr.push("ancora nessun consumo")
          break; //esci dal while
        }
        oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
        ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
      }
      if(arr.length===0) //perchè potrebbe esserci "ancora nessun consumo" per via del break
        arr.push(arrConsumo,arrDate)
      res.json(arr);   
  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartDeviceReale").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();
  var idDevice=req.body.idDevice
  var tipoHardware=req.body.tipoHardware
  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
  oraMensile =oraM  //faccio cosi perche nel while si modificava la data senza motivo

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
  
      var arrConsumo = new Array()
      var arrDate = new Array()
      const arr = new Array()
            
      //queri per le varie medie
      while (oraMensile <= ora) {

        var tot=0
        var numC=0

        //media giornaliera
        if(tipoHardware===1 || tipoHardware===4 || tipoHardware===5){
          var consumo = await db_connect.collection("consumoPrese").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:idDevice},{idTipoHardware:tipoHardware}] }).toArray();
          for(var j=0;j<consumo.length;j++){
            tot=tot+consumo[j].consumo
            numC=numC+1
          }
        }else{
          var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraG } }, {idDispositivo:idDevice},{idTipoHardware:tipoHardware}] }).toArray();
          for(var j=0;j<produzione.length;j++){
            tot=tot+produzione[j].produzione
            numC=numC+1
          }
        }
          
        if (numC > 0) {
          mediaG = ((tot/numC)).toFixed(2);
          if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
            arrConsumo.push(Number(mediaG))
            arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
          }
        }
        oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
        ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
      }
      if(arr.length===0) //perchè potrebbe esserci "ancora nessun consumo" per via del break
        arr.push(arrConsumo,arrDate)
      res.json(arr);   
  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/statProCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;
    ora = new Date(req.body.ora);
    oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
    oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
    //restituisco la data - 1 mese
    oraM = new Date(ora.getTime()) 
    oraM.setMonth(oraM.getMonth() -1)

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda

        //prendo solare e eolico
        var impSol = await db_connect.collection("impiantoSolare").find({ idAppartamento }).toArray(); //query su edificio 
        if(impSol.length>0){
          var deviceSol = impSol[0].id
        }else{
          var deviceSol = null
        }

        var impEol = await db_connect.collection("impiantoEolico").find({ idAppartamento }).toArray(); //query su edificio 
        if(impEol.length>0){
          var deviceEol = impEol[0].id
        }else{
          var deviceEol = null
        }

        if(deviceEol!=null || deviceSol!=null){
          //queri per le varie medie
 
          var totProdGs = 0
          var numProdGs = 0
          var totProdGe = 0
          var numProdGe = 0

          var totProdSs = 0
          var numProdSs = 0
          var totProdSe = 0
          var numProdSe = 0

          var totProdMs = 0
          var numProdMs = 0
          var totProdMe = 0
          var numProdMe = 0
      
          //media giornaliera
          if (deviceEol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdGe = totProdGe + produzione[j].produzione
              numProdGe = numProdGe + 1
            }
          }
          if (deviceSol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdGs = totProdGs + produzione[j].produzione
              numProdGs = numProdGs + 1
            }
          }

          //media settimanale
          if (deviceEol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdSe = totProdSe + produzione[j].produzione
              numProdSe = numProdSe + 1
            }
          }
          if (deviceSol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdSs = totProdSs + produzione[j].produzione
              numProdSs = numProdSs + 1
            }
          }

          //media mensile
          if (deviceEol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdMe = totProdMe + produzione[j].produzione
              numProdMe = numProdMe + 1
            }
          }
          if (deviceSol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdMs = totProdMs + produzione[j].produzione
              numProdMs = numProdMs + 1
            }
          }
        
          if(deviceSol!=null){
            if (numProdGs > 0){
              mediaGsol = (totProdGs/numProdGs).toFixed(2);
              mediaSsol = (totProdSs/numProdSs).toFixed(2);
              mediaMsol = (totProdMs/numProdMs).toFixed(2);
            }else{
              mediaGsol = "ancora nessuna produzione"
              mediaSsol = "ancora nessuna produzione"
              mediaMsol = "ancora nessuna produzione"
            }
          }else{
            mediaGsol = "nessun dispositivo collegato"
            mediaSsol = "nessun dispositivo collegato"
            mediaMsol = "nessun dispositivo collegato"
          }
          
          if(deviceEol!=null){
            if (numProdGe > 0){
              mediaGeol = (totProdGe/numProdGe).toFixed(2);
              mediaSeol = (totProdSe/numProdSe).toFixed(2);
              mediaMeol = (totProdMe/numProdMe).toFixed(2);
            }else{
              mediaGeol = "ancora nessuna produzione"
              mediaSeol = "ancora nessuna produzione"
              mediaMeol = "ancora nessuna produzione"
            }
          }else{
            mediaGeol = "nessun dispositivo collegato"
            mediaSeol = "nessun dispositivo collegato"
            mediaMeol = "nessun dispositivo collegato"
          }
        }else{
          mediaGsol = "nessun dispositivo collegato"
          mediaSsol = "nessun dispositivo collegato"
          mediaMsol = "nessun dispositivo collegato"

          mediaGeol = "nessun dispositivo collegato"
          mediaSeol = "nessun dispositivo collegato"
          mediaMeol = "nessun dispositivo collegato"
        }

        var arr = new Array()
        arr.push(mediaGsol, mediaSsol, mediaMsol, mediaGeol, mediaSeol, mediaMeol)
        res.json(arr);   

    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartProCF").post(async function(req, res) {

    // Otteniamo la connessione al database
    let db_connect = dbo.getDb();

    // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
    email = req.body.email;
    ora = new Date(req.body.ora);
    oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
    //console.log(oraG)
    //restituisco la data - 1 mese
    oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
    oraMensile =oraM  //faccio cosi perche nel while si modificava la data senza motivo
    //console.log(oraM);

    // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
    try {
        var arrProdEol = new Array()
        var arrProdSol = new Array()
        var arrDate = new Array()
        var arrDate2 = new Array() //array di comodo per gestire meglio la query
        const arr = new Array()
        
        var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
        var idFamiglia = records[0].idFamiglia;  //mi prendo l'email dell'azienda
        var records2 = await db_connect.collection("appartamento").find({idFamiglia}).toArray();  //query su azienda
        var idAppartamento = records2[0].id;  //mi prendo la città dell'azienda

        //prendo solare e eolico
        var impSol = await db_connect.collection("impiantoSolare").find({ idAppartamento }).toArray(); //query su edificio 
        if(impSol.length>0){
          var deviceSol = impSol[0].id
        }else{
          var deviceSol = null
        }

        var impEol = await db_connect.collection("impiantoEolico").find({ idAppartamento }).toArray(); //query su edificio 
        if(impEol.length){
          var deviceEol = impEol[0].id
        }else{
          var deviceEol = null
        }
    
      //queri per le varie medie
      if (deviceEol != null || deviceSol != null) {
        while (oraMensile <= ora) {
  /*
          var mediaGiornaliera = await db_connect.collection("produzione").aggregate([
            {
              $facet: {
                mediaProduzioneSol: [
                  {
                    $match: {
                      $and: [
                        { orario: { $lte: ora } },
                        { orario: { $gte: oraG } }
                      ],
                      idDispositivo: deviceSol,
                      idTipoHardware: 2
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      mediaProduzione: { $avg: "$produzione" },
                      numDispositiviPro: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                    }
                  }
                ],
                mediaProduzioneEol: [
                  {
                    $match: {
                      $and: [
                        { orario: { $lte: ora } },
                        { orario: { $gte: oraG } }
                      ],
                      idDispositivo: deviceEol,
                      idTipoHardware: 3
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      mediaProduzione: { $avg: "$produzione" },
                      numDispositiviPro: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                    }
                  }
                ]
              }
            },
            {
              $project: {
                _id: 0,
                mediaProduzioneSol: { $arrayElemAt: ["$mediaProduzioneSol", 0] },
                mediaProduzioneEol: { $arrayElemAt: ["$mediaProduzioneEol", 0] }
              }
            },
            {
              $project: {
                mediaProduzioneSol: { $ifNull: ["$mediaProduzioneSol.mediaProduzione", 0] },
                mediaProduzioneEol: { $ifNull: ["$mediaProduzioneEol.mediaProduzione", 0] },
                numDispositiviSolPro: { $ifNull: ["$mediaProduzioneSol.numDispositiviPro", null] }, // Aggiungi questi campi per recuperare il numero di dispositivi per ogni categoria
                numDispositiviEolPro: { $ifNull: ["$mediaProduzioneEol.numDispositiviPro", null] }
              }
            }
          ]).toArray();
*/
          var totProdGs = 0
          var numProdGs = 0
          var totProdGe = 0
          var numProdGe = 0
          //media giornaliera
          if (deviceEol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdGe = totProdGe + produzione[j].produzione
              numProdGe = numProdGe + 1
            }
          }
          if (deviceSol != null) {
            var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
            for (var j = 0; j < produzione.length; j++) {
              totProdGs = totProdGs + produzione[j].produzione
              numProdGs = numProdGs + 1
            }
          }

          if (deviceSol != null) {
            if (numProdGs > 0) {
              mediaGsol = (totProdGs/numProdGs).toFixed(2);
              if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
                arrProdSol.push(Number(mediaGsol))
                arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
              }
            } else {
              mediaGsol = "ancora nessuna produzione"
            }
          } else {
            mediaGsol = "nessun dispositivo collegato"
          }

          if (deviceEol != null) {
            if (numProdGe > 0) {
              mediaGeol = (totProdGe/numProdGe).toFixed(2);
              if (!arrDate2.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
                arrProdEol.push(Number(mediaGeol))
                arrDate2.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
              }
            } else {
              mediaGeol= "ancora nessuna produzione"
            }
          } else {
            mediaGeol = "nessun dispositivo collegato"
          }
          oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
          ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
        }
        if(arrProdSol.length===0)
          arrProdSol.push(mediaGsol)
        if(arrProdEol.length===0)
          arrProdEol.push(mediaGeol)
        arr.push(arrDate,arrProdSol,arrProdEol)
      } else {
        arr.push(["nessun dispositivo collegato"])
      }
        res.json(arr);   

    } catch (e) {
        console.log("An error occurred pulling the records. " + e);
        res.send('error query')
    }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/showConsumoDevice").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  idDevice = req.body.idDevice;
  tipoHardware = req.body.tipoHardware;
  ora = new Date(req.body.ora);
  ora1 = new Date(ora.getTime() - (60 * 60 * 1000)); //restituisco la data - 1 ora
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime()) 
  oraM.setMonth(oraM.getMonth() -1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var mediaGd = 0
    var mediaSd = 0
    var mediaMd = 0
    var numMediaG = 0
    var numMediaS = 0
    var numMediaM = 0
    //queri per le varie medie consumo
    if(tipoHardware===1 || tipoHardware===4 || tipoHardware===5 ){

      //var consumo = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).sort({ orario: -1 }).limit(1).toArray();
      var consumo = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).sort({ orario: -1 }).limit(1).toArray();
      if(consumo.length<=0){
        vaIst = "ancora nessun consumo"
        mediaG = "ancora nessun consumo"
        mediaS = "ancora nessun consumo"
        mediaM = "ancora nessun consumo"
      }else{
        vaIst = consumo[0].consumo //consumo istantaneo
        
        //consumo giornaliero
        var consumo = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < consumo.length; j++) {
          mediaGd = mediaGd + consumo[j].consumo
          numMediaG = numMediaG + 1
        }
        //consumo settimanale
        var consumo = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware  }] }).toArray();
        for (var j = 0; j < consumo.length; j++) {
          mediaSd = mediaSd + consumo[j].consumo
          numMediaS = numMediaS + 1
        }
        //consumo mensile
        var consumo = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware  }] }).toArray();
        for (var j = 0; j < consumo.length; j++) {
          mediaMd = mediaMd + consumo[j].consumo
          numMediaM = numMediaM + 1
        }
        var mediaG = Number(((mediaGd) / (numMediaG)).toFixed(2))
        var mediaS = Number(((mediaSd) / (numMediaS)).toFixed(2))
        var mediaM = Number(((mediaMd) / (numMediaM)).toFixed(2))
      }
    }else{
      var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora1 } },{idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).sort({ orario: -1 }).limit(1).toArray();
      if(produzione.length<=0){
        vaIst = "ancora nessuna produzione"
        mediaG = "ancora nessuna produzione"
        mediaS = "ancora nessuna produzione"
        mediaM = "ancora nessuna produzione"
      }else{
        vaIst = produzione[0].produzione //produzione istantanea
        
        //produzione giornaliero
        var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < produzione.length; j++) {
          mediaGd = mediaGd + produzione[j].produzione
          numMediaG = numMediaG + 1
        }
        //produzione settimanale
        var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < produzione.length; j++) {
          mediaSd = mediaSd + produzione[j].produzione
          numMediaS = numMediaS + 1
        }
        //produzione mensile
        var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < produzione.length; j++) {
          mediaMd = mediaMd + produzione[j].produzione
          numMediaM = numMediaM + 1
        }
        var mediaG = Number(((mediaGd) / (numMediaG)).toFixed(2))
        var mediaS = Number(((mediaSd) / (numMediaS)).toFixed(2))
        var mediaM = Number(((mediaMd) / (numMediaM)).toFixed(2))
      }
    }

    //console.log(consumoIst,mediaG,mediaS,mediaM)
    var arr = new Array()
    arr.push(vaIst,mediaG, mediaS, mediaM)
    res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/showConsumoDeviceReali").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  idDevice = req.body.idDevice;
  tipoHardware = req.body.tipoHardware;
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime()) 
  oraM.setMonth(oraM.getMonth() -1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var mediaGd = 0
    var mediaSd = 0
    var mediaMd = 0
    var numMediaG = 0
    var numMediaS = 0
    var numMediaM = 0
    //queri per le varie medie consumo
    if(tipoHardware===1 || tipoHardware===4 || tipoHardware===5 ){

      //var consumo = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).sort({ orario: -1 }).limit(1).toArray();
      var consumo = await db_connect.collection("consumoPrese").find({ $and: [ { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).sort({ orario: -1 }).limit(1).toArray();
      if(consumo.length<=0){
        vaIst = "ancora nessun consumo"
        mediaG = "ancora nessun consumo"
        mediaS = "ancora nessun consumo"
        mediaM = "ancora nessun consumo"
      }else{
        vaIst = consumo[0].consumo //consumo istantaneo
        
        //consumo giornaliero
        var consumo = await db_connect.collection("consumoPrese").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < consumo.length; j++) {
          mediaGd = mediaGd + consumo[j].consumo
          numMediaG = numMediaG + 1
        }
        //consumo settimanale
        var consumo = await db_connect.collection("consumoPrese").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware  }] }).toArray();
        for (var j = 0; j < consumo.length; j++) {
          mediaSd = mediaSd + consumo[j].consumo
          numMediaS = numMediaS + 1
        }
        //consumo mensile
        var consumo = await db_connect.collection("consumoPrese").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware  }] }).toArray();
        for (var j = 0; j < consumo.length; j++) {
          mediaMd = mediaMd + consumo[j].consumo
          numMediaM = numMediaM + 1
        }
        var mediaG = Number(((mediaGd) / (numMediaG)).toFixed(2))
        var mediaS = Number(((mediaSd) / (numMediaS)).toFixed(2))
        var mediaM = Number(((mediaMd) / (numMediaM)).toFixed(2))
      }
    }else{
      var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).sort({ orario: -1 }).limit(1).toArray();
      if(produzione.length<=0){
        vaIst = "ancora nessuna produzione"
        mediaG = "ancora nessuna produzione"
        mediaS = "ancora nessuna produzione"
        mediaM = "ancora nessuna produzione"
      }else{
        vaIst = produzione[0].produzione //produzione istantanea
        
        //produzione giornaliero
        var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < produzione.length; j++) {
          mediaGd = mediaGd + produzione[j].produzione
          numMediaG = numMediaG + 1
        }
        //produzione settimanale
        var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < produzione.length; j++) {
          mediaSd = mediaSd + produzione[j].produzione
          numMediaS = numMediaS + 1
        }
        //produzione mensile
        var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: idDevice }, { idTipoHardware: tipoHardware }] }).toArray();
        for (var j = 0; j < produzione.length; j++) {
          mediaMd = mediaMd + produzione[j].produzione
          numMediaM = numMediaM + 1
        }
        var mediaG = Number(((mediaGd) / (numMediaG)).toFixed(2))
        var mediaS = Number(((mediaSd) / (numMediaS)).toFixed(2))
        var mediaM = Number(((mediaMd) / (numMediaM)).toFixed(2))
      }
    }

    //console.log(vaIst,mediaG,mediaS,mediaM)
    var arr = new Array()
    arr.push(vaIst,mediaG, mediaS, mediaM)
    res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/showConsumoStanza").post(async function (req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  idStanza = req.body.idStanza;
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime())
  oraM.setMonth(oraM.getMonth() - 1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var elettr = new Array()
    var sens = new Array()
    var totConsumo = 0
    var mediaGel=0
    var mediaGse=0
    var mediaSel=0
    var mediaSse=0
    var mediaMel=0
    var mediaMse=0
    var numConsEl = 0
    var numConsSe = 0
    var numMediaG = 0
    var numMediaS = 0
    var numMediaM = 0
    //prendo elettrodomestici e sensori

    var deviceE = await db_connect.collection("elettrodomestico").find({ idStanza }).toArray(); //query su edificio 
    var deviceS = await db_connect.collection("sensore").find({ idStanza }).toArray(); //query su edificio 
    for (var j = 0; j < deviceE.length; j++) {
      var idDispositivo = deviceE[j].id
      elettr.push(idDispositivo)
    }
    for (var j = 0; j < deviceS.length; j++) {
      idDispositivo = deviceS[j].id;
      sens.push(idDispositivo)
    }

    if (elettr.length > 0 || sens.length > 0) {
      
      //consumo istantaneo
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).sort({ orario: -1 }).limit(1).toArray();
        if (consumoEl.length > 0) {
          totConsumo = totConsumo + consumoEl[0].consumo
          numConsEl = numConsEl + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        if(consumoSe.length>0){
          totConsumo=totConsumo+consumoSe[0].consumo
          numConsSe=numConsSe+1
        }
      }

      //media giornaliera
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0;j<consumoEl.length;j++) {
          mediaGel = mediaGel + consumoEl[j].consumo
          numMediaG = numMediaG + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        for(var j=0;j<consumoSe.length;j++){
          mediaGse = mediaGse + consumoSe[j].consumo
          numMediaG = numMediaG + 1
        }
      }

      //media settimanale
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0;j<consumoEl.length;j++) {
          mediaSel = mediaSel + consumoEl[j].consumo
          numMediaS = numMediaS + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraS } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        for(var j=0;j<consumoSe.length;j++){
          mediaSse = mediaSse + consumoSe[j].consumo
          numMediaS = numMediaS + 1
        }
      }

      //media mensile
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0;j<consumoEl.length;j++) {
          mediaMel = mediaMel + consumoEl[j].consumo
          numMediaM = numMediaM + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraM } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        for(var j=0;j<consumoSe.length;j++){
          mediaMse = mediaMse + consumoSe[j].consumo
          numMediaM = numMediaM + 1
        }
      }

      if(numConsEl>0 || numConsSe>0){
        var mediaG=((mediaGel+mediaGse)/(numMediaG)).toFixed(2)
        var mediaS=((mediaSel+mediaSse)/(numMediaS)).toFixed(2)
        var mediaM=((mediaMel+mediaMse)/(numMediaM)).toFixed(2)
      }else{
        var totConsumo = "ancora nessun consumo"
        var mediaG = "ancora nessun consumo"
        var mediaS = "ancora nessun consumo"
        var mediaM = "ancora nessun consumo"
      }
    } else {
      var totConsumo = "nessun dispositivo collegato"
      var mediaG = "nessun dispositivo collegato"
      var mediaS = "nessun dispositivo collegato"
      var mediaM = "nessun dispositivo collegato"
    }
    var arr = new Array()
    arr.push(totConsumo, mediaG, mediaS, mediaM)
    res.json(arr);

  } catch (e) {
    console.log("An error occurred pulling the records. " + e);
    res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/showConsumoStanzaReale").post(async function (req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  idStanza = req.body.idStanza;
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime())
  oraM.setMonth(oraM.getMonth() - 1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var elettr = new Array()
    var sens = new Array()
    var totConsumo = 0
    var mediaGel=0
    var mediaGse=0
    var mediaSel=0
    var mediaSse=0
    var mediaMel=0
    var mediaMse=0
    var numConsEl = 0
    var numConsSe = 0
    var numMediaG = 0
    var numMediaS = 0
    var numMediaM = 0
    //prendo elettrodomestici e sensori

    var deviceE = await db_connect.collection("elettrodomestico").find({ idStanza }).toArray(); //query su edificio 
    var deviceS = await db_connect.collection("sensore").find({ idStanza }).toArray(); //query su edificio 
    for (var j = 0; j < deviceE.length; j++) {
      var idDispositivo = deviceE[j].id
      elettr.push(idDispositivo)
    }
    for (var j = 0; j < deviceS.length; j++) {
      idDispositivo = deviceS[j].id;
      sens.push(idDispositivo)
    }

    if (elettr.length > 0 || sens.length > 0) {
      
      //consumo istantaneo
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumoPrese").find({ $and: [{ idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).sort({ orario: -1 }).limit(1).toArray();
        if (consumoEl.length > 0) {
          totConsumo = totConsumo + consumoEl[0].consumo
          numConsEl = numConsEl + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        if(consumoSe.length>0){
          totConsumo=totConsumo+consumoSe[0].consumo
          numConsSe=numConsSe+1
        }
      }

      //media giornaliera
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumoPrese").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0;j<consumoEl.length;j++) {
          mediaGel = mediaGel + consumoEl[j].consumo
          numMediaG = numMediaG + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        for(var j=0;j<consumoSe.length;j++){
          mediaGse = mediaGse + consumoSe[j].consumo
          numMediaG = numMediaG + 1
        }
      }

      //media settimanale
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumoPrese").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0;j<consumoEl.length;j++) {
          mediaSel = mediaSel + consumoEl[j].consumo
          numMediaS = numMediaS + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraS } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        for(var j=0;j<consumoSe.length;j++){
          mediaSse = mediaSse + consumoSe[j].consumo
          numMediaS = numMediaS + 1
        }
      }

      //media mensile
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumoPrese").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0;j<consumoEl.length;j++) {
          mediaMel = mediaMel + consumoEl[j].consumo
          numMediaM = numMediaM + 1
        }
      }
      for(var i=0;i<sens.length;i++){
        var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: oraM } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
        for(var j=0;j<consumoSe.length;j++){
          mediaMse = mediaMse + consumoSe[j].consumo
          numMediaM = numMediaM + 1
        }
      }

      if(numConsEl>0 || numConsSe>0){
        var mediaG=Number(((mediaGel+mediaGse)/(numMediaG)).toFixed(2))
        var mediaS=Number(((mediaSel+mediaSse)/(numMediaS)).toFixed(2))
        var mediaM=Number(((mediaMel+mediaMse)/(numMediaM)).toFixed(2))
      }else{
        var totConsumo = "ancora nessun consumo"
        var mediaG = "ancora nessun consumo"
        var mediaS = "ancora nessun consumo"
        var mediaM = "ancora nessun consumo"
      }
    } else {
      var totConsumo = "nessun dispositivo collegato"
      var mediaG = "nessun dispositivo collegato"
      var mediaS = "nessun dispositivo collegato"
      var mediaM = "nessun dispositivo collegato"
    }
    var arr = new Array()
    arr.push(totConsumo, mediaG, mediaS, mediaM)
    res.json(arr);

  } catch (e) {
    console.log("An error occurred pulling the records. " + e);
    res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/showConsumoGarage").post(async function (req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  idGarage = req.body.idGarage
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime())
  oraM.setMonth(oraM.getMonth() - 1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {

    var totConsumo = 0
    var mediaGw = 0
    var mediaSw = 0
    var mediaMw = 0
    var numCons = 0
    var numMediaG = 0
    var numMediaS = 0
    var numMediaM = 0

    var deviceW = await db_connect.collection("wallbox").find({ idGarage }).toArray(); //query su edificio 
    if(deviceW.length>0){
      var idDevice = deviceW[0].id

      //consumo istantaneo
      var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: idDevice }, { idTipoHardware: 5 }] }).sort({ orario: -1 }).limit(1).toArray();
      if (consumoWa.length > 0) {
        totConsumo = totConsumo + consumoWa[0].consumo
        numCons = numCons + 1
      }
      //consumo giornaliero
      var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: idDevice }, { idTipoHardware: 5 }] }).toArray();
      for (var j = 0; j < consumoWa.length; j++) {
        mediaGw = mediaGw + consumoWa[j].consumo
        numMediaG = numMediaG + 1
      }
      //consumo settimanale
      var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: idDevice }, { idTipoHardware: 5 }] }).toArray();
      for (var j = 0; j < consumoWa.length; j++) {
        mediaSw = mediaSw + consumoWa[j].consumo
        numMediaS = numMediaS + 1
      }
      //consumo mensile
      var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: idDevice }, { idTipoHardware: 5 }] }).toArray();
      for (var j = 0; j < consumoWa.length; j++) {
        mediaMw = mediaMw + consumoWa[j].consumo
        numMediaM = numMediaM + 1
      }

      if(numCons>0){
        var mediaG=((mediaGw)/(numMediaG)).toFixed(2)
        var mediaS=((mediaSw)/(numMediaS)).toFixed(2)
        var mediaM=((mediaMw)/(numMediaM)).toFixed(2)
      }else{ //nessun dispositivo ha consumato energia
        var totConsumo = "ancora nessun consumo"
        var mediaG = "ancora nessun consumo"
        var mediaS = "ancora nessun consumo"
        var mediaM = "ancora nessun consumo"
      }
    }else {
      var totConsumo = "nessun dispositivo collegato"
      var mediaG = "nessun dispositivo collegato"
      var mediaS = "nessun dispositivo collegato"
      var mediaM = "nessun dispositivo collegato"
    }
    
    var arr = new Array()
    arr.push(totConsumo, mediaG, mediaS, mediaM)
    res.json(arr);

  } catch (e) {
    console.log("An error occurred pulling the records. " + e);
    res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/ConProCC").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti
  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
      var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
      var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio  
      var records = await db_connect.collection("edificio").find({ id:idEdificio }).toArray();  //query su persona
      var nomeEdificio = records[0].NomeEdificio
      var appartamenti = await db_connect.collection("appartamento").find({idEdificio}).toArray();
      var sens = new Array();
      var elettr = new Array();
      var wall = new Array()
      var totConsumo=0
     
    //prendo sensori dell'edificio
    var deviceS = await db_connect.collection("sensore").find({ idEdificio }).toArray(); //query su edificio 
    for (var j = 0; j < deviceS.length; j++) {
      idDispositivo = deviceS[j].id;
      sens.push(idDispositivo)
    }
    //prendo sensori e elettrodomestici degli appartamenti
    for(var i=0;i<appartamenti.length;i++){
      var idAppartamento = appartamenti[i].id
      var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
      for(var k=0;k<stanze.length;k++){
        var idStanza = stanze[k].id
        var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
        var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
        for(var j=0;j<deviceE.length;j++){
          var idDispositivo=deviceE[j].id
          elettr.push(idDispositivo)
        }
        for(var j=0;j<deviceS.length;j++){
          idDispositivo=deviceS[j].id;
          sens.push(idDispositivo)
        }
      }
    }
    //prendo wallbox nei garage dell'edificio
    var garage = await db_connect.collection("garage").find({IdEdificio:idEdificio}).toArray(); //query su edificio 
    for(var i=0;i<garage.length;i++){
      var idGarage = garage[i].Id;
      var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
      if(deviceW.length>0){
        var idWall=deviceW[0].id;
        wall.push(idWall)
      }
    }

      //prendo impianto solare e eolico e query per produzione istantaneo
      var deviceSol = await db_connect.collection("impiantoSolare").find({idEdificio}).toArray(); //query su edificio 
      if(deviceSol.length>0){
        idSol=deviceSol[0].id;
        var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}}, {idDispositivo:idSol},{idTipoHardware:2}] }).sort({orario:-1}).limit(1).toArray();
        if(produzione.length>0){
          prodSol=produzione[0].produzione
        }else
          prodSol="ancora nessuna produzione"
      }else
        prodSol="nessun dispositivo collegato"

      var deviceEol = await db_connect.collection("impiantoEolico").find({idEdificio}).toArray(); //query su edificio 
      if(deviceEol.length>0){
        idEol=deviceEol[0].id;
        var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}}, {idDispositivo:idEol},{idTipoHardware:3}] }).sort({orario:-1}).limit(1).toArray();
        if(produzione.length>0){
          prodEol=produzione[0].produzione
        }else
          prodEol="ancora nessuna produzione"
      }else
        prodEol="nessun dispositivo collegato"

      
      if (elettr.length > 0 || sens.length > 0 || wall.length > 0) {
        var numConsEl=0
        var numConsSe=0
        var numConsWa=0
        //consumi istantanei 
        for(var i=0;i<elettr.length;i++){
          var consumoEl = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:elettr[i]},{idTipoHardware:1}] }).sort({orario:-1}).limit(1).toArray();
          if(consumoEl.length>0){
            totConsumo=totConsumo+consumoEl[0].consumo
            numConsEl=numConsEl+1
          }
        }
        for(var i=0;i<sens.length;i++){
          var consumoSe = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:sens[i]},{idTipoHardware:4}] }).sort({orario:-1}).limit(1).toArray();
          if(consumoSe.length>0){
            totConsumo=totConsumo+consumoSe[0].consumo
            numConsSe=numConsSe+1
          }
        }
        
        for(var i=0;i<wall.length;i++){
          var consumoWa = await db_connect.collection("consumo").find({$and:[ {orario : {$lte: ora}},{ orario: { $gt: ora2 } }, {idDispositivo:wall[i]},{idTipoHardware:5}] }).sort({orario:-1}).limit(1).toArray();
          if(consumoWa.length>0){
            totConsumo=totConsumo+consumoWa[0].consumo
            numConsWa=numConsWa+1
          }
        }

        if (numConsEl === 0 && numConsSe === 0 && numConsWa > 0) { //controllo per vedere sei i dispositivi hanno un consumo
          totConsumo = "ancora nessun consumo"
        }
      }else{
        totConsumo = "nessun dispositivo collegato"
      }

      var arr = new Array()
      arr.push(totConsumo,prodSol,prodEol,nomeEdificio)
      res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/ConProSU").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  ora2 = new Date(ora.getTime() - (10 * 60 * 1000)); //restituisco la data - 10 minuti

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {


      var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
      var emailAzienda = records[0].emailAzienda;  //mi prendo l'id dell'edificio
      var records = await db_connect.collection("azienda").find({ email:emailAzienda }).toArray();  //query su persona
      var city = records[0].city
      var edifici = await db_connect.collection("edificio").find({ NomeCitta:city }).toArray();
      if(edifici.length===0){
        res.json("nessun edificio")
      }
      var arrEdi = new Array();
      var ed = new Array();
      var nomiEd = new Array();
      

      //mi prendo gli id degli edifici
      for (var j = 0; j < edifici.length; j++) {
        idEd = edifici[j].id;
        ed.push(idEd)
        nome=edifici[j].NomeEdificio;
        nomiEd.push(nome)
      }
      //ciclo per prendere i dispositivi e fare le query
      for (var i=0; i<ed.length; i++){
        var arr = new Array();
        var totConsumo=0
        var prodSol=0
        var prodEol=0
        var sens = new Array();
        var elettr = new Array();
        var wall = new Array()
        var dimEl = 1
        var dimSe = 1
        var dimWa = 1

        var appartamenti = await db_connect.collection("appartamento").find({idEdificio:ed[i]}).toArray();
        //prendo sensori e elettrodomestici degli appartamenti dell'edificio
        for (var z = 0; z < appartamenti.length; z++) {
          var idAppartamento = appartamenti[z].id
          var stanze = await db_connect.collection("stanza").find({ idAppartamento }).toArray(); //query su edificio     
          for (var k = 0; k < stanze.length; k++) {
            var idStanza = stanze[k].id
            var deviceE = await db_connect.collection("elettrodomestico").find({ idStanza }).toArray(); //query su edificio 
            var deviceS = await db_connect.collection("sensore").find({ idStanza }).toArray(); //query su edificio 
            for (var j = 0; j < deviceE.length; j++) {
              var idDispositivo = deviceE[j].id
              elettr.push(idDispositivo)
            }
            for (var j = 0; j < deviceS.length; j++) {
              idDispositivo = deviceS[j].id;
              sens.push(idDispositivo)
            }
          }
        }
        //prendo gli id dei sensori dell'edificio
        var deviceS = await db_connect.collection("sensore").find({ idEdificio:ed[i] }).toArray(); //query su edificio 
        for (var j = 0; j < deviceS.length; j++) {
          idDispositivo = deviceS[j].id;
          sens.push(idDispositivo)
        }

        //prendo wallbox nei garage dell'edificio
        var garage = await db_connect.collection("garage").find({ IdEdificio: ed[i] }).toArray(); //query su edificio 
        for (var z = 0; z < garage.length; z++) {
          var idGarage = garage[z].Id;
          var deviceW = await db_connect.collection("wallbox").find({ idGarage }).toArray(); //query su edificio
          if (deviceW.length > 0) {
            var idWall = deviceW[0].id;
            wall.push(idWall)
          }
        }

        //prendo impianto solare e eolico e query per produzione istantaneo
        var deviceSol = await db_connect.collection("impiantoSolare").find({ idEdificio:ed[i] }).toArray(); //query su edificio 
        if(deviceSol.length>0){
          idSol=deviceSol[0].id;
          var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}}, {idDispositivo:idSol},{idTipoHardware:2}] }).sort({orario:-1}).limit(1).toArray();
          if(produzione.length>0){
            prodSol=produzione[0].produzione
          }else
            prodSol="ancora nessuna produzione"
        }else
          prodSol="nessun dispositivo collegato"

        var deviceEol = await db_connect.collection("impiantoEolico").find({ idEdificio:ed[i] }).toArray(); //query su edificio 
        if(deviceEol.length>0){
          idEol=deviceEol[0].id;
          var produzione = await db_connect.collection("produzione").find({$and:[ {orario : {$lte: ora}}, {idDispositivo:idEol},{idTipoHardware:3}] }).sort({orario:-1}).limit(1).toArray();
          if(produzione.length>0){
            prodEol=produzione[0].produzione
          }else
            prodEol="ancora nessuna produzione"
        }else
          prodEol="nessun dispositivo collegato"
        
        if(elettr.length > 0 || sens.length > 0 || wall.length > 0){
          /*
          //controllo dimenzione array per non creare errore nel limit  
          if (elettr.length > 0)
            dimEl = elettr.length
          if (sens.length > 0)
            dimSe = sens.length
          if (wall.length > 0)
            dimWa = wall.length
          //query per il consumo 
          var consumoIst = await db_connect.collection("consumo").aggregate([
            {
              $facet: {
                sommaConsumoElettr: [
                  {
                    $match: {
                      orario: { $lte: ora },
                      idDispositivo: {
                        $in: elettr
                      },
                      idTipoHardware: 1
                    }
                  },
                  {
                    $sort: {
                      orario: -1
                    }
                  },
                  {
                    $limit: dimEl
                  },
                  {
                    $group: {
                      _id: null,
                      sommaConsumo: { $sum: "$consumo" },
                      numDispositiviCons: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                    }
                  }
                ],
                sommaConsumoSens: [
                  {
                    $match: {
                      orario: {$lte: ora},
                      idDispositivo:{
                        $in: sens
                      },
                      idTipoHardware:4
                    }
                  },
                  {
                    $sort: {
                      orario: -1
                    }
                  },
                  {
                    $limit: dimSe
                  },
                  {
                    $group: {
                      _id:null,
                      sommaConsumo: { $sum:"$consumo" },
                      numDispositiviCons: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                    }
                  }
                ],sommaConsumoWall: [
                  {
                    $match: {
                      orario: { $lte: ora },
                      idDispositivo: {
                        $in: wall
                      },
                      idTipoHardware: 5
                    }
                  },
                  {
                    $sort: {
                      orario: -1
                    }
                  },
                  {
                    $limit: dimWa
                  },
                  {
                    $group: {
                      _id: null,
                      sommaConsumo: { $sum: "$consumo" },
                      numDispositiviCons: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                    }
                  }
                ]
              }
            },
            {
              $project: {
                _id: 0,
                sommaConsumoElettr: { $arrayElemAt: ["$sommaConsumoElettr", 0] },
                sommaConsumoSens: { $arrayElemAt: [ "$sommaConsumoSens", 0 ] },
                sommaConsumoWall: { $arrayElemAt: ["$sommaConsumoWall", 0] }
              }
            },
            {
              $project: {
                sommaConsumoElettr: { $ifNull: ["$sommaConsumoElettr.sommaConsumo", 0] },
                sommaConsumoSens: { $ifNull: ["$sommaConsumoSens.sommaConsumo", 0] },
                sommaConsumoWall: { $ifNull: ["$sommaConsumoWall.sommaConsumo", 0] },
                numDispositiviElettrCons: { $ifNull: ["$sommaConsumoElettr.numDispositiviCons", null] }, // Aggiungi questi campi per recuperare il numero di dispositivi per ogni categoria
                numDispositiviSensCons: { $ifNull: ["$sommaConsumoSens.numDispositiviCons", null] },
                numDispositiviWallCons: { $ifNull: ["$sommaConsumoWall.numDispositiviCons", null] }
              }
            }
          ]).toArray();
          */
          var numConsEl = 0
          var numConsSe = 0
          var numConsWa = 0
          //consumi istantanei 
          for (var k = 0; k < elettr.length; k++) {
            var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: elettr[k] }, { idTipoHardware: 1 }] }).sort({ orario: -1 }).limit(1).toArray();
            if (consumoEl.length > 0) {
              totConsumo = totConsumo + consumoEl[0].consumo
              numConsEl = numConsEl + 1
            }
          }
          for (var k = 0; k < sens.length; k++) {
            var consumoSe = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: sens[k] }, { idTipoHardware: 4 }] }).sort({ orario: -1 }).limit(1).toArray();
            if (consumoSe.length > 0) {
              totConsumo = totConsumo + consumoSe[0].consumo
              numConsSe = numConsSe + 1
            }
          }

          for (var k = 0; k < wall.length; k++) {
            var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: ora2 } }, { idDispositivo: wall[k] }, { idTipoHardware: 5 }] }).sort({ orario: -1 }).limit(1).toArray();
            if (consumoWa.length > 0) {
              totConsumo = totConsumo + consumoWa[0].consumo
              numConsWa = numConsWa + 1
            }
          }

          if (numConsEl === 0 && numConsSe === 0 && numConsWa > 0) { //controllo per vedere sei i dispositivi hanno un consumo
            totConsumo = "ancora nessun consumo"
          }
        }else{
          totConsumo = "nessun dispositivo collegato"
        }

        arr.push(totConsumo,prodSol,prodEol)
        arrEdi.push(arr)
      }
      arrEdi.push(nomiEd)
      res.json(arrEdi);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/statConCC").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime()) 
  oraM.setMonth(oraM.getMonth() -1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
    var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio  
    var records = await db_connect.collection("edificio").find({ id:idEdificio }).toArray();  //query su persona
    var nomeEdificio = records[0].NomeEdificio
    var appartamenti = await db_connect.collection("appartamento").find({idEdificio}).toArray();
    var sens = new Array();
    var elettr = new Array();
    var wall = new Array()

    //prendo sensori dell'edificio
    var deviceS = await db_connect.collection("sensore").find({ idEdificio }).toArray(); //query su edificio 
    for (var j = 0; j < deviceS.length; j++) {
      idDispositivo = deviceS[j].id;
      sens.push(idDispositivo)
    }
    //prendo sensori e elettrodomestici degli appartamenti
    for(var i=0;i<appartamenti.length;i++){
      var idAppartamento = appartamenti[i].id
      var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
      for(var k=0;k<stanze.length;k++){
        var idStanza = stanze[k].id
        var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
        var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
        for(var j=0;j<deviceE.length;j++){
          var idDispositivo=deviceE[j].id
          elettr.push(idDispositivo)
        }
        for(var j=0;j<deviceS.length;j++){
          idDispositivo=deviceS[j].id;
          sens.push(idDispositivo)
        }
      }
    }
    //prendo wallbox nei garage dell'edificio
    var garage = await db_connect.collection("garage").find({IdEdificio:idEdificio}).toArray(); //query su edificio 
    for(var i=0;i<garage.length;i++){
      var idGarage = garage[i].Id;
      var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
      if(deviceW.length>0){
        var idWall=deviceW[0].id;
        wall.push(idWall)
      }
    }
    if (elettr.length > 0 || sens.length > 0 || wall.length > 0) {
/*
      //queri per le varie medie
      var mediaGiornaliera = await db_connect.collection("consumo").aggregate([
        {
          $facet: {
            mediaConsumoElettr: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraG } }
                  ],
                  idDispositivo: {
                    $in: elettr
                  },
                  idTipoHardware: 1
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" },
                  numDispositiviCons: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                }
              }
            ],
            mediaConsumoSens: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraG } }
                  ],
                  idDispositivo: {
                    $in: sens
                  },
                  idTipoHardware: 4
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" },
                  numDispositiviCons: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                }
              }
            ],
            mediaConsumoWall: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraG } }
                  ],
                  idDispositivo: {
                    $in: wall
                  },
                  idTipoHardware: 5
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" },
                  numDispositiviCons: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 0,
            mediaConsumoElettr: { $arrayElemAt: ["$mediaConsumoElettr", 0] },
            mediaConsumoSens: { $arrayElemAt: ["$mediaConsumoSens", 0] },
            mediaConsumoWall: { $arrayElemAt: ["$mediaConsumoWall", 0] }
          }
        },
        {
          $project: {
            mediaConsumoElettr: { $ifNull: ["$mediaConsumoElettr.mediaConsumo", 0] },
            mediaConsumoSens: { $ifNull: ["$mediaConsumoSens.mediaConsumo", 0] },
            mediaConsumoWall: { $ifNull: ["$mediaConsumoWall.mediaConsumo", 0] },
            numDispositiviElettrCons: { $ifNull: ["$mediaConsumoElettr.numDispositiviCons", null] }, // Aggiungi questi campi per recuperare il numero di dispositivi per ogni categoria
            numDispositiviSensCons: { $ifNull: ["$mediaConsumoSens.numDispositiviCons", null] },
            numDispositiviWallCons: { $ifNull: ["$mediaConsumoWall.numDispositiviCons", null] }
          }
        }
      ]).toArray();

      var mediaSettimanale = await db_connect.collection("consumo").aggregate([
        {
          $facet: {
            mediaConsumoElettr: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraS } }
                  ],
                  idDispositivo: {
                    $in: elettr
                  },
                  idTipoHardware: 1
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" }
                }
              }
            ],
            mediaConsumoSens: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraS } }
                  ],
                  idDispositivo: {
                    $in: sens
                  },
                  idTipoHardware: 4
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" }
                }
              }
            ],
            mediaConsumoWall: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraS } }
                  ],
                  idDispositivo: {
                    $in: wall
                  },
                  idTipoHardware: 5
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 0,
            mediaConsumoElettr: { $arrayElemAt: ["$mediaConsumoElettr", 0] },
            mediaConsumoSens: { $arrayElemAt: ["$mediaConsumoSens", 0] },
            mediaConsumoWall: { $arrayElemAt: ["$mediaConsumoWall", 0] }
          }
        },
        {
          $project: {
            mediaConsumoElettr: { $ifNull: ["$mediaConsumoElettr.mediaConsumo", 0] },
            mediaConsumoSens: { $ifNull: ["$mediaConsumoSens.mediaConsumo", 0] },
            mediaConsumoWall: { $ifNull: ["$mediaConsumoWall.mediaConsumo", 0] }
          }
        }
      ]).toArray();

      var mediaMensile = await db_connect.collection("consumo").aggregate([
        {
          $facet: {
            mediaConsumoElettr: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraM } }
                  ],
                  idDispositivo: {
                    $in: elettr
                  },
                  idTipoHardware: 1
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" }
                }
              }
            ],
            mediaConsumoSens: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraM } }
                  ],
                  idDispositivo: {
                    $in: sens
                  },
                  idTipoHardware: 4
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" }
                }
              }
            ],
            mediaConsumoWall: [
              {
                $match: {
                  $and: [
                    { orario: { $lte: ora } },
                    { orario: { $gte: oraM } }
                  ],
                  idDispositivo: {
                    $in: wall
                  },
                  idTipoHardware: 5
                }
              },
              {
                $group: {
                  _id: null,
                  mediaConsumo: { $avg: "$consumo" }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 0,
            mediaConsumoElettr: { $arrayElemAt: ["$mediaConsumoElettr", 0] },
            mediaConsumoSens: { $arrayElemAt: ["$mediaConsumoSens", 0] },
            mediaConsumoWall: { $arrayElemAt: ["$mediaConsumoWall", 0] }
          }
        },
        {
          $project: {
            mediaConsumoElettr: { $ifNull: ["$mediaConsumoElettr.mediaConsumo", 0] },
            mediaConsumoSens: { $ifNull: ["$mediaConsumoSens.mediaConsumo", 0] },
            mediaConsumoWall: { $ifNull: ["$mediaConsumoWall.mediaConsumo", 0] }
          }
        }
      ]).toArray();
*/
      var totConsumoGel = 0
      var numConsGel = 0
      var totConsumoGse = 0
      var numConsGse = 0
      var totConsumoGwa = 0
      var numConsGwa = 0

      var totConsumoSel = 0
      var numConsSel = 0
      var totConsumoSse = 0
      var numConsSse = 0
      var totConsumoSwa = 0
      var numConsSwa = 0

      var totConsumoMel = 0
      var numConsMel = 0
      var totConsumoMse = 0
      var numConsMse = 0
      var totConsumoMwa = 0
      var numConsMwa = 0
      //media giornaliera
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0; j < consumoEl.length; j++) {
          totConsumoGel = totConsumoGel + consumoEl[j].consumo
          numConsGel = numConsGel + 1
        }
      }
      for (var i = 0; i < sens.length; i++) {
        var consumoSe = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: sens[i] }, { idTipoHardware: 4 }] }).toArray();
        for (var j = 0; j < consumoSe.length; j++) {
          totConsumoGse = totConsumoGse + consumoSe[j].consumo
          numConsGse = numConsGse + 1
        }
      }
      for (var i=0;i<wall.length;i++) {
        var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: wall[i] }, { idTipoHardware: 5 }] }).toArray();
        for (var j = 0; j < consumoWa.length; j++) {
          totConsumoGwa = totConsumoGwa + consumoWa[j].consumo
          numConsGwa = numConsGwa + 1
        }
        /*
        console.log("stat")
        console.log(totConsumoGwa)
        console.log(numConsGwa)*/
      }
      /*
      console.log("stat")
      console.log(totConsumoGel)
      console.log(numConsGel)
      console.log(totConsumoGse)
      console.log(numConsGse)
      console.log(totConsumoGwa)
      console.log(numConsGwa)
      console.log(wall)*/
      //media settimanale
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0; j < consumoEl.length; j++) {
          totConsumoSel = totConsumoSel + consumoEl[j].consumo
          numConsSel = numConsSel + 1
        }
      }
      for (var i = 0; i < sens.length; i++) {
        var consumoSe = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: sens[i] }, { idTipoHardware: 4 }] }).toArray();
        for (var j = 0; j < consumoSe.length; j++) {
          totConsumoSse = totConsumoSse + consumoSe[j].consumo
          numConsSse = numConsSse + 1
        }
      }
      for (var i=0;i<wall.length;i++) {
        var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: wall[i] }, { idTipoHardware: 5 }] }).toArray();
        for (var j = 0; j < consumoWa.length; j++) {
          totConsumoSwa = totConsumoSwa + consumoWa[j].consumo
          numConsSwa = numConsSwa + 1
        }
      }

      //media mensile
      for (var i = 0; i < elettr.length; i++) {
        var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
        for (var j = 0; j < consumoEl.length; j++) {
          totConsumoMel = totConsumoMel + consumoEl[j].consumo
          numConsMel = numConsMel + 1
        }
      }
      for (var i = 0; i < sens.length; i++) {
        var consumoSe = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: sens[i] }, { idTipoHardware: 4 }] }).toArray();
        for (var j = 0; j < consumoSe.length; j++) {
          totConsumoMse = totConsumoMse + consumoSe[j].consumo
          numConsMse = numConsMse + 1
        }
      }
      for (var i=0;i<wall.length;i++) {
        var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: wall[i] }, { idTipoHardware: 5 }] }).toArray();
        for (var j = 0; j < consumoWa.length; j++) {
          totConsumoMwa = totConsumoMwa + consumoWa[j].consumo
          numConsMwa = numConsMwa + 1
        }
      }
      /*
      console.log(totConsumoGel)
      console.log(numConsGel)
      console.log(totConsumoGse)
      console.log(numConsGse)
      console.log(totConsumoGwa)
      console.log(numConsGwa)*/
      if (numConsGel > 0 || numConsGse > 0 || numConsGwa > 0) {
        mediaG = ((totConsumoGel/numConsGel) + (totConsumoGse/numConsGse) + (totConsumoGwa/numConsGwa)).toFixed(2);
        mediaS = ((totConsumoSel/numConsSel) + (totConsumoSse/numConsSse) + (totConsumoSwa/numConsSwa)).toFixed(2);
        mediaM = ((totConsumoMel/numConsMel) + (totConsumoMse/numConsMse) + (totConsumoMwa/numConsMwa)).toFixed(2);
      } else { //nessun dispositivo con consumo
        var mediaG = "ancora nessun consumo"
        var mediaS = "ancora nessun consumo"
        var mediaM = "ancora nessun consumo"
      }
    } else {
      var mediaG = "nessun dispositivo collegato"
      var mediaS = "nessun dispositivo collegato"
      var mediaM = "nessun dispositivo collegato"
    }
    var arr = new Array()
    arr.push(mediaG,mediaS,mediaM,nomeEdificio)
    res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartConCC").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
  oraMensile =oraM  //faccio cosi perche nel while si modificava la data senza motivo

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
    var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio  
    var records = await db_connect.collection("edificio").find({ id:idEdificio }).toArray();  //query su persona
    var nomeEdificio = records[0].NomeEdificio
    var appartamenti = await db_connect.collection("appartamento").find({idEdificio}).toArray();
    var sens = new Array();
    var elettr = new Array();
    var wall = new Array()

      //prendo sensori dell'edificio
    var deviceS = await db_connect.collection("sensore").find({ idEdificio }).toArray(); //query su edificio 
    for (var j = 0; j < deviceS.length; j++) {
      idDispositivo = deviceS[j].id;
      sens.push(idDispositivo)
    }
    //prendo sensori e elettrodomestici degli appartamenti
    for(var i=0;i<appartamenti.length;i++){
      var idAppartamento = appartamenti[i].id
      var stanze = await db_connect.collection("stanza").find({idAppartamento}).toArray(); //query su edificio     
      for(var k=0;k<stanze.length;k++){
        var idStanza = stanze[k].id
        var deviceE = await db_connect.collection("elettrodomestico").find({idStanza}).toArray(); //query su edificio 
        var deviceS = await db_connect.collection("sensore").find({idStanza}).toArray(); //query su edificio 
        for(var j=0;j<deviceE.length;j++){
          var idDispositivo=deviceE[j].id
          elettr.push(idDispositivo)
        }
        for(var j=0;j<deviceS.length;j++){
          idDispositivo=deviceS[j].id;
          sens.push(idDispositivo)
        }
      }
    }
    //prendo wallbox nei garage dell'edificio
    var garage = await db_connect.collection("garage").find({IdEdificio:idEdificio}).toArray(); //query su edificio 
    for(var i=0;i<garage.length;i++){
      var idGarage = garage[i].Id;
      var deviceW = await db_connect.collection("wallbox").find({idGarage}).toArray(); //query su edificio
      if(deviceW.length>0){
        var idWall=deviceW[0].id;
        wall.push(idWall)
      }
    }
  
      var arrConsumo = new Array()
      var arrDate = new Array()
      const arr = new Array()
              
      //queri per le varie medie
    if (elettr.length > 0 || sens.length > 0 || wall.length > 0) {
      //var prova=1
      while (oraMensile <= ora) {
        var totConsumoGel=0
        var numConsGel=0
        var totConsumoGse=0
        var numConsGse=0
        var totConsumoGwa=0
        var numConsGwa=0
        //media giornaliera
        for (var i = 0; i < elettr.length; i++) {
          var consumoEl = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: elettr[i] }, { idTipoHardware: 1 }] }).toArray();
          for (var j = 0; j < consumoEl.length; j++) {
            totConsumoGel = totConsumoGel + consumoEl[j].consumo
            numConsGel = numConsGel + 1
          }
        }
        for (var i = 0; i < sens.length; i++) {
          var consumoSe = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: sens[i] }, { idTipoHardware: 4 }] }).toArray();
          for (var j = 0; j < consumoSe.length; j++) {
            totConsumoGse = totConsumoGse + consumoSe[j].consumo
            numConsGse = numConsGse + 1
          }
        }
        for (var i = 0; i < wall.length; i++) {
          var consumoWa = await db_connect.collection("consumo").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: wall[i] }, { idTipoHardware: 5 }] }).toArray();
          for (var j = 0; j < consumoWa.length; j++) {
            totConsumoGwa = totConsumoGwa + consumoWa[j].consumo
            numConsGwa = numConsGwa + 1
          }
          /*
          if(prova===1){
            console.log("chart")
            console.log(totConsumoGwa)
            console.log(numConsGwa)
          } */
        }
        //prova=prova+1
        /*
        if(prova===1){
          console.log("chart")
          console.log(totConsumoGel)
          console.log(numConsGel)
          console.log(totConsumoGse)
          console.log(numConsGse)
          console.log(totConsumoGwa)
          console.log(numConsGwa)
          console.log(wall)
          prova=prova+1
        }*/
        if (numConsGel > 0 || numConsGse > 0 || numConsGwa > 0) {
          mediaG = ((totConsumoGel/numConsGel) + (totConsumoGse/numConsGse) + (totConsumoGwa/numConsGwa)).toFixed(2);
          if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
            arrConsumo.push(Number(mediaG))
            arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
          }
        }else{
          arr.push("ancora nessun consumo")
          break; //esci dal while
        }
        oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
        ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
      }
      if(arr.length===0) //perchè potrebbe esserci "ancora nessun consumo" per via del break
        arr.push(arrConsumo,arrDate)
    }else{
      arr.push("nessun dispositivo collegato")
    }
      res.json(arr);   
  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});

//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/statProCC").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  oraS = new Date(ora.getTime() - (7 * 24 * 60 * 60 * 1000)) //restituisco la data - 1 settimana
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime()) 
  oraM.setMonth(oraM.getMonth() -1)

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
    var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
    var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio  
    
      //prendo solare e eolico
      var impSol = await db_connect.collection("impiantoSolare").find({ idEdificio }).toArray(); //query su edificio 
      if(impSol.length>0){
        var deviceSol = impSol[0].id
      }else{
        var deviceSol = null
      }

      var impEol = await db_connect.collection("impiantoEolico").find({ idEdificio }).toArray(); //query su edificio 
      if(impEol.length){
        var deviceEol = impEol[0].id
      }else{
        var deviceEol = null
      }

      if(deviceEol!=null || deviceSol!=null){
/*        
        //queri per le varie medie
        var mediaGiornaliera = await db_connect.collection("produzione").aggregate([
          {
            $facet: {
              mediaProduzioneSol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraG } }
                    ],
                    idDispositivo: deviceSol,
                    idTipoHardware: 2
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" },
                    numDispositiviPro: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                  }
                }
              ],
              mediaProduzioneEol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraG } }
                    ],
                    idDispositivo: deviceEol,
                    idTipoHardware: 3
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" },
                    numDispositiviPro: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 0,
              mediaProduzioneSol: { $arrayElemAt: ["$mediaProduzioneSol", 0] },
              mediaProduzioneEol: { $arrayElemAt: ["$mediaProduzioneEol", 0] }
            }
          },
          {
            $project: {
              mediaProduzioneSol: { $ifNull: ["$mediaProduzioneSol.mediaProduzione", 0] },
              mediaProduzioneEol: { $ifNull: ["$mediaProduzioneEol.mediaProduzione", 0] },
              numDispositiviSolPro: { $ifNull: ["$mediaProduzioneSol.numDispositiviPro", null] }, // Aggiungi questi campi per recuperare il numero di dispositivi per ogni categoria
              numDispositiviEolPro: { $ifNull: ["$mediaProduzioneEol.numDispositiviPro", null] }
            }
          }
        ]).toArray();

        var mediaSettimanale = await db_connect.collection("produzione").aggregate([
          {
            $facet: {
              mediaProduzioneSol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraS } }
                    ],
                    idDispositivo: deviceSol,
                    idTipoHardware: 2
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" }
                  }
                }
              ],
              mediaProduzioneEol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraS } }
                    ],
                    idDispositivo: deviceEol,
                    idTipoHardware: 3
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" }
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 0,
              mediaProduzioneSol: { $arrayElemAt: ["$mediaProduzioneSol", 0] },
              mediaProduzioneEol: { $arrayElemAt: ["$mediaProduzioneEol", 0] }
            }
          },
          {
            $project: {
              mediaProduzioneSol: { $ifNull: ["$mediaProduzioneSol.mediaProduzione", 0] },
              mediaProduzioneEol: { $ifNull: ["$mediaProduzioneEol.mediaProduzione", 0] }
            }
          }
        ]).toArray();

        var mediaMensile = await db_connect.collection("produzione").aggregate([
          {
            $facet: {
              mediaProduzioneSol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraM } }
                    ],
                    idDispositivo: deviceSol,
                    idTipoHardware: 2
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" }
                  }
                }
              ],
              mediaProduzioneEol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraM } }
                    ],
                    idDispositivo: deviceEol,
                    idTipoHardware: 3
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" }
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 0,
              mediaProduzioneSol: { $arrayElemAt: ["$mediaProduzioneSol", 0] },
              mediaProduzioneEol: { $arrayElemAt: ["$mediaProduzioneEol", 0] }
            }
          },
          {
            $project: {
              mediaProduzioneSol: { $ifNull: ["$mediaProduzioneSol.mediaProduzione", 0] },
              mediaProduzioneEol: { $ifNull: ["$mediaProduzioneEol.mediaProduzione", 0] }
            }
          }
        ]).toArray();
*/
        var totProdGs = 0
        var numProdGs = 0
        var totProdGe = 0
        var numProdGe = 0

        var totProdSs = 0
        var numProdSs = 0
        var totProdSe = 0
        var numProdSe = 0

        var totProdMs = 0
        var numProdMs = 0
        var totProdMe = 0
        var numProdMe = 0

        //media giornaliera
        if (deviceEol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdGe = totProdGe + produzione[j].produzione
            numProdGe = numProdGe + 1
          }
        }
        if (deviceSol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdGs = totProdGs + produzione[j].produzione
            numProdGs = numProdGs + 1
          }
        }

        //media settimanale
        if (deviceEol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdSe = totProdSe + produzione[j].produzione
            numProdSe = numProdSe + 1
          }
        }
        if (deviceSol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraS } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdSs = totProdSs + produzione[j].produzione
            numProdSs = numProdSs + 1
          }
        }

        //media mensile
        if (deviceEol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdMe = totProdMe + produzione[j].produzione
            numProdMe = numProdMe + 1
          }
        }
        if (deviceSol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraM } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdMs = totProdMs + produzione[j].produzione
            numProdMs = numProdMs + 1
          }
        }

        if(deviceSol!=null){
          if (numProdGs > 0){
              mediaGsol = (totProdGs/numProdGs).toFixed(2);
              mediaSsol = (totProdSs/numProdSs).toFixed(2);
              mediaMsol = (totProdMs/numProdMs).toFixed(2);
          }else{
            mediaGsol = "ancora nessuna produzione"
            mediaSsol = "ancora nessuna produzione"
            mediaMsol = "ancora nessuna produzione"
          }
        }else{
          mediaGsol = "nessun dispositivo collegato"
          mediaSsol = "nessun dispositivo collegato"
          mediaMsol = "nessun dispositivo collegato"
        }
        
        if(deviceEol!=null){
          if (numProdGe > 0){
            mediaGeol = (totProdGe/numProdGe).toFixed(2);
            mediaSeol = (totProdSe/numProdSe).toFixed(2);
            mediaMeol = (totProdMe/numProdMe).toFixed(2);
          }else{
            mediaGeol = "ancora nessuna produzione"
            mediaSeol = "ancora nessuna produzione"
            mediaMeol = "ancora nessuna produzione"
          }
        }else{
          mediaGeol = "nessun dispositivo collegato"
          mediaSeol = "nessun dispositivo collegato"
          mediaMeol = "nessun dispositivo collegato"
        }
      }else{
        mediaGsol = "nessun dispositivo collegato"
        mediaSsol = "nessun dispositivo collegato"
        mediaMsol = "nessun dispositivo collegato"

        mediaGeol = "nessun dispositivo collegato"
        mediaSeol = "nessun dispositivo collegato"
        mediaMeol = "nessun dispositivo collegato"
      }
      var arr = new Array()
      arr.push(mediaGsol, mediaSsol, mediaMsol, mediaGeol, mediaSeol, mediaMeol)
      res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});


//Definisco una nuova route per la gestione della richiesta HTTP POST alla route /roomCF
recordRoutes.route("/chartProCC").post(async function(req, res) {

  // Otteniamo la connessione al database
  let db_connect = dbo.getDb();

  // Estraggo i dati della richiesta HTTP dal corpo della richiesta 
  email = req.body.email;
  ora = new Date(req.body.ora);
  oraG = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
  //restituisco la data - 1 mese
  oraM = new Date(ora.getTime() - (30 * 24 * 60 * 60 * 1000)); // restituisco la data - 30g
  oraMensile =oraM  //faccio cosi perche nel while si modificava la data senza motivo
  //console.log(oraM);

  // Prendi dal db le informazioni sulle stanze di una determinato appartamento di una determinata famiglia
  try {
      var arrProdEol = new Array()
      var arrProdSol = new Array()
      var arrDate = new Array()
      var arrDate2 = new Array() //array di comodo per gestire meglio la query
      const arr = new Array()
      
      var records = await db_connect.collection("persona").find({ email }).toArray();  //query su persona
      var idEdificio = records[0].idEdificio;  //mi prendo l'id dell'edificio  

      //prendo solare e eolico
      var impSol = await db_connect.collection("impiantoSolare").find({ idEdificio }).toArray(); //query su edificio 
      if(impSol.length>0){
        var deviceSol = impSol[0].id
      }else{
        var deviceSol = null
      }

      var impEol = await db_connect.collection("impiantoEolico").find({ idEdificio }).toArray(); //query su edificio 
      if(impEol.length){
        var deviceEol = impEol[0].id
      }else{
        var deviceEol = null
      }
  
    //queri per le varie medie
    if (deviceEol != null || deviceSol != null) {
      while (oraMensile <= ora) {
        /*
        var mediaGiornaliera = await db_connect.collection("produzione").aggregate([
          {
            $facet: {
              mediaProduzioneSol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraG } }
                    ],
                    idDispositivo: deviceSol,
                    idTipoHardware: 2
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" },
                    numDispositiviPro: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                  }
                }
              ],
              mediaProduzioneEol: [
                {
                  $match: {
                    $and: [
                      { orario: { $lte: ora } },
                      { orario: { $gte: oraG } }
                    ],
                    idDispositivo: deviceEol,
                    idTipoHardware: 3
                  }
                },
                {
                  $group: {
                    _id: null,
                    mediaProduzione: { $avg: "$produzione" },
                    numDispositiviPro: { $sum: 1 } // Aggiungi questo campo per contare il numero di dispositivi
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 0,
              mediaProduzioneSol: { $arrayElemAt: ["$mediaProduzioneSol", 0] },
              mediaProduzioneEol: { $arrayElemAt: ["$mediaProduzioneEol", 0] }
            }
          },
          {
            $project: {
              mediaProduzioneSol: { $ifNull: ["$mediaProduzioneSol.mediaProduzione", 0] },
              mediaProduzioneEol: { $ifNull: ["$mediaProduzioneEol.mediaProduzione", 0] },
              numDispositiviSolPro: { $ifNull: ["$mediaProduzioneSol.numDispositiviPro", null] }, // Aggiungi questi campi per recuperare il numero di dispositivi per ogni categoria
              numDispositiviEolPro: { $ifNull: ["$mediaProduzioneEol.numDispositiviPro", null] }
            }
          }
        ]).toArray();
*/
        var totProdGs = 0
        var numProdGs = 0
        var totProdGe = 0
        var numProdGe = 0
        //media giornaliera
        if (deviceEol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceEol }, { idTipoHardware: 3 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdGe = totProdGe + produzione[j].produzione
            numProdGe = numProdGe + 1
          }
        }
        if (deviceSol != null) {
          var produzione = await db_connect.collection("produzione").find({ $and: [{ orario: { $lte: ora } }, { orario: { $gt: oraG } }, { idDispositivo: deviceSol }, { idTipoHardware: 2 }] }).toArray();
          for (var j = 0; j < produzione.length; j++) {
            totProdGs = totProdGs + produzione[j].produzione
            numProdGs = numProdGs + 1
          }
        }

        if (deviceSol != null) {
          if (numProdGs > 0) {
              mediaGsol = (totProdGs/numProdGs).toFixed(2);
            if (!arrDate.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
              arrProdSol.push(Number(mediaGsol))
              arrDate.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
            }
          } else {
            mediaGsol = "ancora nessuna produzione"
          }
        } else {
          mediaGsol = "nessun dispositivo collegato"
        }

        if (deviceEol != null) {
          if (numProdGe > 0) {
            mediaGeol = (totProdGe/numProdGe).toFixed(2);
            if (!arrDate2.includes(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))) {
              arrProdEol.push(Number(mediaGeol))
              arrDate2.push(ora.toString().slice(0, -44).replace(/T(?=\d{2})/g, ' '))
            }
          } else {
            mediaGeol= "ancora nessuna produzione"
          }
        } else {
          mediaGeol = "nessun dispositivo collegato"
        }
        oraG = new Date(oraG.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
        ora = new Date(ora.getTime() - (24 * 60 * 60 * 1000)); //restituisco la data - 24 ore
      }
      if(arrProdSol.length===0)
        arrProdSol.push(mediaGsol)
      if(arrProdEol.length===0)
        arrProdEol.push(mediaGeol)
      arr.push(arrDate,arrProdSol,arrProdEol)
    } else {
      arr.push(["nessun dispositivo collegato"])
    }
      res.json(arr);   

  } catch (e) {
      console.log("An error occurred pulling the records. " + e);
      res.send('error query')
  }
});


module.exports = recordRoutes;
