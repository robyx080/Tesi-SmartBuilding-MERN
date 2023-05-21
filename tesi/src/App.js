import { React } from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';

//componenti
import Login from'./components/Login';
import { AuthProvider } from './components/auth';
import { RequireAuth } from './components/RequireAuth';

import DashboardSU from './components/dashboardSU/DashboardSU';
import SignupCC from './components/dashboardSU/SignupCC';
import ProfiloSU from './components/dashboardSU/ProfiloSU';
import AddBuilding from './components/dashboardSU/AddBuilding';
import Building from './components/dashboardSU/Building';
import ProfiloSUcc from './components/dashboardSU/ProfiloSUcc';
import Apartment from './components/dashboardSU/Apartment';
import AddApartment from './components/dashboardSU/AddApartment';
import Garage from './components/dashboardSU/Garage';
import AddGarage from './components/dashboardSU/AddGarage';
import AddRoom from './components/dashboardSU/AddRoom';
import Room from './components/dashboardSU/Room';

import DashboardCC from './components/dashboardCC/DashboardCC';
import ProfiloCC from './components/dashboardCC/ProfiloCC';
import AddFamily from './components/dashboardCC/AddFamily';
import FamGarage from './components/dashboardCC/FamGarage';
import GarageCC from './components/dashboardCC/GarageCC';
import Family from './components/dashboardCC/Family';
import AddPersona from './components/dashboardCC/AddPersona';
import ApartmentCC from './components/dashboardCC/ApartmentCC';
import DeviceCC from './components/dashboardCC/DeviceCC';
import AddDispositivoCC from './components/dashboardCC/AddDispositivoCC';
import ConsumoCC from './components/dashboardCC/ConsumoCC';
import ProduzioneCC from './components/dashboardCC/ProduzioneCC';

import DashboardCF from './components/dashboardCF/DashboardCF';
import ProfiloCF from './components/dashboardCF/ProfiloCF';
import ApartmentCF from './components/dashboardCF/ApartmentCF';
import DeviceCF from './components/dashboardCF/DeviceCF';
import AddDispositivoCF from './components/dashboardCF/AddDispositivoCF';
import ConsumoCF from './components/dashboardCF/ConsumoCF';
import ProduzioneCF from './components/dashboardCF/ProduzioneCF';

import DashboardME from './components/dashboardME/DashboardME';
import ProfiloME from './components/dashboardME/ProfiloME';
import ApartmentME from './components/dashboardME/ApartmentME';

//libreria css bootstrap
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {

  return (
    <div className='App'>
      <AuthProvider> {/* autorizzazione per le routes */}
        <Router>
          <Routes>
            {/*Route login senza autorizzazione*/}
            <Route path="/" element={<Login/>} />

            {/*Route dashboard supervisore con autorizzazione obbligatoria*/}
            <Route path="/dashboardSU" element={<RequireAuth> <DashboardSU/> </RequireAuth>}/>
            <Route path="/signupCC" element={<RequireAuth> <SignupCC/> </RequireAuth>}/>
            <Route path="/profiloSU" element={<RequireAuth> <ProfiloSU /> </RequireAuth>}/>
            <Route path='/addBuilding' element={<RequireAuth> <AddBuilding/> </RequireAuth>}/>
            <Route path="/profiloSUcc" element={<RequireAuth> <ProfiloSUcc /> </RequireAuth>}/>
            <Route path="/building" element={<RequireAuth> <Building /> </RequireAuth>}/>
            <Route path="/apartment" element={<RequireAuth> <Apartment/> </RequireAuth>}/>
            <Route path="/addApartment" element={<RequireAuth> <AddApartment/> </RequireAuth>}/>
            <Route path="/garage" element={<RequireAuth> <Garage/> </RequireAuth>}/>
            <Route path="/addGarage" element={<RequireAuth> <AddGarage/> </RequireAuth>}/>
            <Route path="/addStanza" element={<RequireAuth> <AddRoom/> </RequireAuth>}/>
            <Route path="/Stanza" element={<RequireAuth> <Room/> </RequireAuth>}/>


            {/*Route dashboard capo condomino con autorizzazione obbligatoria*/}
            <Route path="/dashboardCC" element={<RequireAuth> <DashboardCC/> </RequireAuth>}/>
            <Route path="/profiloCC" element={<RequireAuth> <ProfiloCC/> </RequireAuth>}/>
            <Route path="/addFamily" element={<RequireAuth> <AddFamily/> </RequireAuth>}/>
            <Route path="/famGarage" element={<RequireAuth> <FamGarage/> </RequireAuth>}/>
            <Route path="/garageCC" element={<RequireAuth> <GarageCC/> </RequireAuth>}/>
            <Route path="/family" element={<RequireAuth> <Family/> </RequireAuth>}/>
            <Route path="/addPersona" element={<RequireAuth> <AddPersona/> </RequireAuth>}/>
            <Route path="/apartmentCC" element={<RequireAuth> <ApartmentCC/> </RequireAuth>}/>
            <Route path="/dispositiviCC" element={<RequireAuth> <DeviceCC/> </RequireAuth>}/>
            <Route path="/addDispositiviCC" element={<RequireAuth> <AddDispositivoCC/> </RequireAuth>}/>
            <Route path="/consumoCC" element={<RequireAuth> <ConsumoCC/> </RequireAuth>}/>
            <Route path="/produzioneCC" element={<RequireAuth> <ProduzioneCC/> </RequireAuth>}/>


            {/*Route dashboard capo famiglia con autorizzazione obbligatoria*/}
            <Route path="/dashboardCF" element={<RequireAuth> <DashboardCF/> </RequireAuth>}/>
            <Route path="/profiloCF" element={<RequireAuth> <ProfiloCF/> </RequireAuth>}/>
            <Route path="/apartmentCF" element={<RequireAuth> <ApartmentCF/> </RequireAuth>}/>
            <Route path="/dispositiviCF" element={<RequireAuth> <DeviceCF/> </RequireAuth>}/>
            <Route path="/addDispositiviCF" element={<RequireAuth> <AddDispositivoCF/> </RequireAuth>}/>
            <Route path="/consumoCF" element={<RequireAuth> <ConsumoCF/> </RequireAuth>}/>
            <Route path="/produzioneCF" element={<RequireAuth> <ProduzioneCF/> </RequireAuth>}/>


            {/*Route dashboard membro famiglia con autorizzazione obbligatoria*/}
            <Route path="/dashboardME" element={<RequireAuth> <DashboardME/> </RequireAuth>}/>
            <Route path="/profiloME" element={<RequireAuth> <ProfiloME/> </RequireAuth>}/>
            <Route path="/apartmentME" element={<RequireAuth> <ApartmentME/> </RequireAuth>}/>


          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;