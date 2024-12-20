import './App.css';
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from './components/Homepage';
import PANPage from './Pages/PANPage';
import GetStartedPage from './Pages/GetStartedPage';
import DigiLockerLanding from './components/organism/DigiLockerLanding';
import DigiLockerSuccess from './components/organism/DigiLockerSuccess';
import DigiLockerFailed from './components/organism/DigiLockerFailed';
import BankVerification from './components/organism/BankVerification';
// import IPV from './components/organism/IPV';
import ComingSoon from './components/atom/ComingSoon';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pan" element={<PANPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/digilocker" element={<DigiLockerLanding />} />
        <Route path="/digilocker-success" element={<DigiLockerSuccess />} />
        <Route path="/digilocker-failed" element={<DigiLockerFailed />} />
        <Route path="/bank-verification" element={<BankVerification />} />
        <Route path="/profile" element={<ComingSoon />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{ style: { width: "300px ", fontSize: "20px" } }}
      />
    </>
  );
}

export default App;
