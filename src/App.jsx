import { Routes, Route, useLocation, matchPath, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster, toast } from 'sonner';
import { Analytics } from '@vercel/analytics/react'

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
import Performanta from './pages/performanta';
import PreviewPDF from './components/PreviewPDF';

import ProtectedRoute from './routes/ProtectedRoute';


import './theme.css';

const SECRET =  '/panouadmininfomotion'; //import.meta.env.VITE_SECRET_ADMIN_PATH ||
const SECRETU =  '/panouadminuserinfomotion';// import.meta.env.VITE_SECRET_USERS_PATH ||

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
    '/verifica-email',
    SECRET,
    SECRETU,
  ];

  const isDynamicRouteValid = 
    matchPath('/lectie/:idLectie', location.pathname) || 
    matchPath('/compiler/:idLectie', location.pathname);

  const is404Page = !validPaths.includes(location.pathname) && !isDynamicRouteValid;

  const isAdminPage = location.pathname === SECRET;
  const epagadmin = location.pathname === SECRETU;
  const isCompilerPage = location.pathname.startsWith('/compiler');
  const isAuthActionPage = location.pathname === '/auth/action'; 

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        

        {!isAdminPage && !epagadmin && !isCompilerPage && !is404Page  && <Nav />}
        
        <main style={{ 
          minHeight: '100vh', 
          paddingTop: isAdminPage || epagadmin || isCompilerPage || is404Page ? '0' : '85px' 
        }}>
          <Routes>

            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />
            <Route path="/termeni" element={<TermsOfService />} />
            <Route path="/confidentialitate" element={<PrivacyPolicy />} />
            <Route path="/preview-pdf" element={import.meta.env.DEV ? <PreviewPDF /> : <Navigate to="/" />} />

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
                  <Clasament />
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

            <Route
              path="/trimite-lectie"
              element={
                <PrivateRoute requiredRole="teacher">
                  <TrimiteLectii />
                </PrivateRoute>
              }
            />


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

            <Route
              path="/performanta"
              element={
              <div>
                <Nav />
                <Performanta />
                <Footer />
              </div>
              }
            />

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
        {!isAdminPage && !epagadmin && !isCompilerPage && !is404Page && <Footer />}
        
      </AuthProvider>
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;