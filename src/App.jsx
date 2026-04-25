import { Routes, Route } from 'react-router-dom';
import './App.css';

import MainPage from './pages/mainpage';
import Contact from './pages/contact';

function App() {   
  return (     
    <Routes>       
     
      <Route path="/" element={<MainPage />} />  
      <Route path="/lectii" element={<MainPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/lectii/intro" element={<MainPage />} />        
    </Routes>   
  ); 
}

export default App;