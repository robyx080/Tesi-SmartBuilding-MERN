import {React,useState} from 'react';
import { useNavigate } from 'react-router-dom'; //mi permette di cambiare in maniera dinamica le pagine

//http client per effettuare le richieste al server
import axios from 'axios';

//componenti
import { useAuth } from './auth'; //per effettuare l'autorizzazione
import './Login.css';


function Login() {
    const navigate=useNavigate();  //funzione che mi permette di navigare tra le pagine
    const auth = useAuth();  //oggetto autorizzazione

    const [email, setEmail] = useState("");  //stato che mi permette di gestire l'email
    const [password, setPassword] = useState("");  //stato che mi permette di gestire la password

    const md5 = require('md5');  //funzione che mi permette di cifrare tramite hash la password 
    const salt =process.env.SALT;  //salt che mi permette di proteggere ulteriormente la password mentre cifro  (process.env è un oggetto globale di Node.js che contiene le variabili d'ambiente del sistema)

    
    //funzione asincrona che mi permette di effettuare il login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const hash=md5(password+salt);  //cifro la password aggiungendo il salt
            const response = await axios.post('http://localhost:5000/login', {email,hash}); //richiesta http per effettuare il login
            //console.log(response.data)

            //switch per gestire la risposta (o entri in una dashboard oppure c'è un errore)
            switch (response.data) {
                case "SU":
                    auth.login(email,true);
                    navigate("/dashboardSU");
                    break;
                case "CC":
                    auth.login(email,true);
                    navigate("/dashboardCC");
                    break;
                case "CF":
                    auth.login(email,true);
                    navigate("/dashboardCF");
                    break;
                case "ME":
                    auth.login(email,true);
                    navigate("/dashboardME");
                    break;
                case "invalid credentials":
                    document.getElementById("formErr").style.display="block";
                    break;
                default:
                    break;
            }         
        } catch (err) {
            //setError(err.response.data);
            console.log(err);
        }
      };

    //ui componente
    return (
        <div className='container' >
            <main className='form-login text-center'>
                <form onSubmit={handleSubmit}>
                    <img className="mb-4" src={require('../image/logo_small.png')} style={{marginLeft:"1.5rem"}} width='80%' alt="logo SmartBuilding"/>
                    <input className="form-control" name="email" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Indirizzo Email" required  pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="L'email deve essere composta così example@example.com" />
                    <input className="form-control" name="password" onChange={(e) => setPassword(e.target.value)} value={password} id="password" type="password" placeholder="Password" required  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" title="La password deve contenere 8 o più caratteri ed essere composta da almeno un numero,una lettera maiuscola e una minuscola." />
                    <button className="w-100 btn btn-lg btn-primary" type="submit" id="submit">Login</button>                      
                </form>
                <div className="alert alert-danger" role="alert" style={{display:"none"}} id="formErr" >
                    <h4 className="alert-heading">Email o password errata.</h4>
                </div>
                <p className="mt-5 mb-3 text-muted">© Progetto Smart Building<br/>Tesi Roberto Tomasello<br/>All Rights Reserved.</p>
            </main>
        </div>
    )
}

export default Login;
