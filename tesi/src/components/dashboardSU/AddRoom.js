import { React,useEffect,useState } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './SignupCC.css'

function AddRoom() {
    
    const auth = useAuth(); //oggetto autorizzazione

    //vari stati che mi serviranno per gestire il form
    const [nome, setNome] = useState("");
    const [larghezza, setLarghezza] = useState("");
    const [lunghezza,setLunghezza] = useState("");
    const [altezza,setAltezza] = useState("");
    const [selectAppartamento,setSelectAppartamento] = useState("");



    //Definisco un effetto per la gestione del componente SignupSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere gli edifici da inserire nella select del form
        const selectEdifici = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati degli edifici
            const response = await axios.post('http://localhost:5000/AppartamentiSU', {email});
            // Se la risposta del server contiene dati validi, creo le option della select.
            if(response.data){
                var selectEd=document.getElementById("selectAppartamento");
                for(var i=0;i<response.data.length;i++){ //per ogni json andiamo a prendere il valore e lo inseriamo nella option e successivamente inseriamo l'option nella select
                    var opt = document.createElement('option');  //creiamo una option
                    if(i===0)
                        setSelectAppartamento(response.data[i].id);
                    opt.value = response.data[i].id;  //valore option
                    opt.innerHTML ="Id app: "+ response.data[i].id+" -- Id ed: "+ response.data[i].idEdificio+" -- piano: "+response.data[i].piano;  //text option
                    selectEd.appendChild(opt);  //inseriamo nella select degli edifici la singola option
                }
            }
        }

        selectEdifici(); //richiamo la funzione selectEdifici
        
    },[auth])

    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addRoom', {nome,larghezza,lunghezza,altezza,selectAppartamento});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formSuc").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSuc").style.display="none";
                    },10000)
                    break;

                case "errore nella registrazione":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErr").style.display="none";
                    },10000)
                    break;
                    
                default:
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    };


    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={0} link={12} />  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    Aggiungi Stanza
                </header>
                <main className='form-login text-center' style={{paddingTop:"30px"}}>
                    <form onSubmit={handleSubmit}>
                        <input className="form-control" name="nome" onChange={(e) => setNome(e.target.value)} value={nome} type="text" placeholder="Nome stanza" required pattern="[A-Za-z\s]{1,32}" title="Inserire solo lettere" />
                        <input className="form-control" name="larghezza" onChange={(e) => setLarghezza(e.target.value)} value={larghezza} type="text" placeholder="Larghezza stanza" required pattern="[0-9]{1,4}" title="Inserire solo numeri " />
                        <input className="form-control" name="lunghezza" onChange={(e) => setLunghezza(e.target.value)} value={lunghezza} type="text" placeholder="Lunghezza stanza" required pattern="[0-9]{1,4}" title="Inserire solo numeri " />
                        <input className="form-control" name="altezza" onChange={(e) => setAltezza(e.target.value)} value={altezza} type="text" placeholder="Altezza stanza" required pattern="[0-9]{1,4}" title="Inserire solo numeri " />
                        <select className='form-control' id="selectAppartamento" name="selectAppartamento" onChange={(e) => setSelectAppartamento(e.target.value)} value={selectAppartamento}></select>                      
                        <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">Crea</button>
                    </form>
                    <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSuc" >
                        <h6 className="alert-heading">Stanza creata</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErr" >
                        <h6 className="alert-heading">Errore nella creazione.</h6>
                    </div>
                    
                </main>
            </div>
        </div>
    )
}

export default AddRoom;