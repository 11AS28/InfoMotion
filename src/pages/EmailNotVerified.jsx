import React from 'react';
import { Link } from 'react-router-dom';
import "../pages_css/EmailNotVerified.css";
import usePageTitle from '../hooks/usePageTitle';

function EmailNotVerified() {
  return (
    <>
      {usePageTitle("Email Neverificat")}

      <div className="email-not-verified-container">
        <div className="email-not-verified-card">
          <div className="email-not-verified-badge">Acces restricționat</div>
          <h1>Email Neverificat</h1>
          <p>
            Te rugăm să verifici adresa de email pentru a accesa toate
            funcționalitățile platformei InfoMotion.
          </p>

          <div className="email-not-verified-actions">
            <Link to="/auth" className="back-to-login">
              Înapoi la autentificare
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmailNotVerified;