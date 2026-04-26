import { Routes, Route } from 'react-router-dom';

// AICI ESTE SECRETUL: calea din interiorul ghilimelelor TREBUIE să fie cu litere mici, 
// exact cum sunt denumite fișierele tale în folderul pages!
import MainPage from './pages/mainpage'; 
import Contact from './pages/contact';   
import Lectii from './pages/Lectii';
import LessonPage from './pages/LessonPage';
import Intro from './pages/introlectii';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/despre" element={<Intro />} />
      <Route path="/lectii" element={<Lectii />} />
      <Route path="/lectie/:idLectie" element={<LessonPage />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;