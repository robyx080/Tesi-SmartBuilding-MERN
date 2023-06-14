import { React, useEffect } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';


function Building() {

    const auth = useAuth(); //oggetto autorizzazione

    //Definisco un effetto per la gestione del componente ProfiloSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente cc
        const edifici = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/Edifici', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data){
                for(var i=0;i<response.data.length;i++){
                    createTable("tableEdifici",response.data[i]);
                }
            }
          }
        edifici(); //richiamo la funzione profilo
        //SERVE PER ANNULLARE UN WARNING
        // eslint-disable-next-line 
    },[auth])
    
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
                // se la chiave è "data", creo una nuova cella con la data 
                var value = json[key]             
                if(key==="id")
                    var idEd = value;
                // se la chiave è "nome" o "azienda", creo una nuova cella con il valore
                var td = document.createElement('td');  //creo la cella
                var cellText = document.createTextNode(value);  //creo una varibile che mi consente di inserire il testo nella cella
                td.appendChild(cellText);   //inserisco il testo nella cella
                td.className = "px-6 py-4 ";  //do una stile alla cella
                tr.appendChild(td);  //inserisco la cella nella riga
            }                
        }
        var a = document.createElement('a');
        cellText = document.createTextNode("remove");
        var img = document.createElement('img');
        img.src =require("../../assets/cestino.png");
        img.style="height: 24px; width: 24px";
        a.appendChild(img);
        a.href="#";
        a.onclick=(e) => {
            e.preventDefault();
            eliminaEd(idEd,a.closest('tr'))
          };
        td = document.createElement('td');  //creo la cella
        td.className = "px-6 py-4 ";  //do una stile alla cella
        td.appendChild(a);
        tr.appendChild(td);  //inserisco la cella nella riga
        tr.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700";  //do uno stile alla riga
        tbody.appendChild(tr);  // aggiungi la riga al corpo della tabella
    }
        
            
    const eliminaEd = async (idEd,row) => {
        try {
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.delete('http://localhost:5000/deleteEdi', {data:{id:idEd}});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            switch (response.data) {
                case "eliminated completed":
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
    
    

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={0} link={6}/>  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full overflow-x-auto">
                <header className="bg-grey text-center text-blue-600">
                    Edifici
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="tableEdifici">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome Edificio
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Indirizzo
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Numero Civico
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome Città
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Numero Piani
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Altezza
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
            </div>
        </div>
    )
}

export default Building;