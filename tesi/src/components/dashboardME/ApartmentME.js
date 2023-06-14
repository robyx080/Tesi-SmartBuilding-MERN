import { React, useEffect, useState} from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import Card from '../Card';
import { utcToZonedTime } from 'date-fns-tz'
import { formatISO } from 'date-fns';

function ApartmentME() {

    const auth = useAuth(); //oggetto autorizzazione
    
    const [loading, setLoading] = useState(false);
    const [arr, setArr] = useState([]);
    const [loadingG, setLoadingG] = useState(false);
    const [arrG, setArrG] = useState([]);
    const [data, setData] = useState("")

    //Definisco un effetto per la gestione del componente ProfiloSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente cc
        const apartment = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/AppartamentiCF', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data){
                createTable("tableAppartamenti",response.data[0]); 
            }
          }
        
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente cc
        const stanze = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/roomCF', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data){
                    for(var i=0;i<response.data.length;i++)
                        createTable("tableStanze",response.data[i]);
                }
          }
        
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente cc
        const garage = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/garageCF', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data){
                    createTable("tableGarage",response.data[0]);
                }
          }
    
        apartment(); //richiamo la funzione profilo
        stanze(); //richiamo la funzione stanze
        garage(); //richiamo la funzione garage
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
                var value = json[key]
                if (key === "id" || key === "Id")
                    var id = value;             
                var td = document.createElement('td');  //creo la cella
                var cellText = document.createTextNode(value);  //creo una varibile che mi consente di inserire il testo nella cella
                td.appendChild(cellText);   //inserisco il testo nella cella
                td.className = "px-6 py-4 ";  //do una stile alla cella
                tr.appendChild(td);  //inserisco la cella nella riga
            }                
        }
        if(idTable==="tableStanze" || idTable==="tableGarage"){
            var a2 = document.createElement('a');
            var img2 = document.createElement('img');
            img2.src = require("../../assets/show.png");
            img2.style = "height: 24px; width: 24px";
            a2.appendChild(img2);
            a2.href = "#";
            a2.style = "display: inline-block;";
            a2.onclick = (e) => {
                e.preventDefault();
                if(idTable==="tableStanze")
                    showConsumoStanza(id)
                else
                    showConsumoGarage(id)
            };
            td = document.createElement('td');  //creo la cella
            td.className = "px-6 py-4 ";  //do una stile alla cella
            td.appendChild(a2);
            tr.appendChild(td);  //inserisco la cella nella riga
        }
        tr.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700";  //do uno stile alla riga
        tbody.appendChild(tr);  // aggiungi la riga al corpo della tabella
    }
        
    const showConsumoStanza = async (idStanza) => {
        const date = new Date(); // crea una nuova data
        const timeZone = 'Europe/Rome'; // imposta la timezone italiana
        const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
        const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
        setData(ora)
        try {
            setLoading(true)
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/showConsumoStanza', {idStanza,ora});
            setLoading(false)
            setArr(response.data)
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
        } catch (err) {
            console.log(err)
        }
    }       
        
    const showConsumoGarage = async (idGarage) => {
        const date = new Date(); // crea una nuova data
        const timeZone = 'Europe/Rome'; // imposta la timezone italiana
        const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
        const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
        setData(ora)
        try {
            setLoadingG(true)
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/showConsumoGarage', {idGarage,ora});
            setLoadingG(false)
            setArrG(response.data)
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
        } catch (err) {
            console.log(err)
        }
    }            

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={3} link={3}/>  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full overflow-x-auto">
                <header className="bg-grey text-center text-blue-600">
                    Appartamento
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="tableAppartamenti">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Piano
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Grandezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Edificio
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
                <header className="bg-grey text-center text-blue-600" style={{marginTop:"35px"}}>
                    Stanze
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="tableStanze">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome Stanza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Larghezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Lunghezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Altezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Appartamento
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
                <div>
                    {loading && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arr.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={1} title={"Consumo Attuale"} text={arr[0]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={1} title={"Consumo Medio Giornaliero"} text={arr[1]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={1} title={"Consumo Medio Settimanale"} text={arr[2]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={1} title={"Consumo Medio Mensile"} text={arr[3]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
                </div>
                <header className="bg-grey text-center text-blue-600" style={{marginTop:"35px"}}>
                    Garage
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="tableGarage">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Numero Posti Auto
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Larghezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Lunghezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Altezza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Edificio
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Famiglia
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
                {loadingG && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arrG.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={6} title={"Consumo Attuale"} text={arrG[0]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={6} title={"Consumo Medio Giornaliero"} text={arrG[1]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={6} title={"Consumo Medio Settimanale"} text={arrG[2]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={6} title={"Consumo Medio Mensile"} text={arrG[3]+"w"} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
            </div>
        </div>
    )
}

export default ApartmentME;