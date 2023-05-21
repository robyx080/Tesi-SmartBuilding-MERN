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

function ConsumoCC() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    const [consumo,setConsumo] = useState("")
    const [data,setData] = useState("")
    const [mediaG,setMediaG] = useState("")
    const [mediaS,setMediaS] = useState("")
    const [mediaM,setMediaM] = useState("")
    const [chartData, setChartData] = useState({});
    const [noChart,setNoChart] =useState("")
    const [nome, setNome] = useState("")


    useEffect(()=>{
        const date = new Date(); // crea una nuova data
        const timeZone = 'Europe/Rome'; // imposta la timezone italiana
        const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
        const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
        
        const ConPro = async () =>{
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            const response = await axios.post('http://localhost:5000/ConProCC', {email,ora});
            setConsumo(response.data[0])
            setData(ora)
            const response1 = await axios.post('http://localhost:5000/statConCC', {email,ora});
            setMediaG(response1.data[0])
            setMediaS(response1.data[1])
            setMediaM(response1.data[2])  
            setNome(response1.data[3])      
        }

        const chart = async () => {
            const email=auth.email;
            let labels = [];
            let consumi = [];
            const response = await axios.post('http://localhost:5000/chartConCC', {email,ora});
            if(typeof response.data[0] === "string"){
                setNoChart(response.data[0])
            }else{
                labels = response.data[1].reverse()
                consumi = response.data[0].reverse()
                //console.log(consumi)
                setChartData({
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
            }
        }
        ConPro();
        chart()
    },[auth])

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={1} link={11}/> {/*componente sidebar con relativi props*/}
            <div className="p-7 font-semibold h-full" style={{width:"100%"}}>
                <header className="text-2xl bg-grey text-center text-blue-600">
                    Statistiche Consumo Edificio {nome}
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{paddingTop:"30px"}}>
                    <Card src={5} title={"Consumo Attuale"} text={typeof consumo === "number" ? consumo + "w" : consumo} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={5} title={"Consumo Medio Giornaliero"} text={typeof mediaG === "number" ? mediaG + "w" : mediaG} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={5} title={"Consumo Medio Settimanale"} text={typeof mediaS === "number" ? mediaS + "w" : mediaS} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={5} title={"Consumo Medio Mensile"} text={typeof mediaM === "number" ? mediaM + "w" : mediaM} data={data.slice(0,-6).replace('T', ' ')}></Card>
                </div>
                <div className='text-center'>
                    <header className="text-2xl bg-grey text-center text-blue-600" style={{marginTop:"30px",marginBottom:"30px"}}>
                        Andamento Consumo medio Mensile
                    </header>
                    {noChart ? (
                        <div className="alert alert-danger text-center" role="alert" style={{ marginTop:"30px"}} >
                            <h6 className="alert-heading">{noChart}</h6>
                        </div>
                    ) : (
                        <>
                            {Object.keys(chartData).length === 0 ? (
                                <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />
                            ) : (
                                <div>
                                    <Line data={chartData} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                                </div>
                            )}
                        </>
                    )}
                </div>          
            </div>
        </div>
    )
}

export default ConsumoCC;