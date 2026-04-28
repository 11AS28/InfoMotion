import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Importăm componentele de bază
import Nav from './components/nav'; 
import Footer from './components/footer';
import PrivateRoute from './components/PrivateRoute'; 

// Importăm paginile
import MainPage from './pages/mainpage';
import Contact from './pages/contact';
import Lectii from './pages/Lectii';
import LessonPage from './pages/LessonPage';
import Intro from './pages/introlectii';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

import './theme.css'; 

function App() {
  // Folosim useLocation pentru a detecta unde ne aflăm în site
  const location = useLocation();
  
  // Verificăm dacă suntem pe pagina de admin
  const isAdminPage = location.pathname === '/admin';

  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Nav-ul apare DOAR dacă NU suntem pe admin */}
        {!isAdminPage && <Nav />}

        <main style={{ minHeight: '80vh' }}>
          <Routes>
            {/* ─── RUTE PUBLICE ─── */}
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />

            {/* Administrare - fără PrivateRoute (se ocupă Admin.jsx de login) */}
            <Route path="/admin" element={<Admin />} />

            {/* ─── RUTE PROTEJATE ─── */}
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
          </Routes>
        </main>

        {/* Footer-ul apare DOAR dacă NU suntem pe admin */}
        {!isAdminPage && <Footer />}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;