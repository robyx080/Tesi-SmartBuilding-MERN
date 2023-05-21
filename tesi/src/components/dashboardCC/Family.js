import { React, useEffect } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';


function Family() {

    const auth = useAuth(); //oggetto autorizzazione
    
    //Definisco un effetto per la gestione del componente ProfiloSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente cc
        const famiglia = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/famigliaCC', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data==="nessuna famiglia"){
                document.getElementById("divTable").style.display="none";
                document.getElementById("errFamiglia").style.display="block";
            }else{
                for(var i=0;i<response.data.length;i++){
                    createTable("tableFamiglia",response.data[i]);
                }
            }
          }
        famiglia(); //richiamo la funzione profilo
    })
    
    //funzione che mi permette di creare la tabella per visualizzare i dati
    const createTable =(idTable,json)=>{
        var table = document.getElementById(idTable);  //prendo la tabella tramite id
        var tbody = table.getElementsByTagName('tbody')[0];  //prendo il corpo della tabella
        var tr = document.createElement('tr'); //creo una riga
        // itera attraverso le chiavi del JSON
        for(var key in json){
            // se la chiave è "_id" non fare nulla
            if (key==="_id") {
                
            }else{
                var value = json[key]             
                if(key==="id")
                    var idFa = value;
                if(key==="nomeFamiglia")
                    var nomeFa = value;
                // se la chiave è "nome" o "azienda", creo una nuova cella con il valore
                var td = document.createElement('td');  //creo la cella
                var cellText = document.createTextNode(value);  //creo una varibile che mi consente di inserire il testo nella cella
                td.appendChild(cellText);   //inserisco il testo nella cella
                td.className = "px-6 py-4 ";  //do una stile alla cella
                tr.appendChild(td);  //inserisco la cella nella riga
            }                
        }
        var a = document.createElement('a');
        var img = document.createElement('img');
        img.src = require("../../assets/cestino.png");
        img.style = "height: 24px; width: 24px";
        a.appendChild(img);
        a.href = "#";
        a.style = "display: inline-block; padding-right: 25px";
        a.onclick = (e) => {
            e.preventDefault();
            eliminaFa(idFa, a.closest('tr'))
        };

        var a2 = document.createElement('a');
        var img2 = document.createElement('img');
        img2.src = require("../../assets/show.png");
        img2.style = "height: 24px; width: 24px";
        a2.appendChild(img2);
        a2.href = "#";
        a2.style = "display: inline-block;";
        a2.onclick = (e) => {
            e.preventDefault();
            showFamiglia(idFa,nomeFa)
        };

        td = document.createElement('td');  //creo la cella
        td.className = "px-6 py-4 ";  //do una stile alla cella
        td.appendChild(a);
        td.appendChild(a2);
        tr.appendChild(td);  //inserisco la cella nella riga
        tr.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700";  //do uno stile alla riga
        tbody.appendChild(tr);  // aggiungi la riga al corpo della tabella
    }
        

    //funzione che mi permette di creare la tabella per visualizzare i dati
    const createTableShow =(idTable,json)=>{
        var table = document.getElementById(idTable);  //prendo la tabella tramite id
        var tbody = table.getElementsByTagName('tbody')[0];  //prendo il corpo della tabella
        var tr = document.createElement('tr'); //creo una riga
        // itera attraverso le chiavi del JSON
        for(var key in json){
            // se la chiave è "_id" non fare nulla
            if (key==="_id" || key==="idEdificio" || key==="emailAzienda") {
                
            }else{
                // se la chiave è "data", creo una nuova cella con la data 
                if(key==="data"){
                    var value = json[key].slice(0,10);  //mi prendo solo la data
                }else{
                    value = json[key]
                } 
                var td = document.createElement('td');  //creo la cella
                var cellText = document.createTextNode(value);  //creo una varibile che mi consente di inserire il testo nella cella
                td.appendChild(cellText);   //inserisco il testo nella cella
                td.className = "px-6 py-4 ";  //do una stile alla cella
                tr.appendChild(td);  //inserisco la cella nella riga
                tr.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700";  //do uno stile alla riga          
                }
            }
            tbody.appendChild(tr);  // aggiungi la riga al corpo della tabella
        }
        
            
    const eliminaFa = async (idFa,row) => {
        try {
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.delete('http://localhost:5000/deleteFa', {data:{id:idFa}});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            switch (response.data) {
                case "eliminated completed":
                    document.getElementById("headerShow").style.display="none";
                    document.getElementById("divTableMe").style.display="none";
                    const table = row.closest('table');
                    table.deleteRow(row.rowIndex);
                    break;
            
                case "error query":
                    console.log("error query")
                    break;

                default:
                    break;
            }
        } catch (err) {
            console.log(err)
        }
    }
    
    const showFamiglia = async (idFa,nomeFa) => {
        try {
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/showFamiglia', {idFa});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data==="error query"){
                document.getElementById("headerShow").style.display="none";
                document.getElementById("divTableMe").style.display="none";
                document.getElementById("errMembri").style.display="block";
                setTimeout(()=>{
                    document.getElementById("errMembri").style.display="none";
                },5000)
            }else{
                var table = document.getElementById('tableMeFamiglia');
                var tbody = table.querySelector('tbody');
                while (tbody.firstChild) {
                  tbody.removeChild(tbody.firstChild);
                }
                for(var i=0;i<response.data.length;i++){
                    createTableShow("tableMeFamiglia",response.data[i]);
                }
                document.getElementById("errMembri").style.display="none";
                document.getElementById("headerShow").innerHTML= "Famiglia "+nomeFa;
                document.getElementById("headerShow").style.display="block";
                document.getElementById("divTableMe").style.display="block";
            }
        } catch (err) {
            console.log(err)
        }
    }

    //ui componente
    return(
        <div className='flex'>
                <Sidebar sidebar={1} link={3}/>  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full overflow-x-auto">
                <header className="bg-grey text-center text-blue-600">
                    Famiglie
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" id="divTable" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="tableFamiglia">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome Famiglie
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                </div>

                <header className="bg-grey text-center text-blue-600" id="headerShow" style={{display:'none',paddingTop:"20px"}}>
                    
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" id="divTableMe" style={{paddingTop:"30px",display:'none'}}>
                    <table className="w-full text-sm text-left" id="tableMeFamiglia">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Nome
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Cognome
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Codice Fiscale
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Data Nascita
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Luogo Nascita
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Numero Telefono
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Tipo
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Famiglia
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                </div>

                <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="errFamiglia" >
                    <h6 className="alert-heading">Nessuna famiglia nell'edificio.</h6>
                </div>
                <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="errMembri" >
                    <h6 className="alert-heading">Nessun membro nella Famiglia.</h6>
                </div>
            </div>
        </div>
    )
}

export default Family;