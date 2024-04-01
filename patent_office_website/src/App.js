import Login from "./Pages/login";
import Homepage from "./Pages/home";
import Patents from "./Pages/patents";
import { Route, Routes, Navigate } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/patents" element={<Patents />} />
    </Routes>
  );
}

export default App;
