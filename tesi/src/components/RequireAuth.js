import { Navigate, useLocation } from 'react-router-dom'; //mi permette di cambiare in maniera dinamica le pagine

//componenti
import { useAuth } from './auth'; //per effettuare l'autorizzazione

//definiamo il componente RequireAuth che viene usato per proteggere le rotte dell'applicazione richiedendo l'autenticazione
export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();  //oggetto autorizzazione
  //se l'autorizzazione è falsa il componente ti reindirizza alla pagina di login
  if (!auth.authorization) {
    return <Navigate to='/' state={{ path: location.pathname }} />
  }
  //se l'autorizzazione è vera il componente renderizza i children che sono passati come proprietà
  return children
}