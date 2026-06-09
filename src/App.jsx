// App.js modificat
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster, toast } from 'sonner';

import Nav from './components/nav';
import Footer from './components/footer';
import PrivateRoute from './components/PrivateRoute';
import Arena from './components/Arena';
import CompilerPage from './components/CompilatorTab';
import Online from './components/online';
import Marketplace from './components/Marketplace'; 

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

import './theme.css';

function App() {
  const location = useLocation();

  const isAdminPage = location.pathname === '/admin';
  const epagadmin = location.pathname === '/adminusers';
  
  // Verificăm dacă suntem pe pagina compilatorului ca să ascundem Nav și Footer și să scoatem padding-ul de sus!
  const isCompilerPage = location.pathname.startsWith('/compiler');

  return (
    <ThemeProvider>
      <AuthProvider>
        
        
        {/* Ascundem navigația pe admin și pe compiler */}
        {!isAdminPage && !epagadmin && !isCompilerPage && <Nav />}
        
        <main style={{ 
          minHeight: '100vh', 
          paddingTop: isAdminPage || epagadmin || isCompilerPage ? '0' : '85px' 
        }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre" element={<Intro />} />
            <Route path="/termeni" element={<TermsOfService />} />
            <Route path="/confidentialitate" element={<PrivacyPolicy />} />

            <Route path="/admin" element={<Admin />} />

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

            {/* RUTA NOUĂ PENTRU TABUL SEPARAT DE COD */}
            <Route
              path="/compiler/:idLectie"
              element={
                <PrivateRoute>
                  <CompilerPage />
                </PrivateRoute>
              }
            />

              <Route path="/marketplace" element={
               <PrivateRoute>
                <Marketplace />
                </PrivateRoute>
                } />

            <Route
              path="/adminusers/"
              element={
                <PrivateRoute>
                  <AdminUsers />
                </PrivateRoute>
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
          </Routes>
        
        </main>

         <Online/>
        {/* Ascundem footer-ul pe admin și pe compiler */}
        {!isAdminPage && !epagadmin && !isCompilerPage && <Footer />}
        
      </AuthProvider>
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;