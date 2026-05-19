import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster, toast } from 'sonner';

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
  
  const location = useLocation();

 
  const isAdminPage = location.pathname === '/admin';

  return (

    <ThemeProvider>
      <AuthProvider>
        
        {!isAdminPage && <Nav />}
        <main style={{ minHeight: '80vh', paddingTop: '85px' }}>
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

       
        {!isAdminPage &&<Footer />}
        
      </AuthProvider>
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;