import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Importăm componentele de bază
import Nav from './components/nav'; // Asigură-te că numele fișierului e corect (nav.jsx)
import Footer from './components/footer';
import PrivateRoute from './components/PrivateRoute'; // Componenta de protecție

// Importăm paginile
import MainPage from './pages/mainpage';
import Contact from './pages/contact';
import Lectii from './pages/Lectii';
import LessonPage from './pages/LessonPage';
import Intro from './pages/introlectii';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import { ThemeProvider } from './context/ThemeContext';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Punem Nav-ul aici ca să fie vizibil pe toate paginile site-ului */}
        <Nav />

        <main style={{ minHeight: '80vh' }}>
          <Routes>
            {/* Rute Publice (Oricine le poate vedea) */}
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />

            {/* Rute Protejate (Doar pentru cei logați) */}
            <Route
              path="/lectii"
              element={
                <PrivateRoute>
                  <Lectii />
                </PrivateRoute>
              }
            />

            <Route
              path="/lectie/:idLectie"
              element={
                <PrivateRoute>
                  <LessonPage />
                </PrivateRoute>
              }
            />

            {/* Ruta de Admin - Poți adăuga ulterior și o protecție specială de tip AdminRoute */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </AuthProvider>
    </ThemeProvider>

  );
}

export default App;