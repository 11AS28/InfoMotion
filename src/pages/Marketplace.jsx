import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { shopItems } from '../components/shopItems';
import CoinIcon from '../components/CoinIcon'; // <- Importăm noua monedă
import '../pages_css/marketplace.css'; 

export default function Marketplace() {
  const { currentUser, cumparaTema, echipeazaTema } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [mesaj, setMesaj] = useState({ tip: '', text: '' });

  const punctePortofel = currentUser?.puncte || 0;
  const temeDeblocate = currentUser?.temeDeblocate || ['theme_default'];
  const temaEchipata = currentUser?.temaEchipata || 'theme_default';

  const afiseazaMesaj = (tip, text) => {
    setMesaj({ tip, text });
    setTimeout(() => setMesaj({ tip: '', text: '' }), 4000);
  };

  const handleCumpara = async (id, pret) => {
    setLoadingId(id);
    const rezultat = await cumparaTema(id, pret);
    setLoadingId(null);

    if (rezultat.success) {
      afiseazaMesaj('succes', 'Tema a fost deblocată cu succes! ');
    } else {
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la tranzacție.");
    }
  };

  const handleEchipeaza = async (id) => {
    setLoadingId(id);
    const rezultat = await echipeazaTema(id);
    setLoadingId(null);

    if (rezultat.success) {
      afiseazaMesaj('succes', 'Tema a fost echipată! ');
    } else {
      afiseazaMesaj('eroare', 'Nu s-a putut echipa tema.');
    }
  };

  return (
    <div className="market-container">
      {/* Header Magazin */}
      <div className="market-header">
        <div className="market-title-zone">
          <h1 className="market-main-title">InfoMotion<span id="dot">.</span> Marketplace</h1>
          <p className="market-subtitle">Personalizează-ți experiența de codare folosind punctele acumulate.</p>
        </div>
        
        {/* Soldul de puncte */}
        <div className="wallet-card">
          {/* Schimbat emoji cu SVG-ul custom */}
          <CoinIcon size={28} className="wallet-coin-icon" /> 
          <div className="wallet-info">
            <div className="wallet-label">Portofelul tău</div>
            <div className="wallet-balance">{punctePortofel} <span className="wallet-currency">puncte</span></div>
          </div>
        </div>
      </div>

      {/* Alerte de feedback */}
      {mesaj.text && (
        <div className={`market-alert ${mesaj.tip === 'succes' ? 'alert-success' : 'alert-error'}`}>
          {mesaj.text}
        </div>
      )}

      {/* Grid-ul de produse */}
      <div className="market-grid">
        {shopItems.map((item) => {
          const esteDeblocata = temeDeblocate.includes(item.id);
          const esteEchipata = temaEchipata === item.id;
          const areDestulePuncte = punctePortofel >= item.price;
          const seIncarca = loadingId === item.id;

          return (
            <div 
              key={item.id} 
              className={`shop-card ${esteEchipata ? 'card-equipped' : ''}`}
            >
              <div className="card-top-content">
                {/* Preview cerc colorat */}
                <div className="theme-preview-row">
                  <div 
                    className="color-preview-box" 
                    style={{ backgroundColor: item.previewColor }}
                  />
                  <div>
                    <h3 className="theme-card-name">{item.name}</h3>
                    <span className="theme-category-tag">{item.category}</span>
                  </div>
                </div>

                <p className="theme-description">{item.description}</p>
              </div>

              {/* Zona de Acțiune / Butoane */}
              <div className="card-actions">
                {esteEchipata ? (
                  <button disabled className="btn-shop btn-equipped">
                     Echipată curent
                  </button>
                ) : esteDeblocata ? (
                  <button
                    onClick={() => handleEchipeaza(item.id)}
                    disabled={seIncarca}
                    className="btn-shop btn-unlock"
                  >
                    {seIncarca ? 'Se aplică...' : 'Echipează Tema'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCumpara(item.id, item.price)}
                    disabled={!areDestulePuncte || seIncarca}
                    className={`btn-shop ${areDestulePuncte ? 'btn-buy-active' : 'btn-buy-disabled'}`}
                  >
                    {seIncarca ? (
                      'Se procesează...'
                    ) : areDestulePuncte ? (
                      <>Cumpără cu {item.price} <CoinIcon size={16} className="button-coin-icon" /></>
                    ) : (
                      <>Puncte insuficiente ({item.price} <CoinIcon size={16} className="button-coin-icon" />)</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}