import { React,useEffect,useState } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../dashboardSU/SignupCC.css'

function AddDispositivoCF() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    //vari stati che mi serviranno per gestire il form
    const [nome, setNome] = useState("");
    const [potenzaMax, setPotenzaMax] = useState("");
    const [potenzaMin, setPotenzaMin] = useState("");
    const [classeEnergetica, setClasseEnergetica] = useState("");
    const [marca, setMarca] = useState("");
    const [numeroPannelli,setNumeroPannelli] = useState("");
    const [numeroPale,setNumeroPale] = useState("");
    const [selectStanza,setStanza] = useState("");
    const [selectStanzaSen,setStanzaSen] = useState("");

     
    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const SubmitElettrodomestico = async (e) => {
        e.preventDefault();
        try {
             
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addElet', {nome,potenzaMax,potenzaMin,classeEnergetica,marca,selectStanza});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formSuc").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSuc").style.display="none";
                    },10000)
                    break;

                case "errore nell'inserimento":
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

    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const SubmitSensore = async (e) => {
        e.preventDefault();
        try {
             
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addSen', {nome,potenzaMax,potenzaMin,marca,selectStanza:selectStanzaSen});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErrSen").style.display="none";
                    document.getElementById("formSucSen").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSucSen").style.display="none";
                    },10000)
                    break;

                case "errore nell'inserimento":
                    document.getElementById("formSucSen").style.display="none";
                    document.getElementById("formErrSen").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrSen").style.display="none";
                    },10000)
                    break;
                    
                default:
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    };

    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const SubmitSolare = async (e) => {
        e.preventDefault();
        try {
            const email=auth.email;
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addSol', {numeroPannelli,potenzaMax,potenzaMin,email});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErrSol").style.display="none";
                    document.getElementById("formErrSolGià").style.display="none";
                    document.getElementById("formSucSol").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSucSol").style.display="none";
                    },10000)
                    break;

                case "errore nell'inserimento":
                    document.getElementById("formSucSol").style.display="none";
                    document.getElementById("formErrSolGià").style.display="none";
                    document.getElementById("formErrSol").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrSol").style.display="none";
                    },10000)
                    break;
                
                case "già esistente":
                    document.getElementById("formSucSol").style.display = "none";
                    document.getElementById("formErrSolGià").style.display = "block";
                    document.getElementById("formErrSol").style.display = "none";
                    setTimeout(() => {
                        document.getElementById("formErrSolGià").style.display = "none";
                    }, 10000)
                    break;

                default:
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    };


    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const SubmitEolico = async (e) => {
        e.preventDefault();
        try {
            
            const email=auth.email;
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addEol', {numeroPale,potenzaMax,potenzaMin,email});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErrEol").style.display="none";
                    document.getElementById("formErrEolGià").style.display="none";
                    document.getElementById("formSucEol").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSucEol").style.display="none";
                    },10000)
                    break;

                case "errore nell'inserimento":
                    document.getElementById("formSucEol").style.display="none";
                    document.getElementById("formErrEolGià").style.display="none";
                    document.getElementById("formErrEol").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrEol").style.display="none";
                    },10000)
                    break;
                
                case "già esistente":
                    document.getElementById("formSucEol").style.display = "none";
                    document.getElementById("formErrEolGià").style.display = "block";
                    document.getElementById("formErrEol").style.display = "none";
                    setTimeout(() => {
                        document.getElementById("formErrEolGià").style.display = "none";
                    }, 10000)
                    break;

                default:
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    };

    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const SubmitWall = async (e) => {
        e.preventDefault();
        try {
            
            const email=auth.email;
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/addWallbox', {nome,potenzaMax,potenzaMin,marca,email});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErrWall").style.display="none";
                    document.getElementById("formErrWallGià").style.display="none";
                    document.getElementById("formSucWall").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSucWall").style.display="none";
                    },10000)
                    break;

                case "errore nell'inserimento":
                    document.getElementById("formSucWall").style.display="none";
                    document.getElementById("formErrWallGià").style.display="none";
                    document.getElementById("formErrWall").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrWall").style.display="none";
                    },10000)
                    break;
                
                case "già esistente":
                    document.getElementById("formSucWall").style.display = "none";
                    document.getElementById("formErrWallGià").style.display = "block";
                    document.getElementById("formErrWall").style.display = "none";
                    setTimeout(() => {
                        document.getElementById("formErrWallGià").style.display = "none";
                    }, 10000)
                    break;

                default:
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    };

    //Definisco un effetto per la gestione del componente SignupSU e verrà eseguito una sola volta all'avvio del componente. 
    useEffect(()=>{
        // Definisco una funzione asincrona che esegue la richiesta HTTP per ottenere gli edifici da inserire nella select del form
        const selectStanze = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati degli edifici
            const response = await axios.post('http://localhost:5000/roomCF', {email});
            // Se la risposta del server contiene dati validi, creo le option della select.
            if(response.data){
                var Stanza=document.getElementById("selectStanza");
                var StanzaSen=document.getElementById("selectStanzaSen");

                for(var i=0;i<response.data.length;i++){ //per ogni json andiamo a prendere il valore e lo inseriamo nella option e successivamente inseriamo l'option nella select
                    var opt = document.createElement('option');  //creiamo una option
                    var opt2 = document.createElement('option');  //creiamo una option

                    if (selectStanza===""){
                        setStanza(response.data[i].id)
                    }
                    opt.value = response.data[i].id;  //valore option
                    opt.innerHTML = response.data[i].nome;  //text option

                    if (selectStanzaSen===""){
                        setStanzaSen(response.data[i].id)
                    }
                    opt2.value = response.data[i].id;  //valore option
                    opt2.innerHTML = response.data[i].nome;  //text option

                    Stanza.appendChild(opt);  //inseriamo nella select delle stanze la singola option
                    StanzaSen.appendChild(opt2);  //inseriamo nella select delle stanze la singola option

                }
            }
        }

        selectStanze(); //richiamo la funzione selectStanze
    },[auth])

    //funzione che ci permette di mostrare un determinato div all'interno della dashboard
    const changeDiv = (divM, div1,e) => {   //primo parametro è l'id del div da mostrare,gli altri parametri sono gli id dei div da nascondere
        e.preventDefault();
        document.getElementById(divM).style.display = "block";
        document.getElementById(div1).style.display = "none";
    }


    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={2} link={7} />  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    Aggiungi Dispositivo
                </header>
                
                <div id="formElet">
                    <header className="bg-grey text-center text-blue-600" style={{ marginTop: "20px" }}>
                        Elettrodomestico
                    </header>
                    <main className='form-login text-center' style={{ paddingTop: "30px" }}>
                        <form onSubmit={SubmitElettrodomestico}>
                            <input className="form-control" name="nome" onChange={(e) => setNome(e.target.value)} value={nome} type="text" placeholder="Nome" required pattern="[A-Za-z\s]{1,32}" title="Inserire solo lettere" />
                            <input className="form-control" name="potenzaMax" onChange={(e) => setPotenzaMax(e.target.value)} value={potenzaMax} type="text" placeholder="Potenza Massima" required pattern="[0-9]{1,5}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMin" onChange={(e) => setPotenzaMin(e.target.value)} value={potenzaMin} type="text" placeholder="Potenza Minima" required pattern="[0-9]{1,4}" title="Inserire solo numeri" />
                            <input className="form-control" name="classeEnergetica" onChange={(e) => setClasseEnergetica(e.target.value)} value={classeEnergetica} type="text" placeholder="Classe Energetica" required pattern="^[A-G][+]{0,2}$" title="Inserire una classe energetica valida (es. A+, B, C)" />
                            <input className="form-control" name="marca" onChange={(e) => setMarca(e.target.value)} value={marca} type="text" placeholder="Marca" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                            <select className='form-control' id="selectStanza" name="selectSelectStanza" onChange={(e) => setStanza(e.target.value)} value={selectStanza}></select>
                            <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">registra</button>
                        </form>
                        <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSuc" >
                            <h6 className="alert-heading">Elettrodomestico inserito</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErr" >
                            <h6 className="alert-heading">Errore nell'inserimento.</h6>
                        </div>
                        <div style={{marginTop:"16px",fontSize:"15px",}} className='text-blue-600'>
                            <span>Clicca le icone per cambiare dispositivo</span>
                            <span style={{display:"flex",marginTop:"16px"}}>
                               <a href='/#' onClick={(e)=>changeDiv("formSen","formElet",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/sensore.png`)} alt=""></img>
                               </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpSol","formElet",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/impSolare.png`)}  alt=""></img>
                                </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpEol","formElet",e)} style={{paddingRight:"25px"}} >
                                    <img src={require(`../../assets/impEolico.png`)}  alt=""></img>
                               </a>
                               <a href='/#' onClick={(e)=>changeDiv("formWall","formElet",e)} >
                                    <img src={require(`../../assets/evCharger.png`)} style={{height:"50px",width:"50px"}} alt=""></img>
                               </a>
                            </span>
                        </div>
                    </main>
                </div>

                <div id="formSen" style={{display:'none'}}>
                    <header className="bg-grey text-center text-blue-600" style={{ marginTop: "20px" }}>
                        Sensore
                    </header>
                    <main className='form-login text-center' style={{ paddingTop: "30px" }}>
                        <form onSubmit={SubmitSensore}>
                            <input className="form-control" name="nome" onChange={(e) => setNome(e.target.value)} value={nome} type="text" placeholder="Nome" required pattern="[A-Za-z\s]{1,32}" title="Inserire solo lettere" />
                            <input className="form-control" name="potenzaMax" onChange={(e) => setPotenzaMax(e.target.value)} value={potenzaMax} type="text" placeholder="Potenza Massima" required pattern="[0-9]{1,5}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMin" onChange={(e) => setPotenzaMin(e.target.value)} value={potenzaMin} type="text" placeholder="Potenza Minima" required pattern="[0-9]{1,4}" title="Inserire solo numeri" />
                            <input className="form-control" name="marca" onChange={(e) => setMarca(e.target.value)} value={marca} type="text" placeholder="Marca" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                            <select className='form-control' id="selectStanzaSen" name="selectStanzaSen" onChange={(e) => setStanzaSen(e.target.value)} value={selectStanzaSen}></select>
                            <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">registra</button>
                        </form>
                        <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSucSen" >
                            <h6 className="alert-heading">Sensore inserito</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrSen" >
                            <h6 className="alert-heading">Errore nell'inserimento.</h6>
                        </div>
                        <div style={{marginTop:"16px",fontSize:"15px",}} className='text-blue-600'>
                            <span>Clicca le icone per cambiare dispositivo</span>
                            <span style={{display:"flex",marginTop:"16px"}}>
                               <a href='/#' onClick={(e)=>changeDiv("formElet","formSen",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/elettrodomestico.png`)} style={{height:"50px",width:"50px"}}  alt=""></img>
                               </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpSol","formSen",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/impSolare.png`)} alt=""></img>
                                </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpEol","formSen",e)} style={{paddingRight:"25px"}}  >
                                    <img src={require(`../../assets/impEolico.png`)} alt=""></img>
                               </a>
                               <a href='/#' onClick={(e)=>changeDiv("formWall","formSen",e)}  alt="">
                                    <img src={require(`../../assets/evCharger.png`)} style={{height:"50px",width:"50px"}} alt=""></img>
                               </a>
                            </span>
                        </div>
                    </main>
                </div>

                <div id="formImpSol" style={{display:'none'}}>
                    <header className="bg-grey text-center text-blue-600" style={{ marginTop: "20px" }}>
                        Impianto Solare
                    </header>
                    <main className='form-login text-center' style={{ paddingTop: "30px" }}>
                        <form onSubmit={SubmitSolare}>
                            <input className="form-control" name="numeroPannelli" onChange={(e) => setNumeroPannelli(e.target.value)} value={numeroPannelli} type="text" placeholder="Numero Pannelli" required pattern="[0-9]{1,3}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMax" onChange={(e) => setPotenzaMax(e.target.value)} value={potenzaMax} type="text" placeholder="Potenza Massima" required pattern="[0-9]{1,5}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMin" onChange={(e) => setPotenzaMin(e.target.value)} value={potenzaMin} type="text" placeholder="Potenza Minima" required pattern="[0-9]{1,4}" title="Inserire solo numeri" />
                            <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">registra</button>
                        </form>
                        <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSucSol" >
                            <h6 className="alert-heading">Impianto solare inserito</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrSol" >
                            <h6 className="alert-heading">Errore nell'inserimento.</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrSolGià" >
                            <h6 className="alert-heading">Impianto solare già esistente per l'appartamento.</h6>
                        </div>
                        <div style={{marginTop:"16px",fontSize:"15px",}} className='text-blue-600'>
                            <span>Clicca le icone per cambiare dispositivo</span>
                            <span style={{display:"flex",marginTop:"16px"}}>
                               <a href='/#' onClick={(e)=>changeDiv("formElet","formImpSol",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/elettrodomestico.png`)} style={{height:"50px",width:"50px"}}  alt=""></img>
                               </a>
                                <a href='/#' onClick={(e)=>changeDiv("formSen","formImpSol",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/sensore.png`)} alt=""></img>
                                </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpEol","formImpSol",e)} style={{paddingRight:"25px"}}  >
                                    <img src={require(`../../assets/impEolico.png`)} alt=""></img>
                               </a>
                               <a href='/#' onClick={(e)=>changeDiv("formWall","formImpSol",e)}  alt="">
                                    <img src={require(`../../assets/evCharger.png`)} style={{height:"50px",width:"50px"}} alt=""></img>
                               </a>
                            </span>
                        </div>
                    </main>
                </div>

                <div id="formImpEol" style={{display:'none'}}>
                    <header className="bg-grey text-center text-blue-600" style={{ marginTop: "20px" }}>
                        Impianto Eolico
                    </header>
                    <main className='form-login text-center' style={{ paddingTop: "30px" }}>
                        <form onSubmit={SubmitEolico}>
                            <input className="form-control" name="numeroPale" onChange={(e) => setNumeroPale(e.target.value)} value={numeroPale} type="text" placeholder="Numero Pale" required pattern="[0-9]{1,3}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMax" onChange={(e) => setPotenzaMax(e.target.value)} value={potenzaMax} type="text" placeholder="Potenza Massima" required pattern="[0-9]{1,5}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMin" onChange={(e) => setPotenzaMin(e.target.value)} value={potenzaMin} type="text" placeholder="Potenza Minima" required pattern="[0-9]{1,4}" title="Inserire solo numeri" />
                            <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">registra</button>
                        </form>
                        <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSucEol" >
                            <h6 className="alert-heading">Impianto Eolico inserito</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrEol" >
                            <h6 className="alert-heading">Errore nell'inserimento.</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrEolGià" >
                            <h6 className="alert-heading">Impianto eolico già esistente per l'appartamento.</h6>
                        </div>
                        <div style={{marginTop:"16px",fontSize:"15px",}} className='text-blue-600'>
                            <span>Clicca le icone per cambiare dispositivo</span>
                            <span style={{display:"flex",marginTop:"16px"}}>
                               <a href='/#' onClick={(e)=>changeDiv("formElet","formImpEol",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/elettrodomestico.png`)} style={{height:"50px",width:"50px"}}  alt=""></img>
                               </a>
                                <a href='/#' onClick={(e)=>changeDiv("formSen","formImpEol",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/sensore.png`)} alt=""></img>
                                </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpSol","formImpEol",e)} style={{paddingRight:"25px"}}  >
                                    <img src={require(`../../assets/impSolare.png`)} alt=""></img>
                               </a>
                               <a href='/#' onClick={(e)=>changeDiv("formWall","formImpEol",e)}  alt="">
                                    <img src={require(`../../assets/evCharger.png`)} style={{height:"50px",width:"50px"}} alt=""></img>
                               </a>
                            </span>
                        </div>
                    </main>
                </div>

                <div id="formWall" style={{display:'none'}}>
                    <header className="bg-grey text-center text-blue-600" style={{ marginTop: "20px" }}>
                        wallBox
                    </header>
                    <main className='form-login text-center' style={{ paddingTop: "30px" }}>
                        <form onSubmit={SubmitWall}>
                            <input className="form-control" name="nome" onChange={(e) => setNome(e.target.value)} value={nome} type="text" placeholder="Nome" required pattern="[A-Za-z\s]{1,32}" title="Inserire solo lettere" />
                            <input className="form-control" name="potenzaMax" onChange={(e) => setPotenzaMax(e.target.value)} value={potenzaMax} type="text" placeholder="Potenza Massima" required pattern="[0-9]{1,5}" title="Inserire solo numeri" />
                            <input className="form-control" name="potenzaMin" onChange={(e) => setPotenzaMin(e.target.value)} value={potenzaMin} type="text" placeholder="Potenza Minima" required pattern="[0-9]{1,4}" title="Inserire solo numeri" />
                            <input className="form-control" name="marca" onChange={(e) => setMarca(e.target.value)} value={marca} type="text" placeholder="Marca" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                            <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">registra</button>
                        </form>
                        <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSucWall" >
                            <h6 className="alert-heading">wallBox inserito</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrWall" >
                            <h6 className="alert-heading">Errore nell'inserimento.</h6>
                        </div>
                        <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrWallGià" >
                            <h6 className="alert-heading">wallBox già esistente nel garage.</h6>
                        </div>
                        <div style={{marginTop:"16px",fontSize:"15px",}} className='text-blue-600'>
                            <span>Clicca le icone per cambiare dispositivo</span>
                            <span style={{display:"flex",marginTop:"16px"}}>
                               <a href='/#' onClick={(e)=>changeDiv("formElet","formWall",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/elettrodomestico.png`)} style={{height:"50px",width:"50px"}}  alt=""></img>
                               </a>
                                <a href='/#' onClick={(e)=>changeDiv("formSen","formWall",e)} style={{paddingRight:"25px"}}>
                                    <img src={require(`../../assets/sensore.png`)} alt=""></img>
                                </a>
                                <a href='/#' onClick={(e)=>changeDiv("formImpSol","formWall",e)} style={{paddingRight:"25px"}}  >
                                    <img src={require(`../../assets/impSolare.png`)} alt=""></img>
                               </a>
                               <a href='/#' onClick={(e)=>changeDiv("formImpEol","formWall",e)}  alt="">
                                    <img src={require(`../../assets/impEolico.png`)} style={{height:"50px",width:"50px"}} alt=""></img>
                               </a>
                            </span>
                        </div>
                    </main>
                </div>

            </div>
        </div>
    )
}

export default AddDispositivoCF;