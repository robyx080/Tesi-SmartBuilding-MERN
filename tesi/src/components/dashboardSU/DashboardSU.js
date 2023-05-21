import { React, useEffect, useState } from 'react';
//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Card from '../Card';
import { useAuth } from '../auth'; //autorizzazione al componente
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { utcToZonedTime } from 'date-fns-tz'
import { formatISO } from 'date-fns';

function DashboardSU() {

    const auth = useAuth(); //oggetto autorizzazione
                
    const [cards, setCards] = useState([])

    useEffect(() => {
        const ConPro = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email = auth.email;
            const date = new Date(); // crea una nuova data
            const timeZone = 'Europe/Rome'; // imposta la timezone italiana
            const zonedDate = utcToZonedTime(date, timeZone); // converte la data UTC nella timezone italiana
            const ora = formatISO(zonedDate, { format: "extended" }); // formatta la data in formato ISO
            const response = await axios.post('http://localhost:5000/ConProSU', { email, ora });
            const res=response.data
            if(res==="nessun edificio"){
                document.getElementById("cards").style.display="none";
                document.getElementById("noEd").style.display="block";
            }else{
                const nomiEd = res[res.length - 1]
                res.pop() // tolto i nomi degli edifici dalla risposta html
                const cards = res.map((subarray, i) => {
                    return subarray.map((item, index) => {
                        return (
                            <Card
                                src={index === 0 ? 5 : index === 1 ? 2 : 3} // determina la sorgente dell'immagine in base all'indice
                                title={index === 0 ? "Consumo Attuale Edificio " + nomiEd[i] : index === 1 ? "Produzione Attuale Solare" : "Produzione Attuale Eolico"}
                                text={typeof item === "number" ? item + "w" : item}
                                data={ora}
                            />
                        );
                    });
                });

                // unisci tutti gli array creati dalla mappa innestata in un unico array
                const flatCards = cards.flat();
                setCards(flatCards);
            }
        }
        ConPro();
    }, [auth])

    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={0} link={1}/> {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    HomePage Supervisore
                </header>
                <div className="alert alert-danger text-center" role="alert" style={{ display: "none",marginTop:"30px"}} id="noEdi" >
                    <h6 className="alert-heading">Nessun Edificio</h6>
                </div>
                {cards.length===0 ? (
                  <img src={require(`../../assets/loading.gif`)} alt="loading" style={{ width: "30%", height: "30", marginLeft: "35%", marginRight: "50%" }} />
                ):(
                    <div id="cards" className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8" style={{paddingTop:"30px",marginBottom:"10px"}}>
                        {cards}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardSU;