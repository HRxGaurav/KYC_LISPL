import './App.css';
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from './components/Homepage';

function App() {
  return (
    <>
    <Routes>
            <Route path="/" element={<Homepage />} />
            {/* <Route path="/create_profile" element={<ProfilePage />} /> */}
          </Routes>
          <Toaster
            position="top-center"
            toastOptions={{ style: { width: "300px ", fontSize: "20px" } }}
          />
    </>
  );
}

export default App;
