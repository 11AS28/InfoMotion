import { Routes, Route, useLocation, matchPath } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster, toast } from 'sonner';

import Nav from './components/nav';
import Footer from './components/footer';
import PrivateRoute from './components/PrivateRoute';
import Arena from './components/Arena';
import CompilerPage from './components/CompilatorTab';
import Online from './components/online';

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
import TrimiteLectii from './pages/TrimiteLectii';
import Marketplace from './pages/Marketplace'; 
import EmailNotVerified from './pages/EmailNotVerified';
// 1. IMPORTĂM NOUA PAGINĂ DE DUEL
import ArenaDuel from './pages/ArenaDuel';

import ProtectedRoute from './routes/ProtectedRoute';

import './theme.css';

const SECRET = '/panou-secret-infomotion-77x';
const SECRETU = '/panou-secret-users-99x';

function App() {
  const location = useLocation();

  const validPaths = [
    '/',
    '/auth',
    '/contact',
    '/despre',
    '/termeni',
    '/confidentialitate',
    '/lectii',
    '/arena',
    '/marketplace',
    '/trimite-lectie',
    SECRET,
    SECRETU,
  ];

  // 2. ADĂUGĂM RUTA DINAMICĂ DE DUEL ÎN VALIDARE (Prevenim eroarea 404)
  const isDynamicRouteValid = 
    matchPath('/lectie/:idLectie', location.pathname) || 
    matchPath('/compiler/:idLectie', location.pathname) ||
    matchPath('/arena/duel/:roomId', location.pathname);

  // 3. Dacă nu e în listă și nu e nici rută dinamică validă, înseamnă că E PAGINĂ 404!
  const is404Page = !validPaths.includes(location.pathname) && !isDynamicRouteValid;

  // Paginile specifice unde ascundeai deja elementele
  const isAdminPage = location.pathname === SECRET;
  const epagadmin = location.pathname === SECRETU;
  const isCompilerPage = location.pathname.startsWith('/compiler');
  // Adăugăm verificare pentru pagina de duel, ca să îi ascundem Nav-ul și Footer-ul (la fel ca la compiler)
  const isDuelPage = location.pathname.startsWith('/arena/duel');

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
        <Toaster richColors position="top-right" />
        
        {/* Navigația DISPARE dacă suntem pe admin, compiler, duel SAU pe o pagină 404 */}
        {!isAdminPage && !epagadmin && !isCompilerPage && !isDuelPage && !is404Page && <Nav />}
        
        <main style={{ 
          minHeight: '100vh', 
          paddingTop: isAdminPage || epagadmin || isCompilerPage || isDuelPage || is404Page ? '0' : '85px' 
        }}>
          <Routes>
            {/* RUTE PUBLICE */}
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />
            <Route path="/termeni" element={<TermsOfService />} />
            <Route path="/confidentialitate" element={<PrivacyPolicy />} />

            {/* RUTELE DE ADMIN SECRETE ȘI PROTEJATE DUR */}
            <Route
              path={SECRET}
              element={
                <PrivateRoute requiredRole="admin">
                  <Admin />
                </PrivateRoute>
              }
            />

            <Route
              path={SECRETU}
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminUsers />
                </PrivateRoute>
              }
            />

            {/* RUTE UTILIZATORI LOGAȚI */}
            <Route
              path="/lectii"
              element={
              <ProtectedRoute>
                <PrivateRoute>
                  <Lectii />
                </PrivateRoute>
              </ProtectedRoute>
                
              }
            />

            <Route
              path="/arena"
              element={
              <ProtectedRoute>
                <PrivateRoute>
                  {/* Observație: Aici ai componenta Clasament în loc de Arena, bănuiesc că așa ai vrut structura inițială */}
                  <Clasament />
                </PrivateRoute>
              </ProtectedRoute>
              }
            />

            {/* 3. NOUA RUTĂ PENTRU DUELUL LIVE PROTEJAT */}
            <Route
              path="/arena/duel/:roomId"
              element={
                <ProtectedRoute>
                  <PrivateRoute>
                    <ArenaDuel />
                  </PrivateRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/lectie/:idLectie"
              element={
              <ProtectedRoute>
                <PrivateRoute>
                  <LessonPage />
                </PrivateRoute>
              </ProtectedRoute>
              }
            />

            {/* RUTĂ COMPILER TAB SEPARAT */}
            <Route
              path="/compiler/:idLectie"
              element={
                <PrivateRoute>
                  <CompilerPage />
                </PrivateRoute>
              }
            />

            <Route 
              path="/marketplace" 
              element={
              <ProtectedRoute>
                <PrivateRoute>
                  <Marketplace />
                </PrivateRoute>
              </ProtectedRoute>
              } 
            />

            {/* RUTĂ PROFESORI */}
            <Route
              path="/trimite-lectie"
              element={
                <PrivateRoute requiredRole="teacher">
                  <TrimiteLectii />
                </PrivateRoute>
              }
            />


          {/* RUTĂ VERIFICARE EMAIL */}
            <Route
              path="/verifica-email"
              element=
              { <div>
                <Nav />
                <EmailNotVerified />
                <Footer />
              </div>
              }
            />

            {/* RUTA FALLBACK 404 */}
            <Route 
              path="*" 
              element={
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '85vh',
                  color: '#ffffff',
                  fontFamily: 'sans-serif',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', opacity: 0.85
                  }}>
                    <img 
                      src="/logo-infomotion.svg?v=2" 
                      alt="InfoMotion Logo" 
                      style={{ width: '42px', height: 'auto', display: 'block' }} 
                    />
                    <span style={{ 
                      fontSize: '1.6rem', fontWeight: '600', letterSpacing: '-0.5px' 
                    }}>
                      InfoMotion<span style={{ color: '#00f3ff', fontWeight: 'bold' }}>.</span>
                    </span>
                  </div>

                  <h1 style={{ 
                    fontSize: '6rem', fontWeight: '800', letterSpacing: '-2px',
                    margin: '0 0 10px 0', background: 'linear-gradient(180deg, #ffffff 0%, #3a4750 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>
                    404
                  </h1>
                  
                  <p style={{ 
                    color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6', margin: '0 0 30px 0' 
                  }}>
                    Pagina pe care o cauți nu există, a fost ștearsă sau mutată într-o zonă securizată.
                  </p>

                  <a 
                    href="/" 
                    style={{
                      color: '#00f3ff',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      border: '1px solid rgba(0, 243, 255, 0.2)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 243, 255, 0.03)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.2)';
                    }}
                  >
                    Înapoi la pagina principală
                  </a>
                </div>
              } 
            />
          </Routes>
        </main>

        <Online />
        {/* Footer-ul dispare de asemenea de pe pagina de duel */}
        {!isAdminPage && !epagadmin && !isCompilerPage && !isDuelPage && !is404Page && <Footer />}
        </SocketProvider>
      </AuthProvider>
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;