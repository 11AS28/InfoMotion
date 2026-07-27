import { Routes, Route, useLocation, matchPath, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

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
import ExtensiePage from './pages/Extenise';
import DiplomaPage from './pages/DiplomaPage';

import ProtectedRoute from './routes/ProtectedRoute';

import './theme.css';

const SECRET = '/panouadmininfomotion'; 
const SECRETU = '/panouadminuserinfomotion';

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
    '/performanta',
    '/extensie',
    '/preview-pdf',
    SECRET,
    SECRETU,
  ];

  const isDynamicRouteValid =
    matchPath('/lectie/:idLectie', location.pathname) ||
    matchPath('/compiler/:idLectie', location.pathname) ||
    matchPath('/diploma/:idDiploma', location.pathname);

  const is404Page = !validPaths.includes(location.pathname) && !isDynamicRouteValid;

  const isAdminPage = location.pathname === SECRET;
  const epagadmin = location.pathname === SECRETU;
  const isCompilerPage = location.pathname.startsWith('/compiler');
  const isDiplomaPage = location.pathname.startsWith('/diploma');
   const pdfeu = location.pathname.startsWith('/preview-pdf');

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster richColors position="top-right" />

        {!isAdminPage && !epagadmin && !isCompilerPage && !isDiplomaPage && !is404Page && !pdfeu && <Nav />}

        <main style={{
          minHeight: '100vh',
          paddingTop: isAdminPage || epagadmin || isCompilerPage || isDiplomaPage || is404Page || pdfeu ? '0' : '85px'
        }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />
            <Route path="/termeni" element={<TermsOfService />} />
            <Route path="/confidentialitate" element={<PrivacyPolicy />} />
            <Route path="/preview-pdf" element={import.meta.env.DEV ? <PreviewPDF /> : <Navigate to="/" />} />
            
            <Route path="/extensie" element={
              <div>
                <Nav />
                <ExtensiePage />
                <Footer />
              </div>
            } />

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

            <Route path="/diploma/:id" element={<DiplomaPage />} />

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
              element={
                <div>
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

            {/* RUTĂ CATCH-ALL 404 */}
            <Route 
              path="*" 
              element={
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '100vh',
                  backgroundColor: '#0a0d14', // Fix fundal dark explicit
                  color: '#ffffff',
                  fontFamily: 'sans-serif',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', opacity: 0.9
                  }}>
                    <img
                      src="/logo-infomotion.svg?v=2"
                      alt="InfoMotion Logo"
                      style={{ width: '38px', height: 'auto', display: 'block' }}
                    />
                    <span style={{
                      fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.5px'
                    }}>
                      InfoMotion<span style={{ color: '#00f3ff', fontWeight: 'bold' }}>.</span>
                    </span>
                  </div>

                  <h1 style={{
                    fontSize: '7rem', fontWeight: '900', letterSpacing: '-2px',
                    margin: '0 0 10px 0', 
                    background: 'linear-gradient(180deg, #ffffff 30%, #3a4750 100%)',
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    lineHeight: '1'
                  }}>
                    404
                  </h1>

                  <p style={{
                    color: '#94a3b8', fontSize: '1.05rem', maxWidth: '420px', lineHeight: '1.6', margin: '0 0 30px 0'
                  }}>
                    Pagina pe care o cauți nu există, a fost ștearsă sau mutată într-o zonă securizată.
                  </p>

                  <Link
                    to="/"
                    style={{
                      color: '#00f3ff',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      border: '1px solid rgba(0, 243, 255, 0.3)',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 243, 255, 0.05)',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 0 15px rgba(0, 243, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.6)';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 243, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 243, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.1)';
                    }}
                  >
                    Înapoi la pagina principală
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>

        <Online />
        {!isAdminPage && !epagadmin && !isCompilerPage && !isDiplomaPage && !is404Page && !pdfeu && <Footer />}
      </AuthProvider>
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;