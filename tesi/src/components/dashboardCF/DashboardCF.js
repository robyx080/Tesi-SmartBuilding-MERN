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

function DashboardCF() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    const [consumo,setConsumo] = useState("")
    const [solare,setSolare] = useState("")
    const [eolico,setEolico] = useState("")
    const [data,setData] = useState("")

    useEffect(()=>{
        const ConPro = async () =>{
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            const date = new Date(); // crea una nuova data
            const timeZone = 'Europe/Rome'; // imposta la timezone italiana
            const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
            const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
            var response
            if(email==="reale@gmail.com"){
                response = await axios.post('http://localhost:5000/ConProCFreale', {email,ora});
            }else{
                response = await axios.post('http://localhost:5000/ConProCF', {email,ora});
            }

            if(response.data==="error query"){
                setConsumo("errore riprova")
                setSolare("errore riprova")
                setEolico("errore riprova")
            }else{
                setConsumo(typeof response.data[0] === "number" ? response.data[0] + "w" : response.data[0]);
                setSolare(typeof response.data[1] === "number" ? response.data[1] + "w" : response.data[1])
                setEolico(typeof response.data[2] === "number" ? response.data[2] + "w" : response.data[2])
            }
            setData(ora.slice(0,-6).replace('T', ' '))
        }
        ConPro();
    },[auth])
    
    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={2} link={1}/> {/*componente sidebar con relativi props*/}
            <div className="p-7 font-semibold h-full" style={{width:"100%"}}>
                <header className="text-2xl bg-grey text-center text-blue-600">
                    HomePage Capo Famiglia
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8" style={{paddingTop:"30px"}}>
                    <Card src={1} title={"Consumo Attuale"} text={consumo} data={data}></Card>
                    <Card src={2} title={"Produzione Attuale Solare"} text={solare} data={data}></Card>
                    <Card src={3} title={"Produzione Attuale Eolico"} text={eolico} data={data}></Card>
                </div> 
            </div>
        </div>
    )
}

export default DashboardCF;