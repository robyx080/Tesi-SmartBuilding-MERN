import { React,useEffect,useState,useCallback } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../dashboardSU/SignupCC.css'

function AddGarage() {
    
    const auth = useAuth(); //oggetto autorizzazione

    //vari stati che mi serviranno per gestire il form
    const [selectFamiglia,setSelectFamiglia] = useState("");
    const [selectGarage,setSelectGarage] = useState("");


    // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere gli edifici da inserire nella select del form
    const SelectGarage = useCallback( async () => {
        //Prendo l'email dell'utente loggato dallo stato di autenticazione
        const email=auth.email;
        //richiesta http per prendere i dati degli edifici
        const response = await axios.post('http://localhost:5000/selectGarageCC', {email});
        // Se la risposta del server contiene dati validi, creo le option della select.
        if(response.data){
            var selectGa=document.getElementById("selectGarage");
            if(response.data.length===0){
                document.getElementById("formAgg").style.display="none";
                document.getElementById("formErrGa").style.display="block";
            }else{
                for (var i = 0; i < response.data.length; i++) { //per ogni json andiamo a prendere il valore e lo inseriamo nella option e successivamente inseriamo l'option nella select
                    var opt = document.createElement('option');  //creiamo una option
                    if (i === 0)
                        setSelectGarage(response.data[i].Id);
                    opt.value = response.data[i].Id;  //valore option
                    opt.innerHTML = "Id: " + response.data[i].Id + " -- nAuto: " + response.data[i].NumPostAuto + " -- LxPxH: " + response.data[i].Larghezza + "x" + response.data[i].Lunghezza + "x" + response.data[i].Altezza;  //text option
                    selectGa.appendChild(opt);  //inseriamo nella select degli edifici la singola option
                }
            }
        }
    },[auth])

    const SelectFamiglia = useCallback( async () => {
        const email=auth.email;
        //richiesta http per prendere i dati degli edifici
        const response = await axios.post('http://localhost:5000/famigliaCC',{email});
        // Se la risposta del server contiene dati validi, creo le option della select.
        if(response.data){
            var selectFa=document.getElementById("selectFamiglia");
            for(var i=0;i<response.data.length;i++){ //per ogni json andiamo a prendere il valore e lo inseriamo nella option e successivamente inseriamo l'option nella select
                var opt = document.createElement('option');  //creiamo una option
                if(i===0)
                    setSelectFamiglia(response.data[i].id);
                opt.value = response.data[i].id;  //valore option
                opt.innerHTML = "Famiglia: "+response.data[i].nomeFamiglia;  //text option
                selectFa.appendChild(opt);  //inseriamo nella select degli edifici la singola option
            }
        }
    },[auth])

    //Definisco un effetto per la gestione del componente SignupSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        SelectGarage(); //richiamo la funzione selectEdifici
        SelectFamiglia();
    },[SelectFamiglia,SelectGarage])

    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.put('http://localhost:5000/addFamGarage', {selectFamiglia,selectGarage});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    const selectGa=document.getElementById("selectGarage");
                    const options = selectGa.getElementsByTagName('option');
                    while (options.length > 0) {
                        options[0].remove();
                    }
                    SelectGarage();
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formSuc").style.display="block";
                    document.getElementById("formErrFam").style.display="none";
                    setTimeout(()=>{
                        document.getElementById("formSuc").style.display="none";
                    },10000)
                    break;

                case "garage già assegnato":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formErrFam").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrFam").style.display="none";
                    },10000)
                    break;

                case "error query":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="block";
                    document.getElementById("formErrFam").style.display="none";
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
            <Sidebar sidebar={1} link={8} />  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    Assegna Garage
                </header>
                <main className='form-login text-center' id="formAgg" style={{paddingTop:"30px"}}>
                    <form onSubmit={handleSubmit}>
                        <select className='form-control' id="selectFamiglia" name="selectFamiglia" onChange={(e) => setSelectFamiglia(e.target.value)} value={selectFamiglia}></select>                      
                        <select className='form-control' id="selectGarage" name="selectGarage" onChange={(e) => setSelectGarage(e.target.value)} value={selectGarage}></select>                      
                        <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">Assegna</button>
                    </form>
                    <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSuc" >
                        <h6 className="alert-heading">Garage assegnato</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErr" >
                        <h6 className="alert-heading">Errore nell'assegnazione.</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrFam" >
                        <h6 className="alert-heading">Famiglia già con garage.</h6>
                    </div>
                </main>
                <div className="alert alert-danger text-center" role="alert" style={{ display: "none", marginTop:"30px"}} id="formErrGa" >
                    <h6 className="alert-heading">Impossibile assegnare un garage,<br/>tutti sono già assegnati.</h6>
                </div>
            </div>
        </div>
    )
}

export default AddGarage;