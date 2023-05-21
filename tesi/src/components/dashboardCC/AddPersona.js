import { React,useEffect,useState } from 'react';

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from '../auth'; //autorizzazione al componente
import Sidebar from '../Sidebar';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../dashboardSU/SignupCC.css'

function SignupCC() {
    
    const auth = useAuth(); //oggetto autorizzazione
    
    //vari stati che mi serviranno per gestire il form
    const [nome, setNome] = useState("");
    const [cognome, setCognome] = useState("");
    const [cf, setCF] = useState("");
    const [data, setData] = useState("");
    const [luogo, setLuogo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [Cpassword, setCpassword] = useState("");
    const [selectFamiglia,setSelectFamiglia] = useState("");
    const [telefono,setTelefono] = useState("");
    const [selectTipo,setSelectTipo] = useState("ME");

    const md5 = require('md5');  //funzione che mi permette di cifrare tramite hash la password
    const salt =process.env.SALT;  //salt che mi permette di proteggere ulteriormente la password mentre cifro  (process.env è un oggetto globale di Node.js che contiene le variabili d'ambiente del sistema)
    
    //funzione asincrona che mi permette di effettuare la registrazione del capo condomino
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
             //cifro le password aggiungendo il salt
            const hash=md5(password+salt); 
            const Chash=md5(Cpassword+salt);
            //richiesta http per effettuare la registrazione del capo condomino
            const response = await axios.post('http://localhost:5000/signupMECF', {nome,cognome,cf,data,luogo,telefono,email,hash,Chash,selectFamiglia,selectTipo});
            //in base alla risposta ottenuta mostro l'alert di successo o di errore
            switch (response.data) {
                case "valid entry":
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formEmailOrCf").style.display="none";
                    document.getElementById("formPass").style.display="none";
                    document.getElementById("formErrCF").style.display="none";
                    document.getElementById("formSuc").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formSuc").style.display="none";
                    },10000)
                    break;

                case "errore nella registrazione":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formEmailOrCf").style.display="none";
                    document.getElementById("formPass").style.display="none";
                    document.getElementById("formErrCF").style.display="none";
                    document.getElementById("formErr").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErr").style.display="none";
                    },10000)
                    break;

                case "email o cf già esistenti":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formPass").style.display="none";
                    document.getElementById("formErrCF").style.display="none";
                    document.getElementById("formEmailOrCf").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formEmailOrCf").style.display="none";
                    },10000)
                    break;

                case "già capofamiglia":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formPass").style.display="none";
                    document.getElementById("formEmailOrCf").style.display="none";
                    document.getElementById("formErrCF").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formErrCF").style.display="none";
                    },10000)
                    break;

                case "invalid password":
                    document.getElementById("formSuc").style.display="none";
                    document.getElementById("formErr").style.display="none";
                    document.getElementById("formEmailOrCf").style.display="none";
                    document.getElementById("formErrCF").style.display="none";
                    document.getElementById("formPass").style.display="block";
                    setTimeout(()=>{
                        document.getElementById("formPass").style.display="none";
                    },10000)
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
        const selectFamiglia = async () => {
            //Prendo l'email dell'utente loggato dallo stato di autenticazione
            const email=auth.email;
            //richiesta http per prendere i dati degli edifici
            const response = await axios.post('http://localhost:5000/famigliaCC', {email});
            // Se la risposta del server contiene dati validi, creo le option della select.
            if(response.data==="nessuna famiglia"){
                var selectEd=document.getElementById("selectFamiglia");
                var opt = document.createElement('option');
                opt.value=null
                opt.innerHTML="nessuna famiglia (impossibile creare)"
                selectEd.appendChild(opt);
            }else{
                selectEd=document.getElementById("selectFamiglia");
                for(var i=0;i<response.data.length;i++){ //per ogni json andiamo a prendere il valore e lo inseriamo nella option e successivamente inseriamo l'option nella select
                    opt = document.createElement('option');  //creiamo una option
                    if(i===0)
                        setSelectFamiglia(response.data[i].id);
                    opt.value = response.data[i].id;  //valore option
                    opt.innerHTML = "Famiglia: "+response.data[i].nomeFamiglia;  //text option
                    selectEd.appendChild(opt);  //inseriamo nella select degli edifici la singola option
                }
            }
        }
        //funzione per ritornare la data attuale a aggiungerla come attributo di un input date 
        const maxDataNascita = () =>{
            //creazione data
            var today = new Date();    //oggetto Date
            var day = today.getDate();  //prendiamo il giorno
            var month = today.getMonth() + 1 ; //prendiamo il mese  (Gennaio è 0 per getMonth per questo aggiungiamo 1)
            var year = today.getFullYear(); //prendiamo l'anno
            //se il giorno e il mese sono inferiori al 10 aggiungiamo uno 0 davanti per farli diventare 01  02  03 ecc
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            today = year + '-' + month + '-' + day; //creo la data
            document.getElementById("dataNascita").setAttribute("max", today);
        }

        selectFamiglia(); //richiamo la funzione selectEdifici
        maxDataNascita(); //richiamo la funzione maxDataNascita
    },[auth])


    //ui componente
    return(
        <div className='flex'>
            <Sidebar sidebar={1} link={5} />  {/*componente sidebar con relativi props*/}
            <div className="p-7 text-2xl font-semibold flex-1 h-full">
                <header className="bg-grey text-center text-blue-600">
                    Registrazione Membro/Capo Famiglia
                </header>
                <main className='form-login text-center' style={{paddingTop:"30px"}}>
                    <form onSubmit={handleSubmit}>
                        <input className="form-control" name="nome" onChange={(e) => setNome(e.target.value)} value={nome} type="text" placeholder="Nome" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                        <input className="form-control" name="cognome" onChange={(e) => setCognome(e.target.value)} value={cognome} type="text" placeholder="Cognome" required pattern="[A-Za-z]{1,32}" title="Inserire solo lettere" />
                        <input className="form-control" name="cf" onChange={(e) => setCF(e.target.value)} value={cf} type="text" placeholder="Cofice Fiscale" maxLength="16" required pattern="^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$" title="Il codice fiscale deve avere questa forma: 'AAABBB00C11D222E'" />
                        <input className="form-control" name="data_nascita" id="dataNascita" onChange={(e) => setData(e.target.value)} value={data} type="date" required />
                        <input className="form-control" name="luogo_nascita" onChange={(e) => setLuogo(e.target.value)} value={luogo} type="text" placeholder="Luogo di nascita" required pattern="[A-Za-z ]{1,32}" title="Inserire solo lettere" />
                        <input className="form-control" name="telefono" onChange={(e) => setTelefono(e.target.value)} value={telefono} type="text" placeholder="Numero di telefono" minLength="6" maxLength="9" required pattern="[0-9]{6,9}" title="Inserire solo numeri (min 6 max 9)" />
                        <input className="form-control" name="email" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Indirizzo Email" required pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="L'email deve essere composta così example@example.com" />
                        <input className="form-control" name="password" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" required pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" title="La password deve contenere 8 o più caratteri ed essere composta da almeno un numero,una lettera maiuscola e una minuscola." />
                        <input className="form-control" name="Cpassword" onChange={(e) => setCpassword(e.target.value)} value={Cpassword} type="password" placeholder="Conferma Password" required pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" title="La password deve contenere 8 o più caratteri ed essere composta da almeno un numero,una lettera maiuscola e una minuscola." />
                        <select className='form-control' id="selectFamiglia" name="selectFamiglia" onChange={(e) => setSelectFamiglia(e.target.value)} value={selectFamiglia}></select>
                        <select className='form-control' id="selectTipo" name="selectTipo" onChange={(e) => setSelectTipo(e.target.value)} value={selectTipo}>
                            <option value="ME">Membro Famiglia</option>
                            <option value="CF">Capo Famiglia</option>
                        </select>
                        <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">registra</button>
                    </form>
                    <div className="alert alert-success" role="alert" style={{ display: "none" }} id="formSuc" >
                        <h6 className="alert-heading">Registrazione avvenuta</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErr" >
                        <h6 className="alert-heading">Errore nella registrazione.</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formEmailOrCf" >
                        <h6 className="alert-heading">Email o CF già esistenti.</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formPass" >
                        <h6 className="alert-heading">Password non uguali</h6>
                    </div>
                    <div className="alert alert-danger" role="alert" style={{ display: "none" }} id="formErrCF" >
                        <h6 className="alert-heading">Famiglia già con Capo Famiglia</h6>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default SignupCC;