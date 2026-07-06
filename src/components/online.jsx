import React, { useState, useEffect } from 'react';
import '../components_css/online.css';

function Online() {
  const [status, setStatus] = useState(null);  
  const [visible, setVisible] = useState(false); 

  useEffect(() => {
    let timeoutId;

    
    const showPopup = (newStatus) => {
      setStatus(newStatus);
      setVisible(true);
      
    if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    const handleOnline = () => showPopup('online');
    const handleOffline = () => showPopup('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

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