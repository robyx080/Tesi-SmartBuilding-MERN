import { React, useEffect, useState } from 'react';
//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import Sidebar from '../Sidebar';
import Card from '../Card';
import { useAuth } from '../auth'; //autorizzazione al componente
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
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
 // eslint-disable-next-line
 import Chart from 'chart.js/auto';
import { Line,Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function ProduzioneCF() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    const [prodSol,setProdSol] = useState("")
    const [prodEol,setProdEol] = useState("")
    const [data,setData] = useState("")
    const [mediaGsol,setMediaGsol] = useState("")
    const [mediaSsol,setMediaSsol] = useState("")
    const [mediaMsol,setMediaMsol] = useState("")
    const [mediaGeol,setMediaGeol] = useState("")
    const [mediaSeol,setMediaSeol] = useState("")
    const [mediaMeol,setMediaMeol] = useState("")
    const [chartDataSol, setChartDataSol] = useState({});
    const [noChartSol,setNoChartSol] =useState("")
    const [chartDataEol, setChartDataEol] = useState({});
    const [noChartEol,setNoChartEol] =useState("")

    const [gioChartProd, setGioChartProd] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [chartVS, setChartVS] = useState({});
    const [selectedDateVS, setSelectedDateVS] = useState(null);

    useEffect(()=>{
        const date = new Date(); // crea una nuova data
        const timeZone = 'Europe/Rome'; // imposta la timezone italiana
        const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
        const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
        
        const ConPro = async () =>{
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            const response = await axios.post('http://localhost:5000/ConProCF', {email,ora});
            setProdSol(response.data[1])
            setProdEol(response.data[2])
            const response1 = await axios.post('http://localhost:5000/statProCF', {email,ora});
            setData(ora)
            setMediaGsol(response1.data[0])
            setMediaSsol(response1.data[1])
            setMediaMsol(response1.data[2])
            setMediaGeol(response1.data[3])
            setMediaSeol(response1.data[4])
            setMediaMeol(response1.data[5])             
        }

        const chart = async () => {
            const email=auth.email;
            let labels = [];
            let arrProdSol = [];
            let arrProdEol = [];
            const response = await axios.post('http://localhost:5000/chartProCF', {email,ora});
            if(response.data[0][0] === "nessun dispositivo collegato"){ 
                setNoChartSol(response.data[0][0])
            }else{
                if(typeof response.data[1][0] === "string"){
                    setNoChartSol(response.data[1][0])
                }else{
                    labels = response.data[0]
                    arrProdSol = response.data[1]
                    setChartDataSol({
                        labels: labels.reverse(),
                        datasets: [
                            {
                                label: 'Produzione solare',
                                data: arrProdSol.reverse(),
                                backgroundColor: 'rgb(245,105,20,0.3)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                                borderColor: 'rgb(245,105,20)',
                                fill: false,
                                tension: 0.1
                            }
                        ],
                        options: {
                            responsive: true
                        }
                    });
                }
            }

            if(response.data[0][0] === "nessun dispositivo collegato"){
                setNoChartEol(response.data[0][0])
            }else{
                if(typeof response.data[2][0] === "string"){ 
                    setNoChartEol(response.data[2][0])
                }else{
                    labels = response.data[0]
                    arrProdEol = response.data[2]
                    setChartDataEol({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Produzione eolico',
                                data: arrProdEol.reverse(),
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
                }
            }
            if(email==="reale@gmail.com"){
                var chartConsumoResponse = await axios.post('http://localhost:5000/chartConTotReale', {email,ora})
                var chartProduzioneResponse = await axios.post('http://localhost:5000/chartProTotReale', {email,ora})
                var conTotConsumi = chartConsumoResponse.data[0][0]
                var conTv = chartConsumoResponse.data[0][1]
                var conFr = chartConsumoResponse.data[0][2]
                var conPh = chartConsumoResponse.data[0][3]
                var conPc = chartConsumoResponse.data[0][4]
                var conTotLabels = chartConsumoResponse.data[1].filter((_, index) => index % 60 === 0)
                var produzione=[]
                for(var i=0;i<chartProduzioneResponse.data[0].length;i++){
                    var sol=chartProduzioneResponse.data[0][i]
                    var eol=chartProduzioneResponse.data[1][i]
                    produzione.push(sol+eol)
                }

                setGioChartProd({
                    type: 'bar',
                    labels: chartProduzioneResponse.data[2],
                    datasets: [{
                        label: 'Solare',
                        data: chartProduzioneResponse.data[0],
                        backgroundColor: 'rgba(0, 255, 0, 0.5)', stack: 'Stack 0',
                    },
                    {
                        label: 'Eolico',
                        data: chartProduzioneResponse.data[1],
                        backgroundColor: 'rgba(255, 0, 0, 0.5)', stack: 'Stack 0',
                    }],
                    options: {
                        responsive: true
                    }
                })

                setChartVS({
                    labels: conTotLabels,
                    datasets: [{
                        type: 'bar',
                        label: conTv[0],
                        data: conTv.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(0, 255, 0, 0.5)', stack: 'Stack 0',
                    },
                    {   
                        type: 'bar',
                        label: conFr[0],
                        data: conFr.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(255, 0, 0, 0.5)', stack: 'Stack 0',
                    },
                    {   
                        type: 'bar',
                        label: conPh[0],
                        data: conPh.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(255, 255, 0, 0.5)', stack: 'Stack 0',
                    },
                    {
                        type: 'bar',
                        label: conPc[0],
                        data: conPc.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(0, 192, 192, 0.5)', stack: 'Stack 0',
                    },
                    {   
                        type: 'bar',
                        label: conTotConsumi[0],
                        data: conTotConsumi.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(155, 155, 155, 0.5)', stack: 'Stack 1',
                    },
                    {
                        type: 'line',
                        label: 'Produzione Solare & Eolica',
                        data: produzione,
                        backgroundColor: 'rgb(255, 165, 0)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                        borderColor:'rgb(255, 165, 0)',
                        fill: false,
                        tension: 0.1,
                    }],
                    options: {
                        responsive: true
                    }
                })
            }
        }
        ConPro();
        chart()
    },[auth])

    const handleDateChange = (date) => {
        const change = async (date) => {
            const email=auth.email;
            var chartProduzioneResponse = await axios.post('http://localhost:5000/changeChartProTotReale', {email,date});            
            
            setSelectedDate(date)
            setGioChartProd({
                    type: 'bar',
                    labels: chartProduzioneResponse.data[2],
                    datasets: [{
                        label: 'Solare',
                        data: chartProduzioneResponse.data[0],
                        backgroundColor: 'rgba(0, 255, 0, 0.5)', stack: 'Stack 0',
                    },
                    {
                        label: 'Eolico',
                        data: chartProduzioneResponse.data[1],
                        backgroundColor: 'rgba(255, 0, 0, 0.5)', stack: 'Stack 0',
                    }],
                    options: {
                        responsive: true
                    }
                })
        }
        change(date)
      };

    const handleDateChangeVS = (date) => {
        const change = async (date) => {
            const email=auth.email;
            var chartConsumoResponse = await axios.post('http://localhost:5000/changeChartConTotReale', {email,date});            
            var chartProduzioneResponse = await axios.post('http://localhost:5000/changeChartProTotReale', {email,date});            

            var conTotConsumi = chartConsumoResponse.data[0][0]
            var conTv = chartConsumoResponse.data[0][1]
            var conFr = chartConsumoResponse.data[0][2]
            var conPh = chartConsumoResponse.data[0][3]
            var conPc = chartConsumoResponse.data[0][4]

            var conTotLabels = chartConsumoResponse.data[1].filter((_, index) => index % 60 === 0)
            //console.log(consumi)
            var produzione=[]
            //console.log(chartConsumoResponse[0])
            for(var i=0;i<chartProduzioneResponse.data[0].length;i++){
                var sol=chartProduzioneResponse.data[0][i]
                var eol=chartProduzioneResponse.data[1][i]
                produzione.push(sol+eol)
            }

            setSelectedDateVS(date)
            setChartVS({
                labels: conTotLabels,
                datasets: [{
                    type: 'bar',
                    label: conTv[0],
                    data: conTv.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(0, 255, 0, 0.5)', stack: 'Stack 0',
                },
                {   
                    type: 'bar',
                    label: conFr[0],
                    data: conFr.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(255, 0, 0, 0.5)', stack: 'Stack 0',
                },
                {   
                    type: 'bar',
                    label: conPh[0],
                    data: conPh.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(255, 255, 0, 0.5)', stack: 'Stack 0',
                },
                {
                    type: 'bar',
                    label: conPc[0],
                    data: conPc.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(0, 192, 192, 0.5)', stack: 'Stack 0',
                },
                {   
                    type: 'bar',
                    label: conTotConsumi[0],
                    data: conTotConsumi.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(155, 155, 155, 0.5)', stack: 'Stack 1',
                },
                {
                    type: 'line',
                    label: 'Produzione Solare & Eolica',
                    data: produzione,
                    backgroundColor: 'rgb(255, 165, 0)',   //colore dell'area sottostante alla curva  (0.3 è l'opacità)
                    fill: false,
                    tension: 0.1,
                }],
                options: {
                    responsive: true
                }
            })
        }
        change(date)
      };

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={2} link={5}/> {/*componente sidebar con relativi props*/}
            <div className="p-7 font-semibold h-full" style={{width:"100%"}}>
                <header className="text-2xl bg-grey text-center text-blue-600">
                    Statistiche Produzione Solare e Eolico
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8" style={{paddingTop:"30px"}}>
                    {/*solare*/}
                    <Card src={2} title={"Produzione Attuale"} text={typeof prodSol === "number" ? prodSol + "w" : prodSol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={2} title={"Produzione Medio Giornaliero"} text={typeof mediaGsol === "number" ? mediaGsol + "w" : mediaGsol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={2} title={"Produzione Medio Settimanale"} text={typeof mediaSsol === "number" ? mediaSsol + "w" : mediaSsol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={2} title={"Produzione Medio Mensile"} text={typeof mediaMsol === "number" ? mediaMsol + "w" : mediaMsol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    {/*eolico*/}
                    <Card src={3} title={"Produzione Attuale"} text={typeof prodEol === "number" ? prodEol + "w" : prodEol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={3} title={"Produzione Medio Giornaliero"} text={typeof mediaGeol === "number" ? mediaGeol + "w" : mediaGeol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={3} title={"Produzione Medio Settimanale"} text={typeof mediaSeol === "number" ? mediaSeol + "w" : mediaSeol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={3} title={"Produzione Medio Mensile"} text={typeof mediaMeol === "number" ? mediaMeol + "w" : mediaMeol} data={data.slice(0,-6).replace('T', ' ')}></Card>
                
                </div>
                <div className='text-center'>
                    <header className="text-2xl bg-grey text-center text-blue-600" style={{marginTop:"30px",marginBottom:"30px"}}>
                        Andamento Produzione Solare medio Mensile
                    </header>
                    {noChartSol ? (
                        <div className="alert alert-danger text-center" role="alert" style={{ marginTop: "30px" }} >
                            <h6 className="alert-heading">{noChartSol}</h6>
                        </div>
                    ) : (
                        <>
                            {Object.keys(chartDataSol).length === 0 ? (
                                <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />
                            ) : (
                                <div>
                                    <Line data={chartDataSol} height={536} width={1072} />
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className='text-center'>
                    <header className="text-2xl bg-grey text-center text-blue-600" style={{marginTop:"30px",marginBottom:"30px"}}>
                        Andamento Produzione Eolico medio Mensile
                    </header>
                    {noChartEol ? (
                        <div className="alert alert-danger text-center" role="alert" style={{ marginTop: "30px" }} >
                            <h6 className="alert-heading">{noChartSol}</h6>
                        </div>
                    ) : (
                        <>
                            {Object.keys(chartDataEol).length === 0 ? (
                                <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />
                            ) : (
                                <div>
                                    <Line data={chartDataEol} height={536} width={1072} />
                                </div>
                            )}
                        </>
                    )}
                </div>
                {Object.keys(gioChartProd).length === 0 ? (
                    <></>
                ) : (
                    <div>
                        <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{ marginTop: "30px", marginBottom: "30px" }}>
                            Andamento Produzione Giornaliera
                        </header>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Seleziona una data"
                            maxDate={new Date()} // Imposta la data corrente come massima data selezionabile
                            showDisabledMonthNavigation
                        />
                        <Bar data={gioChartProd} height={536} width={1072} />
                    </div>
                )}
                {Object.keys(chartVS).length === 0 ? (
                    <></>
                ) : (
                    <div>
                        <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{ marginTop: "30px", marginBottom: "30px" }}>
                            Consumo & Produzione
                        </header>
                        <DatePicker
                            selected={selectedDateVS}
                            onChange={handleDateChangeVS}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Seleziona una data"
                            maxDate={new Date()} // Imposta la data corrente come massima data selezionabile
                            showDisabledMonthNavigation
                        />
                        <Line data={chartVS} height={536} width={1072} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProduzioneCF;