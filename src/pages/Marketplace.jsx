import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { shopItems } from '../components/shopItems';
import CoinIcon from '../components/CoinIcon'; 
import '../pages_css/marketplace.css'; 

export default function Marketplace() {
  const { currentUser, cumparaTema, echipeazaTema, cumparaInima, cumparaStreakFreeze } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [mesaj, setMesaj] = useState({ tip: '', text: '' });

  const punctePortofel = currentUser?.puncte || 0;
  const temeDeblocate = currentUser?.temeDeblocate || ['theme_default'];
  const temaEchipata = currentUser?.temaEchipata || 'theme_default';
  
  const inimiCurente = currentUser?.hearts ?? 3;
  const freezeCurente = currentUser?.streakFreezes || 0;

  // Definim Pachetele de Inimi (exact prețurile tale)
  const pacheteInimi = [
    { id: 'heart_1', name: 'O Inimă', qty: 1, price: 50, icon: '❤️', desc: 'Refill rapid pentru o singură greșeală în quiz.' },
    { id: 'heart_2', name: 'Pachet Mic Inimi', qty: 2, price: 100, icon: '❣️', desc: 'Siguranță dublă. Perfect pentru lecțiile mai grele.' },
    { id: 'heart_3', name: 'Pachet Maxim Inimi', qty: 3, price: 120, icon: '💖', desc: 'Full Refill cu reducere! Te încarcă complet la maxim.' }
  ];

  // Definim Pachetele de Streak Freeze (exact prețurile tale)
  const pacheteStreak = [
    { id: 'streak_1', name: 'Scut Simplu', qty: 1, price: 150, icon: '❄️', desc: 'Îți salvează streak-ul pentru o singură zi de pauză.' },
    { id: 'streak_3', name: 'Pachet 3 Scuturi', qty: 3, price: 430, icon: '🥶', desc: 'Protecție pentru un weekend prelungit sau vacanță.' },
    { id: 'streak_5', name: 'Mega Scut Pack', qty: 5, price: 610, icon: '🏔️', desc: 'Protecție maximă pe termen lung. Cel mai bun raport preț.' }
  ];

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

  const handleCumparaPachetInima = async (pachet) => {
    setLoadingId(pachet.id);
    const rezultat = await cumparaInima(pachet.qty, pachet.price);
    setLoadingId(null);

    if (rezultat.success) {
      afiseazaMesaj('succes', `Ai achiziționat ${pachet.name}! ❤️`);
    } else {
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la cumpărare.");
    }
  };

  const handleCumparaPachetStreak = async (pachet) => {
    setLoadingId(pachet.id);
    const rezultat = await cumparaStreakFreeze(pachet.qty, pachet.price);
    setLoadingId(null);

    if (rezultat.success) {
      afiseazaMesaj('succes', `Ai achiziționat ${pachet.name}! ❄️`);
    } else {
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la cumpărare.");
    }
  };

  return (
    <div className="market-container">
      {/* Header Magazin */}
      <div className="market-header">
        <div className="market-title-zone">
          <h1 className="market-main-title">InfoMotion<span id="dot">.</span> Marketplace</h1>
          <p className="market-subtitle">Personalizează-ți experiența de codare și asigură-ți progresul.</p>
        </div>
        
        {/* Portofel */}
        <div className="wallet-card">
          <CoinIcon size={28} className="wallet-coin-icon" /> 
          <div className="wallet-info">
            <div className="wallet-label">Portofelul tău</div>
            <div className="wallet-balance">{punctePortofel} <span className="wallet-currency">puncte</span></div>
          </div>
        </div>
      </div>

      {/* Alerte */}
      {mesaj.text && (
        <div className={`market-alert ${mesaj.tip === 'succes' ? 'alert-success' : 'alert-error'}`}>
          {mesaj.text}
        </div>
      )}

      {/* CATEGORIA 1: TEME EDITOR */}
      <div className="market-section-divider">
        <h2 className="market-section-title">Personalizare Editor</h2>
        <div className="market-section-line"></div>
      </div>

      <div className="market-grid">
        {shopItems.map((item) => {
          const esteDeblocata = temeDeblocate.includes(item.id);
          const esteEchipata = temaEchipata === item.id;
          const areDestulePuncte = punctePortofel >= item.price;
          const seIncarca = loadingId === item.id;

          return (
            <div key={item.id} className={`shop-card ${esteEchipata ? 'card-equipped' : ''}`}>
              <div className="card-top-content">
                <div className="theme-preview-row">
                  <div className="color-preview-box" style={{ backgroundColor: item.previewColor }} />
                  <div>
                    <h3 className="theme-card-name">{item.name}</h3>
                    <span className="theme-category-tag">{item.category}</span>
                  </div>
                </div>
                <p className="theme-description">{item.description}</p>
              </div>

              <div className="card-actions">
                {esteEchipata ? (
                  <button disabled className="btn-shop btn-equipped">Echipată curent</button>
                ) : esteDeblocata ? (
                  <button onClick={() => handleEchipeaza(item.id)} disabled={seIncarca} className="btn-shop btn-unlock">
                    {seIncarca ? 'Se aplică...' : 'Echipează Tema'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCumpara(item.id, item.price)}
                    disabled={!areDestulePuncte || seIncarca}
                    className={`btn-shop ${areDestulePuncte ? 'btn-buy-active' : 'btn-buy-disabled'}`}
                  >
                    {seIncarca ? 'Se procesează...' : areDestulePuncte ? (
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

      {/* CATEGORIA 2: PACHETE INIMI */}
      <div className="market-section-divider" style={{ marginTop: '50px' }}>
        <h2 className="market-section-title">Pachete Inimi Quiz (Actual: {inimiCurente}/3 ❤️)</h2>
        <div className="market-section-line"></div>
      </div>

      <div className="market-grid">
        {pacheteInimi.map((pachet) => {
          const areDestulePuncte = punctePortofel >= pachet.price;
          const atingeMaximul = inimiCurente + pachet.qty > 3;
          const seIncarca = loadingId === pachet.id;

          return (
            <div key={pachet.id} className="shop-card">
              <div className="card-top-content">
                <div className="theme-preview-row">
                  <div className="color-preview-box functional-heart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: '#fa52521a' }}>
                    {pachet.icon}
                  </div>
                  <div>
                    <h3 className="theme-card-name">{pachet.name}</h3>
                    <span className="theme-category-tag functional">+{pachet.qty} {pachet.qty === 1 ? 'INIMĂ' : 'INIMI'}</span>
                  </div>
                </div>
                <p className="theme-description">{pachet.desc}</p>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => handleCumparaPachetInima(pachet)}
                  disabled={!areDestulePuncte || atingeMaximul || seIncarca}
                  className={`btn-shop ${areDestulePuncte && !atingeMaximul ? 'btn-buy-active' : 'btn-buy-disabled'}`}
                >
                  {seIncarca ? 'Se încarcă...' : atingeMaximul ? 'Depășește maximul (3)' : areDestulePuncte ? (
                    <>Cumpără cu {pachet.price} <CoinIcon size={16} className="button-coin-icon" /></>
                  ) : (
                    <>Puncte insuficiente ({pachet.price} <CoinIcon size={16} className="button-coin-icon" />)</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CATEGORIA 3: PACHETE STREAK FREEZE */}
      

      {/* CATEGORIA 3: PACHETE STREAK FREEZE */}
<div className="market-section-divider" style={{ marginTop: '50px' }}>
  <h2 className="market-section-title">Pachete Streak Freeze (Inventar: {freezeCurente}/6 ❄️)</h2>
  <div className="market-section-line"></div>
</div>

<div className="market-grid">
  {pacheteStreak.map((pachet) => {
    const areDestulePuncte = punctePortofel >= pachet.price;
    // VERIFICARE LIMITĂ ÎN INTERFAȚĂ: Blochează pachetul dacă depășește 6 scuturi
    const atingeMaximul = freezeCurente + pachet.qty > 6;
    const seIncarca = loadingId === pachet.id;

    return (
      <div key={pachet.id} className="shop-card">
        <div className="card-top-content">
          <div className="theme-preview-row">
            <div className="color-preview-box functional-freeze" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: '#22b8cf1a' }}>
              {pachet.icon}
            </div>
            <div>
              <h3 className="theme-card-name">{pachet.name}</h3>
              <span className="theme-category-tag functional">+{pachet.qty} {pachet.qty === 1 ? 'SCUT' : 'SCUTURI'}</span>
            </div>
          </div>
          <p className="theme-description">{pachet.desc}</p>
        </div>
        <div className="card-actions">
          <button
            onClick={() => handleCumparaPachetStreak(pachet)}
            // Butonul devine inactiv dacă nu are puncte, dacă e în loading sau dacă depășește limita de 6
            disabled={!areDestulePuncte || atingeMaximul || seIncarca}
            className={`btn-shop ${areDestulePuncte && !atingeMaximul ? 'btn-buy-active' : 'btn-buy-disabled'}`}
          >
            {seIncarca ? (
              'Se procesează...'
            ) : atingeMaximul ? (
              'Depășește maximul (6)'
            ) : areDestulePuncte ? (
              <>Cumpără cu {pachet.price} <CoinIcon size={16} className="button-coin-icon" /></>
            ) : (
              <>Puncte insuficiente ({pachet.price} <CoinIcon size={16} className="button-coin-icon" />)</>
            )}
          </button>
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}