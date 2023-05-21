import { React,useEffect,useState,useCallback } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../dashboardSU/SignupCC.css';

function AddBuilding() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    //vari stati che mi serviranno per gestire il form
    const [nomeFamiglia, setNomeFamiglia] = useState("");
    const [selectAppartamento, setSelectAppartamento] = useState("");
    


    // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere gli edifici da inserire nella select del form
    const SelectAppartamento = useCallback( async () => {
        //Prendo l'email dell'utente loggato dallo stato di autenticazione
        const email=auth.email;
        //richiesta http per prendere i dati degli edifici
        const response = await axios.post('http://localhost:5000/selectAppartamentiCC', {email});
        // Se la risposta del server contiene dati validi, creo le option della select.
        if(response.data){
            var selectEd=document.getElementById("selectAppartamento");
            if(response.data.length===0){
                document.getElementById("formAgg").style.display="none";
                document.getElementById("formErrFam").style.display="block";
            }else{
                for(var i=0;i<response.data.length;i++){ //per ogni json andiamo a prendere il valore e lo inseriamo nella option e successivamente inseriamo l'option nella select
                    var opt = document.createElement('option');  //creiamo una option
                    if(i===0)
                        setSelectAppartamento(response.data[i].id);
                    opt.value = response.data[i].id;  //valore option
                    opt.innerHTML = "Id ed: "+response.data[i].idEdificio+" piano: "+response.data[i].piano+" grandezza: "+response.data[i].grandezza;  //text option
                    selectEd.appendChild(opt);  //inseriamo nella select degli edifici la singola option
                }
            }
        }
    },[auth])

    //Definisco un effetto per la gestione del componente SignupSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        SelectAppartamento(); //richiamo la funzione selectEdifici
    },[SelectAppartamento])


    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addFamily', {nomeFamiglia,selectAppartamento});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    const selectAp=document.getElementById("selectAppartamento");
                    const options = selectAp.getElementsByTagName('option');
                    while (options.length > 0) {
                        options[0].remove();
                    }
                    SelectAppartamento();
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
            <Sidebar sidebar={1} link={4} />  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    Aggiungi Famiglia
                </header>
                <main className='form-login text-center' id="formAgg" style={{paddingTop:"30px"}}>
                    <form onSubmit={handleSubmit}>
                        <input className="form-control" name="nomeFamiglia" onChange={(e) => setNomeFamiglia(e.target.value)} value={nomeFamiglia} type="text" placeholder="Nome Famiglia" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                        <select className='form-control' id="selectAppartamento" name="selectAppartamento" onChange={(e) => setSelectAppartamento(e.target.value)} value={selectAppartamento}></select>
                        <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">Crea</button>
                    </form>
                    <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSuc" >
                        <h6 className="alert-heading">Famiglia Creata</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErr" >
                        <h6 className="alert-heading">Errore nella creazione.</h6>
                    </div>
                </main>
                <div className="alert alert-danger text-center" role="alert" style={{ display: "none", marginTop:"30px"}} id="formErrFam" >
                    <h6 className="alert-heading">Impossibile creare una Famiglia,<br/>tutti gli appartamenti sono assegnati.</h6>
                </div>
            </div>
        </div>
    )
}

export default AddBuilding;