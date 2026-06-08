import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Kiosk from './pages/Kiosk';
import Tracker from './pages/Tracker';
import Admin from './pages/Admin';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
