import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingView from "../components/LandingView.jsx";
import CanvasView from "../components/CanvasView.jsx";
import LoadingView from "../components/LoadingView.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/loading" element={<LoadingView />} />
        <Route path="/universe" element={<CanvasView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
