import { React, useEffect } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';


function ProfiloCC() {

    const auth = useAuth(); //oggetto autorizzazione

    //Definisco un effetto per la gestione del componente ProfiloSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente e dell'azienda
        const profilo = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/profiloCC', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data){
                createTable("tableProfilo",response.data);
            }
          }

        profilo(); //richiamo la funzione profilo
    },[auth])
    
    //funzione che mi permette di creare la tabella per visualizzare i dati
    const createTable =(idTable,json)=>{
        var table = document.getElementById(idTable);  //prendo la tabella tramite id
        var tbody = table.getElementsByTagName('tbody')[0];  //prendo il corpo della tabella
        var tr = document.createElement('tr'); //creo una riga
        // itera attraverso le chiavi del JSON
        for(var key in json){
            // se la chiave è "_id" non fare nulla
            if (key==="_id" || key==="idFamiglia" || key==="emailAzienda") {
                
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
    
    

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={1} link={2}/>  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full overflow-x-auto">
                <header className="bg-grey text-center text-blue-600">
                    Profilo Capo Condomino
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="tableProfilo">
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
                                    Id Edificio
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ProfiloCC;