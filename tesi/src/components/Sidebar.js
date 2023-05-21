import { useState, React } from "react";
import { useNavigate, Link} from 'react-router-dom'; //mi permette di cambiare in maniera dinamica le pagine

//componenti
import { useAuth } from './auth';  //autorizzazione al componente

function Sidebar (props){

    //varie sidebar per le dashborad veranno selezionate tramite il props sidebar
    const sidebarSU =[{id:1,url:"dashboardSU", nome:"Home",gap:false,src:"home"},
                    {id:2,url:"profiloSU", nome:"Profilo",gap:false,src:"profile"},
                    {id:5,url:"profiloSUcc",nome:"Profili Capo Condomini",gap:false,src:"profile"},
                    {id:3,url:"signupCC",  nome:"Registrazione Capo Condomino",gap:false,src:"addUser"},
                    {id:6,url:"building",nome:"Edifici",gap:false,src:"building"},
                    {id:4,url:"addBuilding", nome:"Aggiungi Edificio",gap:false,src:"addBuilding"},
                    {id:7,url:"apartment", nome:"Appartamenti",gap:false,src:"apartment"},
                    {id:8,url:"addApartment", nome:"Aggiungi Appartamento",gap:false,src:"addApartment"},
                    {id:9,url:"garage", nome:"Garage",gap:false,src:"garage"},
                    {id:10,url:"addGarage", nome:"Aggiungi Garage",gap:false,src:"garage"},
                    {id:11,url:"stanza", nome:"Stanza",gap:false,src:"room"},
                    {id:12,url:"addStanza", nome:"Aggiugi Stanza",gap:false,src:"addRoom"}
                ]

    const sidebarCC =[{id:1,url:"dashboardCC", nome:"home",gap:false,src:"home"},
                    {id:2,url:"profiloCC", nome:"profilo",gap:false,src:"profile"},
                    {id:3,url:"family", nome:"famiglie",gap:false,src:"family"},
                    {id:4,url:"addFamily", nome:"aggiungi famiglia",gap:false,src:"AddFamily"},
                    {id:5,url:"addPersona", nome:"crea membro",gap:false,src:"addUser"},
                    {id:6,url:"apartmentCC", nome:"Appartamenti",gap:false,src:"apartment"},
                    {id:7,url:"garageCC", nome:"garage",gap:false,src:"garage"},
                    {id:8,url:"famGarage", nome:"assegna garage",gap:false,src:"garage"},
                    {id:9,url:"dispositiviCC", nome:"dispositivi",gap:false,src:"device"},
                    {id:10,url:"addDispositiviCC", nome:"aggiungi dispositivo",gap:false,src:"addDevice"},
                    {id:11,url:"consumoCC", nome:"consumo",gap:false,src:"consumo"},   
                    {id:12,url:"produzioneCC", nome:"produzione",gap:false,src:"produzione"}
                ]

    const sidebarCF =[{id:1,url:"dashboardCF", nome:"home",gap:false,src:"home"},
                    {id:2,url:"profiloCF", nome:"profilo",gap:false,src:"profile"},
                    {id:3,url:"apartmentCF", nome:"appartamento",gap:false,src:"apartment"},
                    {id:4,url:"consumoCF", nome:"consumo",gap:false,src:"consumo"},
                    {id:5,url:"produzioneCF", nome:"produzione",gap:false,src:"produzione"},
                    {id:6,url:"dispositiviCF", nome:"dispositivi",gap:false,src:"device"},
                    {id:7,url:"addDispositiviCF", nome:"aggiungi dispositivo",gap:false,src:"addDevice"}
                ]

    const sidebarME = [{ id: 1, url: "dashboardME", nome: "home", gap: false, src: "home" },
                      { id: 2, url: "profiloME", nome: "profilo", gap: false, src: "profile" },
                      { id: 3, url: "apartmentME", nome: "appartamento", gap: false, src: "apartment" }
                    ]

    const sidebar =[sidebarSU,sidebarCC,sidebarCF,sidebarME]    

    //stati che mi serviranno per gestire l'apertura della sidebar
    const [open,setOpen] = useState(true)  //per gestire apertura e chiusura sidebar

    const navigate = useNavigate(); //funzione che mi permette di navigare tra le pagine
    const auth = useAuth();  //oggetto autorizzazione

    //funzione per effettuare il logout
    const handleLogout = () => {
        auth.logout() //tolgo l'autorizzazione
        navigate('/') //torno alla pagina di login
      }
    
    //in base alla grandezza della schermata modifico gli stati
    window.onresize = function() {
        //settaggi per tutte le pagine
        if(window.innerWidth<769){
            setOpen(false)
        }else if(window.innerWidth>=769){
            setOpen(true)
        }
    };

    //ui componente    
    //vado a modificare le classi in base ai diversi stati
    return( 
        <aside className="h-screen sticky top-0">
            <div className={`${open ? "w-72" : "w-20"} duration-300 h-screen pt-8 bg-blue-600 relative`} style={{}}>
                <img 
                    src={require("../assets/control.png")} 
                    className={`absolute cursor-pointer rounded-full -right-3 top-9 w-7 border-2 border-blue-600 ${!open && "rotate-180"}`}
                    onClick={() => setOpen(!open)}
                    alt=""
                />
                <div className="flex gap-x-4 items-center"> 
                    <img id="logo" src={require("../image/logo_small_white.png")} 
                        className={`cursor-pointer duration-500`} 
                        style={ open? {paddingLeft:"1rem",heigth:"30%",width:"30%"} : {paddingLeft:"1rem",heigth:"70%",width:"70%"}}
                        alt=""
                        />
                    <h1 className={`text-white origin-left font-medium text-xl duration-300 ${!open && "scale-0"}`}>SmartBuilding</h1>
                </div>
                <ul className="pt-6 pl-4" style={{marginRight:"25px"}} >

                    {/*tramite i props vado a inserire i vari link delle singole pagine delle varie dashboard */}
                    {sidebar[props.sidebar].map(({id,url,nome,gap,src})=>
                        <li key={url} 
                            className={`flex  rounded-md p-1.5 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4
                                ${gap ? "mt-9" : "mt-2"} ${id === props.link && "bg-light-white" }`}
                                >
                                <Link to={"/"+url} style={{ textDecoration: 'none' }}>
                                    <img src={require(`../assets/${src}.png`)} style={{height:"24px",width:"24px",maxWidth: "fit-content"}} alt=""/>
                                </Link>
                                <Link to={"/"+url} style={{ textDecoration: 'none' }}>
                                    <span className={`${!open && "hidden"} origin-left duration-200 text-white`}>{nome}</span>
                                </Link>
                            
                        </li>
                    )}

                    <li className="flex mt-2 rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4">
                        <img onClick={handleLogout} src={require(`../assets/logout.png`)} style={{height:"24px",width:"24px",maxWidth: "fit-content"}} alt=""/>
                        <span onClick={handleLogout} className={`${!open && "hidden"} origin-left duration-200 text-white`}>Logout</span>
                    </li>
                </ul>
            </div>
        </aside>    
    );

};
export default Sidebar;