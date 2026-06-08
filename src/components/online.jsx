import React, { useState, useEffect } from 'react';
import '../components_css/online.css';

function Online() {
  const [status, setStatus] = useState(null); // Va fi 'online' sau 'offline'
  const [visible, setVisible] = useState(false); // Controlează dacă popup-ul are clasa 'show'

  useEffect(() => {
    let timeoutId;

    // Funcția care declanșează popup-ul
    const showPopup = (newStatus) => {
      setStatus(newStatus);
      setVisible(true);
      
      // Dacă există deja un timer în derulare, îl oprim pentru a nu se suprapune
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    // Handler-ele pentru evenimente
    const handleOnline = () => showPopup('online');
    const handleOffline = () => showPopup('offline');

    // Adăugăm event listeners când componenta este montată
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Funcția de cleanup (se rulează când componenta este demontată)
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Dacă nu am primit încă niciun eveniment, putem alege să nu afișăm textul deloc inițial
  const mesaj = status === 'online' 
    ? 'Ești din nou conectat la internet!' 
    : 'Nu mai ești conectat la internet!';

  return (
    <div className={`popup ${visible ? 'show' : ''} ${status || ''}`} id="popup">
      {status ? mesaj : ''}
    </div>
  );
}

export default Online;