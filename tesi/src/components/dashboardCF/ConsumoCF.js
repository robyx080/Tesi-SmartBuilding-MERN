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

function ConsumoCF() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    const [consumo,setConsumo] = useState("")
    const [data,setData] = useState("")
    const [mediaG,setMediaG] = useState("")
    const [mediaS,setMediaS] = useState("")
    const [mediaM,setMediaM] = useState("")
    const [chartData, setChartData] = useState({});
    const [noChart,setNoChart] =useState("")

    const [gioChartConsumoEl, setGioChartConsumoEl] = useState({});
    const [selectedDateConsumoEl, setSelectedDateConsumoEl] = useState(null);
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
            var response
            var response1
            if(email==="reale@gmail.com"){
                response = await axios.post('http://localhost:5000/ConProCFreale', {email,ora});
            }else{
                response = await axios.post('http://localhost:5000/ConProCF', {email,ora});
            }
            setConsumo(response.data[0])
            setData(ora)
            if(email==="reale@gmail.com"){
                response1 = await axios.post('http://localhost:5000/statConCFreale', {email,ora});
            }else{
                response1 = await axios.post('http://localhost:5000/statConCF', {email,ora});
            }
            setMediaG(response1.data[0])
            setMediaS(response1.data[1])
            setMediaM(response1.data[2])        
        }

        const chart = async () => {
            const email=auth.email;
            var response
            var chartConsumoResponse
            var chartProduzioneResponse
            let labels = [];
            let consumi = [];
            let conTotLabels = [];
            if(email==="reale@gmail.com"){
                response = await axios.post('http://localhost:5000/chartConCFreale', {email,ora});
                chartConsumoResponse = await axios.post('http://localhost:5000/chartConTotReale', {email,ora})
                chartProduzioneResponse = await axios.post('http://localhost:5000/chartProTotReale', {email,ora})
            }else{
                response = await axios.post('http://localhost:5000/chartConCF', {email,ora});
            }
            if(typeof response.data[0] === "string"){
                setNoChart(response.data[0])
            }else{
                labels = response.data[1].reverse()
                consumi = response.data[0].reverse()
                var conTotConsumi = chartConsumoResponse.data[0][0]
                var conTv = chartConsumoResponse.data[0][1]
                var conFr = chartConsumoResponse.data[0][2]
                var conPh = chartConsumoResponse.data[0][3]
                var conPc = chartConsumoResponse.data[0][4]
                conTotLabels = chartConsumoResponse.data[1].filter((_, index) => index % 60 === 0)
                //console.log(consumi)

                //var labelsProd = chartProduzioneResponse.data[2].filter((_, index) => index % 60 === 0)
                var produzione=[]
                //console.log(chartConsumoResponse[0])
                for(var i=0;i<chartProduzioneResponse.data[0].length;i++){
                    var sol=chartProduzioneResponse.data[0][i]
                    var eol=chartProduzioneResponse.data[1][i]
                    produzione.push(sol+eol)
                }
                //console.log(produzione)

                setGioChartConsumoEl({
                    type: 'bar',
                    labels: conTotLabels,
                    datasets: [{
                        label: conTv[0],
                        data: conTv.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(0, 255, 0, 0.5)', stack: 'Stack 0',
                    },
                    {
                        label: conFr[0],
                        data: conFr.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(255, 0, 0, 0.5)', stack: 'Stack 0',
                    },
                    {
                        label: conPh[0],
                        data: conPh.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(255, 255, 0, 0.5)', stack: 'Stack 0',
                    },
                    {
                        label: conPc[0],
                        data: conPc.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(0, 192, 192, 0.5)', stack: 'Stack 0',
                    },
                    {
                        label: conTotConsumi[0],
                        data: conTotConsumi.slice(1).filter((_, index) => index % 59 === 0),
                        backgroundColor: 'rgba(155, 155, 155, 0.5)', stack: 'Stack 1',
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


    
    const handleDateChange = (date) => {
        const change = async (date) => {
            const email=auth.email;
            var chartConsumoResponse = await axios.post('http://localhost:5000/changeChartConTotReale', {email,date});            
            var conTotConsumi = chartConsumoResponse.data[0][0]
            var conTv = chartConsumoResponse.data[0][1]
            var conFr = chartConsumoResponse.data[0][2]
            var conPh = chartConsumoResponse.data[0][3]
            var conPc = chartConsumoResponse.data[0][4]

            var conTotLabels = chartConsumoResponse.data[1].filter((_, index) => index % 60 === 0)
            //console.log(consumi)
            setSelectedDateConsumoEl(date)
            setGioChartConsumoEl({
                type: 'bar',
                labels: conTotLabels,
                datasets: [{
                    label: conTv[0],
                    data: conTv.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(0, 255, 0, 0.5)', stack: 'Stack 0',
                },
                {
                    label: conFr[0],
                    data: conFr.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(255, 0, 0, 0.5)', stack: 'Stack 0',
                },
                {
                    label: conPh[0],
                    data: conPh.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(255, 255, 0, 0.5)', stack: 'Stack 0',
                },
                {
                    label: conPc[0],
                    data: conPc.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(0, 192, 192, 0.5)', stack: 'Stack 0',
                },
                {
                    label: conTotConsumi[0],
                    data: conTotConsumi.slice(1).filter((_, index) => index % 59 === 0),
                    backgroundColor: 'rgba(155, 155, 155, 0.5)', stack: 'Stack 1',
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
            <Sidebar sidebar={2} link={4}/> {/*componente sidebar con relativi props*/}
            <div className="p-7 font-semibold h-full" style={{width:"100%"}}>
                <header className="text-2xl bg-grey text-center text-blue-600">
                    Statistiche Consumo
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8" style={{paddingTop:"30px"}}>
                    <Card src={1} title={"Consumo Attuale"} text={typeof consumo === "number" ? consumo + "w" : consumo} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={1} title={"Consumo Medio Giornaliero"} text={typeof mediaG === "number" ? mediaG + "w" : mediaG} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={1} title={"Consumo Medio Settimanale"} text={typeof mediaS === "number" ? mediaS + "w" : mediaS} data={data.slice(0,-6).replace('T', ' ')}></Card>
                    <Card src={1} title={"Consumo Medio Mensile"} text={typeof mediaM === "number" ? mediaM + "w" : mediaM} data={data.slice(0,-6).replace('T', ' ')}></Card>
                </div>
                <div>
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
                                        <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{marginTop:"30px",marginBottom:"30px"}}>
                                             Andamento Consumo medio Mensile
                                        </header>
                                        <Line data={chartData} height={536} width={1072} /*options={{responsive: true,maintainAspectRatio: false}}*/ />
                                    </div>
                                )}
                                {Object.keys(gioChartConsumoEl).length === 0 ? (
                                    <></>
                                ) : (
                                    <div>
                                        <header className="text-2xl bg-grey text-center text-blue-600 text-center" style={{ marginTop: "30px", marginBottom: "30px" }}>
                                            Andamento Consumo Giornaliero
                                        </header>
                                        <DatePicker
                                            selected={selectedDateConsumoEl}
                                            onChange={handleDateChange}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Seleziona una data"
                                            maxDate={new Date()} // Imposta la data corrente come massima data selezionabile
                                            showDisabledMonthNavigation
                                        />
                                        <Bar data={gioChartConsumoEl} height={536} width={1072} />
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
                            </>
                    )}
                </div>
                          
            </div>
        </div>
    )
}

export default ConsumoCF;