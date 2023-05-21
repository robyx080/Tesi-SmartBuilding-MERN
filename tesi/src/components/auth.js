import { useState, createContext, useContext } from 'react'

const AuthContext = createContext(null)  //creiamo il contesto

export const AuthProvider = ({ children }) => {   //definiamo il provider per fornire il contesto ai componenti figli
  
  //stati che ci permettorno di mantenere l'autorizzazione e l'email
  const [authorization, setAuth] = useState(null)
  const [email,setEmail] = useState("")

  //metodo login per impostare gli stati
  const login = (email,bool) => {
    setAuth(bool);
    setEmail(email);
  }

  //metodo logout per cancellare gli stati
  const logout = () => {
    setAuth(false);
    setEmail(null)
  }

  //il provider fornisce i valori del contesto (email,authorization, login, logout) ai suoi figli
  return (
    <AuthContext.Provider value={{ email, authorization, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

//definiamo un hook che utilizza useContext() per accedere ai valori del contesto e renderli disponibili a chi usa questo hook
export const useAuth = () => {
  return useContext(AuthContext)
}