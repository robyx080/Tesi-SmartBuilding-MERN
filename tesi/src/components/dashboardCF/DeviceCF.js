import { React, useCallback, useEffect, useState } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import Card from '../Card';
import { utcToZonedTime } from 'date-fns-tz'
import { formatISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);



function DeviceCF() {
    const [loadingE, setLoadingE] = useState(false);
    const [loadingSe, setLoadingSe] = useState(false);
    const [loadingSo, setLoadingSo] = useState(false);
    const [loadingEo, setLoadingEo] = useState(false);
    const [loadingW, setLoadingW] = useState(false);
    const [arrE,setArrE] = useState([]);
    const [arrSe,setArrSe] = useState([]);
    const [arrSo,setArrSo] = useState([]);
    const [arrEo,setArrEo] = useState([]);
    const [arrW,setArrW] = useState([]);
    const [data,setData] = useState("")

    const [chartDataE, setChartDataE] = useState({});
    const [chartDataSe, setChartDataSe] = useState({});
    const [chartDataSo, setChartDataSo] = useState({});
    const [chartDataEo, setChartDataEo] = useState({});
    const [chartDataW, setChartDataW] = useState({});

    const [gioChartDataE, setGioChartDataE] = useState({});
    //const [gioChartDataSe, setGioChartDataSe] = useState({});
    const [gioChartDataSo, setGioChartDataSo] = useState({});
    const [gioChartDataEo, setGioChartDataEo] = useState({});
    //const [gioChartDataW, setGioChartDataW] = useState({});

    const [selectedDateEl, setSelectedDateEl] = useState(null);
    const [selectedDateSo, setSelectedDateSo] = useState(null);
    const [selectedDateEo, setSelectedDateEo] = useState(null);

    const [idDeviceGio, setIdDeviceGio] = useState(null);
    const [tipoHardwareGio, setTipoHardwareGio] = useState(null);

    const handleDateChange = (date) => {
        const change = async (date) => {
            var response = await axios.post('http://localhost:5000/changeChart', {idDeviceGio,tipoHardwareGio,date});            
            let gioLabels = [];
            let gioConsumi = [];
            gioLabels = response.data[1]
            gioConsumi = response.data[0]
            switch (tipoHardwareGio) {
                case 1:
                    setSelectedDateEl(date)
                    setGioChartDataE({
                        labels: gioLabels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: gioConsumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    })
                    break;
                case 4:
                    
                    break;
                case 2:
                    setSelectedDateSo(date)
                    setGioChartDataSo({
                        labels: gioLabels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: gioConsumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    })
                    break;
                case 3:
                    setSelectedDateEo(date)
                    setGioChartDataEo({
                        labels: gioLabels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: gioConsumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    })
                    break;
                case 5:
                    
                    break;
                default:
                    break;
            }

        }
        change(date)
      };


    const auth = useAuth(); //oggetto autorizzazione
    
    //funzione che mi permette di creare la tabella per visualizzare i dati
    const createTable = useCallback((idTable, json,) => {
        var table = document.getElementById(idTable);  //prendo la tabella tramite id
        var tbody = table.getElementsByTagName('tbody')[0];  //prendo il corpo della tabella
        var tr = document.createElement('tr'); //creo una riga
        // itera attraverso le chiavi del JSON
        for (var key in json) {
            // se la chiave è "_id" non fare nulla
            if (key === "_id") {

            } else {
                // se la chiave è "data", creo una nuova cella con la data 
                if (key === "tipoHardware") {
                    var tipoHardware = json[key];  //mi prendo solo tipo harwdare
                } else {
                    var value = json[key]
                    if (value === null || (isNaN(value) && !(typeof value === "string")))
                        value = ""
                    if (key === "id")
                        var idDevice = value;
                    var td = document.createElement('td');  //creo la cella
                    var cellText = document.createTextNode(value);  //creo una varibile che mi consente di inserire il testo nella cella
                    td.appendChild(cellText);   //inserisco il testo nella cella
                    td.className = "px-6 py-4 ";  //do una stile alla cella
                    tr.appendChild(td);  //inserisco la cella nella riga
                }
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
            eliminaDevice(idDevice, tipoHardware, a.closest('tr'))
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
            showConsumoDevice(idDevice, tipoHardware)
        };

        td = document.createElement('td');  //creo la cella
        td.className = "px-6 py-4 ";  //do una stile alla cella
        td.appendChild(a);
        td.appendChild(a2);
        tr.appendChild(td);  //inserisco la cella nella riga
        tr.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700";  //do uno stile alla riga
        tbody.appendChild(tr);  // aggiungi la riga al corpo della tabella

        //SERVE PER ANNULLARE UN WARNING
        // eslint-disable-next-line     
    },[]);
    
    //Definisco un effetto per la gestione del componente ProfiloSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere il profilo dell'utente e dell'azienda
        const device = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;

            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.post('http://localhost:5000/deviceCF', {email});
            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            if(response.data){
                // utilizzando il loop forEach per scorrere l'array di oggetti
                response.data.forEach(function (oggetto) {
                    // iteriamo tutte le chiavi all'interno di ogni oggetto
                    Object.keys(oggetto).forEach(function (chiave) {
                        //console.log(chiave + ":");
                        //console.log(oggetto[chiave]); // stampa il valore della chiave
                        if(oggetto[chiave].length>0 && oggetto[chiave]!=="nessun dispositivo"){
                            for(var i=0;i<oggetto[chiave].length;i++){
                                //console.log(oggetto[chiave].length);
                                createTable("table-"+chiave,oggetto[chiave][i])
                            }
                        }else{
                            document.getElementById("table-"+chiave).style.display="none";
                            document.getElementById("noDevice"+chiave).style.display="block";
                        }
                    });
                });
            } 
          }
        device(); //richiamo la funzione device

        // eslint-disable-next-line
    },[])
    
    const eliminaDevice = async (idDevice,tipoHardware, row) => {
        try {
            //richiesta http per prendere i dati del profilo e azienda
            const response = await axios.delete('http://localhost:5000/deleteDevice', { data: { id: idDevice,tipoHardware:tipoHardware } });
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

    const showConsumoDevice = async (idDevice,tipoHardware) => {
        const date = new Date(); // crea una nuova data
        const timeZone = 'Europe/Rome'; // imposta la timezone italiana
        const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
        const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
        var response
        var chartResponse
        var gioChartResponse
        let labels = [];
        let consumi = [];
        let gioLabels = [];
        let gioConsumi = [];
        setData(ora)
        try {
            switch (tipoHardware) {
                case 1:
                    setLoadingE(true)
                    break;
                case 4:
                    setLoadingSe(true)
                    break;
                case 2:
                    setLoadingSo(true)
                    break;
                case 3:
                    setLoadingEo(true)
                    break;
                case 5:
                    setLoadingW(true)
                    break;
                default:
                    break;
            }
            if(auth.email==="reale@gmail.com"){
                response = await axios.post('http://localhost:5000/showConsumoDeviceReali', {idDevice,tipoHardware,ora});
                chartResponse = await axios.post('http://localhost:5000/chartDeviceReale', {idDevice,tipoHardware,ora});
                gioChartResponse = await axios.post('http://localhost:5000/gioChartDeviceReale', {idDevice,tipoHardware,ora});
                gioLabels = gioChartResponse.data[1]
                gioConsumi = gioChartResponse.data[0]
            }else{
                response = await axios.post('http://localhost:5000/showConsumoDevice', {idDevice,tipoHardware,ora});
                chartResponse = await axios.post('http://localhost:5000/chartDevice', {idDevice,tipoHardware,ora});
            }

            labels = chartResponse.data[1].reverse()
            consumi = chartResponse.data[0].reverse()

            

            //per mettere meno valori
            //gioLabels = gioChartResponse.data[1].filter((_, index) => index % 5 === 0)
            //gioConsumi = gioChartResponse.data[0].filter((_, index) => index % 5 === 0)

            //console.log(consumi)
            switch (tipoHardware) {
                case 1:
                    setChartDataE({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: consumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    });
                    if(auth.email==="reale@gmail.com"){
                        setTipoHardwareGio(tipoHardware)
                        setIdDeviceGio(idDevice)
                        setGioChartDataE({
                            labels: gioLabels,
                            datasets: [
                                {
                                    label: 'Consumi',
                                    data: gioConsumi,
                                    backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                    borderColor: 'rgb(110, 251, 0)',
                                    fill: false,
                                    tension: 0.1
                                }
                            ],
                            options: {
                                responsive: true,
                            }
                        })
                    }
                    break;
                case 4:
                    setChartDataSe({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: consumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    });
                    break;
                case 2:
                    setChartDataSo({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: consumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    });
                    if(auth.email==="reale@gmail.com"){
                        setTipoHardwareGio(tipoHardware)
                        setIdDeviceGio(idDevice)
                        setGioChartDataSo({
                            labels: gioLabels,
                            datasets: [
                                {
                                    label: 'Produzione',
                                    data: gioConsumi,
                                    backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                    borderColor: 'rgb(110, 251, 0)',
                                    fill: false,
                                    tension: 0.1
                                }
                            ],
                            options: {
                                responsive: true,
                            }
                        })
                    }
                    break;
                case 3:
                    setChartDataEo({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: consumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    });
                    if(auth.email==="reale@gmail.com"){
                        setTipoHardwareGio(tipoHardware)
                        setIdDeviceGio(idDevice)
                        setGioChartDataEo({
                            labels: gioLabels,
                            datasets: [
                                {
                                    label: 'Produzione',
                                    data: gioConsumi,
                                    backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                    borderColor: 'rgb(110, 251, 0)',
                                    fill: false,
                                    tension: 0.1
                                }
                            ],
                            options: {
                                responsive: true,
                            }
                        })
                    }
                    break;
                case 5:
                    setChartDataW({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Consumi',
                                data: consumi,
                                backgroundColor: 'rgb(204, 255, 153, 0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(110, 251, 0)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    });
                    break;
                default:
                    break;
            }


            // Se la risposta del server contiene dati validi, creo le tabelle per visualizzarli.
            switch (tipoHardware) {
                case 1:
                    setLoadingE(false)
                    setArrE(response.data)
                    break;
                case 4:
                    setLoadingSe(false)
                    setArrSe(response.data)
                    break;
                case 2:
                    setLoadingSo(false)
                    setArrSo(response.data)
                    break;
                case 3:
                    setLoadingEo(false)
                    setArrEo(response.data)
                    break;
                case 5:
                    setLoadingW(false)
                    setArrW(response.data)
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
            <Sidebar sidebar={2} link={6}/>  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full overflow-x-auto">
                <header className="bg-grey text-center text-blue-600">
                    Dispositivi collegati
                </header>
                <header className="bg-grey text-center text-blue-600 " style={{paddingTop:"30px"}}>
                    Elettrodomestici
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="table-elettrodomestici">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Massina
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Minima
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Classe Energetica
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Marca
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Stanza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                    <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="noDeviceelettrodomestici" >
                        <h6 className="alert-heading">Nessun elettrodomestico.</h6>
                    </div>
                </div>
                <div>
                    {loadingE && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arrE.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={4} title={"Consumo Attuale"} text={typeof arrE[0] === "number" ? arrE[0] + "w" : arrE[0]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={4} title={"Consumo Medio Giornaliero"} text={typeof arrE[1] === "number" ? arrE[1] + "w" : arrE[1]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={4} title={"Consumo Medio Settimanale"} text={typeof arrE[2] === "number" ? arrE[2] + "w" : arrE[2]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={4} title={"Consumo Medio Mensile"} text={typeof arrE[3] === "number" ? arrE[3] + "w" : arrE[3]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
                    {Object.keys(gioChartDataE).length === 0 ? (
                        <></>
                    ) : (
                        <div>
                            <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Consumo Giornaliero
                            </header>
                                <DatePicker
                                    selected={selectedDateEl}
                                    onChange={handleDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Seleziona una data"
                                    maxDate={new Date()} // Imposta la data corrente come massima data selezionabile
                                    showDisabledMonthNavigation
                                />
                                <Line data={gioChartDataE} height={536} width={1072} options={{
                                    elements: {
                                        point: {
                                            radius: 0 // Imposta il raggio dei punti a 0 per rimuoverli
                                        }
                                    }
                                }} />
                        </div>
                    )}
                    {Object.keys(chartDataE).length === 0 ? (
                        <></>
                    ) : (
                        <div className='text-center'>
                            <header className="text-2xl bg-grey text-center text-blue-600" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Consumo medio Mensile
                            </header>
                            <Line data={chartDataE} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                        </div>
                    )}  
                </div>
                <header className="bg-grey text-center text-blue-600 " style={{paddingTop:"30px"}}>
                    Sensori
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="table-sensori">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Massina
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Minima
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Marca
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Stanza
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Edificio
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                    <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="noDevicesensori" >
                        <h6 className="alert-heading">Nessun sensore.</h6>
                    </div>
                </div>
                <div>
                    {loadingSe && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arrSe.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={4} title={"Consumo Attuale"} text={typeof arrSe[0] === "number" ? arrSe[0] + "w" : arrSe[0]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={4} title={"Consumo Medio Giornaliero"} text={typeof arrSe[1] === "number" ? arrSe[1] + "w" : arrSe[1]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={4} title={"Consumo Medio Settimanale"} text={typeof arrSe[2] === "number" ? arrSe[2] + "w" : arrSe[2]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={4} title={"Consumo Medio Mensile"} text={typeof arrSe[3] === "number" ? arrSe[3] + "w" : arrSe[3]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
                    {Object.keys(chartDataSe).length === 0 ? (
                        <></>
                    ) : (
                        <div className='text-center'>
                            <header className="text-2xl bg-grey text-center text-blue-600" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Consumo medio Mensile
                            </header>
                            <Line data={chartDataSe} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                        </div>
                    )}  
                </div>
                <header className="bg-grey text-center text-blue-600 " style={{paddingTop:"30px"}}>
                    Impianto Solare
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="table-impiantoSolare">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Numero Pannelli
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Massina
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Minima
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Appartamento
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Edificio
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                    <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="noDeviceimpiantoSolare" >
                        <h6 className="alert-heading">Nessun impiato solare.</h6>
                    </div>
                </div>
                <div>
                    {loadingSo && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arrSo.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={2} title={"Produzione Attuale"} text={typeof arrSo[0] === "number" ? arrSo[0] + "w" : arrSo[0]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={2} title={"Produzione Medio Giornaliero"} text={typeof arrSo[1] === "number" ? arrSo[1] + "w" : arrSo[1]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={2} title={"Produzione Medio Settimanale"} text={typeof arrSo[2] === "number" ? arrSo[2] + "w" : arrSo[2]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={2} title={"Produzione Medio Mensile"} text={typeof arrSo[3] === "number" ? arrSo[3] + "w" : arrSo[3]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
                    {Object.keys(gioChartDataSo).length === 0 ? (
                        <></>
                    ) : (
                        <div>
                            <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Produzione Giornaliera
                            </header>
                                <DatePicker
                                    selected={selectedDateSo}
                                    onChange={handleDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Seleziona una data"
                                    maxDate={new Date()} // Imposta la data corrente come massima data selezionabile
                                    showDisabledMonthNavigation
                                />
                                <Line data={gioChartDataSo} height={536} width={1072} options={{
                                    elements: {
                                        point: {
                                            radius: 0 // Imposta il raggio dei punti a 0 per rimuoverli
                                        }
                                    }
                                }} />
                        </div>
                    )}
                    {Object.keys(chartDataSo).length === 0 ? (
                        <></>
                    ) : (
                        <div className='text-center'>
                            <header className="text-2xl bg-grey text-center text-blue-600" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Produzione medio Mensile
                            </header>
                            <Line data={chartDataSo} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                        </div>
                    )}  
                </div>
                <header className="bg-grey text-center text-blue-600 " style={{paddingTop:"30px"}}>
                    Impianto Eolico
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="table-impiantoEolico">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Numero Pale
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Massina
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Minima
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Appartamento
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Edificio
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                    <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="noDeviceimpiantoEolico" >
                        <h6 className="alert-heading">Nessun impiato eolico.</h6>
                    </div>
                </div>
                <div>
                    {loadingEo && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arrEo.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={3} title={"Produzione Attuale"} text={typeof arrEo[0] === "number" ? arrEo[0] + "w" : arrEo[0]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={3} title={"Produzione Medio Giornaliero"} text={typeof arrEo[1] === "number" ? arrEo[1] + "w" : arrEo[1]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={3} title={"Produzione Medio Settimanale"} text={typeof arrEo[2] === "number" ? arrEo[2] + "w" : arrEo[2]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={3} title={"Produzione Medio Mensile"} text={typeof arrEo[3] === "number" ? arrEo[3] + "w" : arrEo[3]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
                    {Object.keys(gioChartDataEo).length === 0 ? (
                        <></>
                    ) : (
                        <div>
                            <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Produzione Giornaliera
                            </header>
                                <DatePicker
                                    selected={selectedDateEo}
                                    onChange={handleDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Seleziona una data"
                                    maxDate={new Date()} // Imposta la data corrente come massima data selezionabile
                                    showDisabledMonthNavigation
                                />
                                <Line data={gioChartDataEo} height={536} width={1072} options={{
                                    elements: {
                                        point: {
                                            radius: 0 // Imposta il raggio dei punti a 0 per rimuoverli
                                        }
                                    }
                                }} />
                        </div>
                    )}
                    {Object.keys(chartDataEo).length === 0 ? (
                        <></>
                    ) : (
                        <div className='text-center'>
                            <header className="text-2xl bg-grey text-center text-blue-600" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Produzione medio Mensile
                            </header>
                            <Line data={chartDataEo} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                        </div>
                    )}  
                </div>
                <header className="bg-grey text-center text-blue-600 " style={{paddingTop:"30px"}}>
                    WallBox
                </header>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg" style={{paddingTop:"30px"}}>
                    <table className="w-full text-sm text-left" id="table-wallBox">
                        <thead className="text-xs text-white uppercase bg-blue-600 ">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Nome
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Massina
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Potenza Minima
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Marca
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Id Garage
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-black'>
                        
                        </tbody>
                    </table>
                    <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="noDevicewallBox" >
                        <h6 className="alert-heading">Nessuna wallbox.</h6>
                    </div>
                </div>
                <div style={{marginBottom:"10px"}}>
                    {loadingW && <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />}
                    {arrW.length === 4 &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{ paddingTop: "30px" }}>
                            <Card src={6} title={"Consumo Attuale"} text={typeof arrW[0] === "number" ? arrW[0] + "w" : arrW[0]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={6} title={"Consumo Medio Giornaliero"} text={typeof arrW[1] === "number" ? arrW[1] + "w" : arrW[1]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={6} title={"Consumo Medio Settimanale"} text={typeof arrW[2] === "number" ? arrW[2] + "w" : arrW[2]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                            <Card src={6} title={"Consumo Medio Mensile"} text={typeof arrW[3] === "number" ? arrW[3] + "w" : arrW[3]} data={data.slice(0, -6).replace('T', ' ')}></Card>
                        </div>
                    }
                    {Object.keys(chartDataW).length === 0 ? (
                        <></>
                    ) : (
                        <div className='text-center'>
                            <header className="text-2xl bg-grey text-center text-blue-600" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                Andamento Consumo medio Mensile
                            </header>
                            <Line data={chartDataW} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                        </div>
                    )}  
                </div>
            </div>
        </div>
    )
}

export default DeviceCF;