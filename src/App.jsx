import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react"


import Nav from './components/nav';
import Footer from './components/footer';
import PrivateRoute from './components/PrivateRoute';
import Arena from './components/Arena';


import MainPage from './pages/mainpage';
import Contact from './pages/contact';
import Lectii from './pages/Lectii';
import LessonPage from './pages/LessonPage';
import Intro from './pages/introlectii';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Clasament from './pages/Clasament';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminUsers from './pages/AdminUsers';

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

        <main style={{ minHeight: '80vh', paddingTop: '85px' }}>
          <Routes>
            {/* ─── RUTE PUBLICE ─── */}
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />
            <Route path="/termeni" element={<TermsOfService />} />
            <Route path="/confidentialitate" element={<PrivacyPolicy />} />

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
              path="/arena"
              element={
                <PrivateRoute>
                  <Clasament />
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
            <Route
              path="/adminusers/"
              element={
                <PrivateRoute>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer-ul apare DOAR dacă NU suntem pe admin */}
        {!isAdminPage && <Footer />}
      </AuthProvider>
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;