import './App.css';
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from './components/Homepage';
import PANPage from './Pages/PANPage';
import GetStartedPage from './Pages/GetStartedPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pan" element={<PANPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{ style: { width: "300px ", fontSize: "20px" } }}
      />
    </>
  );
}

export default App;
