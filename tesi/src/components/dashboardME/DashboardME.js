import { React,useState,useEffect } from 'react';
//http client per effettuare le richieste al server
import axios from 'axios';
//componenti
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Card from '../Card';
import { useAuth } from '../auth'; //autorizzazione al componente
import { utcToZonedTime } from 'date-fns-tz'
import { formatISO } from 'date-fns';

function DashboardME() {

    const auth = useAuth(); //oggetto autorizzazione

    const [consumo, setConsumo] = useState("")
    const [solare, setSolare] = useState("")
    const [eolico, setEolico] = useState("")
    const [data, setData] = useState("")

    useEffect(()=>{
        const ConPro = async () =>{
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            const date = new Date(); // crea una nuova data
            const timeZone = 'Europe/Rome'; // imposta la timezone italiana
            const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
            const ora = formatISO(zonedDate,{format:"extended"}); // formatta la data in formato ISO
            const response = await axios.post('http://localhost:5000/ConProCF', {email,ora});
            setConsumo(response.data[0]+"w")
            setSolare(response.data[1]+"w")
            setEolico(response.data[2]+"w")
            setData(ora.slice(0,-6).replace('T', ' '))
        }
        ConPro();
    },[auth])

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={3} link={1}/> {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    HomePage Membro Famiglia
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

export default DashboardME;