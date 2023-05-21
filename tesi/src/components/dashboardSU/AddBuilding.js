import { React,useState } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './SignupCC.css'

function AddBuilding() {
    
    const auth = useAuth(); //oggetto autorizzazione

    //vari stati che mi serviranno per gestire il form
    const [nomeEdificio, setNomeEdificio] = useState("");
    const [numeroPiani, setNumeroPiani] = useState("");
    const [indirizzo, setIndirizzo] = useState("");
    const [numeroCivico, setNumeroCivico] = useState("");
    const [altezza, setAltezza] = useState("");

    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const email=auth.email;
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addBuilding', {nomeEdificio,numeroPiani,indirizzo,numeroCivico,altezza,email});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formErrEdi").style.display="none";
                    document.getElementById("formSuc").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSuc").style.display="none";
                    },10000)
                    break;

                case "errore nella registrazione":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErrEdi").style.display="none";
                    document.getElementById("formErr").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErr").style.display="none";
                    },10000)
                    break;

                case "edificio già esistente":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formErrEdi").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrEdi").style.display="none";
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
            <Sidebar sidebar={0} link={4} />  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    Aggiungi Edificio
                </header>
                <main className='form-login text-center' style={{paddingTop:"30px"}}>
                    <form onSubmit={handleSubmit}>
                        <input className="form-control" name="nomeEdificio" onChange={(e) => setNomeEdificio(e.target.value)} value={nomeEdificio} type="text" placeholder="Nome Edificio" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                        <input className="form-control" name="numeroPiani" onChange={(e) => setNumeroPiani(e.target.value)} value={numeroPiani} type="text" placeholder="Numero piani" required pattern="[0-9]{1,3}" title="Inserire solo numeri" />
                        <input className="form-control" name="indirizzo" onChange={(e) => setIndirizzo(e.target.value)} value={indirizzo} type="text" placeholder="Indirizzo Edificio" required pattern="[A-Za-z ]{1,32}" title="Inserire solo lettere" />
                        <input className="form-control" name="numeroCivico" onChange={(e) => setNumeroCivico(e.target.value)} value={numeroCivico} type="text" placeholder="Numero Civico" minLength="1" maxLength="3" required pattern="[0-9]{1,3}" title="Inserire solo numeri (min 1 max 3)" />
                        <input className="form-control" name="altezza" onChange={(e) => setAltezza(e.target.value)} value={altezza} type="text" placeholder="Altezza Edificio" minLength="1" maxLength="4" required pattern="[0-9]{1,4}" title="Inserire solo numeri (min 6 max 9)" />
                        <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">Crea</button>
                    </form>
                    <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSuc" >
                        <h6 className="alert-heading">Edificio inserito</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErr" >
                        <h6 className="alert-heading">Errore nella creazione.</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrEdi" >
                        <h6 className="alert-heading">Edificio già esistente</h6>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AddBuilding;