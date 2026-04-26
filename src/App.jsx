import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Contact from './pages/Contact';
import Lectii from './pages/Lectii';
import LessonPage from './pages/LessonPage';
import Intro from './pages/introlectii'; // Presupun că așa se numește fișierul tău

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Pagina de "Despre" / Intro - am simplificat ruta la /despre */}
      <Route path="/despre" element={<Intro />} />
      
      {/* Pagina cu TOATE lecțiile */}
      <Route path="/lectii" element={<Lectii />} />
      
      {/* Pagina dinamică pentru O lecție */}
      <Route path="/lectie/:idLectie" element={<LessonPage />} />
    </Routes>
  );
}

export default App;