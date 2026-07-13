import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { shopItems } from '../components/shopItems';
import CoinIcon from '../components/CoinIcon';
import '../pages_css/marketplace.css';
import { useWebHaptics } from "web-haptics/react";
import { Heart, Snowflake, ThermometerSnowflake, MountainSnow, Gift, Flame } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import moneymusic from '../assets/ksjsbwuil-cash-register-1-513922.mp3';
import moneykabing from '../assets/shelvis_makes_games-i-see-money-181273.mp3';

export default function Marketplace() {
  const { currentUser, cumparaTema, echipeazaTema, cumparaInima, cumparaStreakFreeze, cumparaTitlu, echipeazaTitlu, revendicaDailyReward } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [mesaj, setMesaj] = useState({ tip: '', text: '' });
  const { trigger } = useWebHaptics();
  const [recompensaAfisata, setRecompensaAfisata] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [timeLeftBooster, setTimeLeftBooster] = useState("");

  const punctePortofel = currentUser?.puncte || 0;
  const temeDeblocate = currentUser?.temeDeblocate || ['theme_default'];
  const temaEchipata = currentUser?.temaEchipata || 'theme_default';

  const inimiCurente = currentUser?.hearts ?? 3;
  const freezeCurente = currentUser?.streakFreezes || 0;

  const titluriDeblocate = currentUser?.titluriDeblocate || [];
  const titluEchipat = currentUser?.titluEchipat || "";

  const aziStr = new Date().toLocaleDateString("en-US");
  const aDatClaimAzi = currentUser?.lastDailyClaim === aziStr;

  usePageTitle("InfoMotion - Marketplace");

  useEffect(() => {
    if (!currentUser?.xp_booster_expires_at) {
      setTimeLeftBooster("");
      return;
    }

    const interval = setInterval(() => {
      const limita = new Date(currentUser.xp_booster_expires_at);
      const acum = new Date();
      const difMs = limita - acum;

      if (difMs <= 0) {
        setTimeLeftBooster("");
        clearInterval(interval);
      } else {
        const minute = Math.floor(difMs / (1000 * 60));
        const secunde = Math.floor((difMs % (1000 * 60)) / 1000);
        setTimeLeftBooster(`${minute}:${secunde < 10 ? '0' : ''}${secunde}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser?.xp_booster_expires_at]);

  const SOUND_VOLUMES = {
  cash: 0.18,
  epic: 0.12,
};

  const playSound = (src, volume = 0.1) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(()=>{});
  };

  const triggerErrorHaptic = () => {
    trigger([
      { duration: 40, intensity: 0.7 },
      { delay: 40, duration: 40, intensity: 0.7 },
      { delay: 40, duration: 40, intensity: 0.9 },
      { delay: 40, duration: 50, intensity: 0.6 },
    ]);
  };

  const triggerSuccessHaptic = () => {
    trigger([
      { duration: 30 },
      { delay: 60, duration: 40, intensity: 1 },
    ]);
  };

  const handleClaimDaily = async () => {
    setDailyLoading(true);
    const res = await revendicaDailyReward();
    setDailyLoading(false);

    if (res.success) {
      triggerSuccessHaptic();
      if (res.rarity === 'epic') {
        playSound(moneykabing);
      } else {
        playSound(moneymusic);
      }

      setRecompensaAfisata({ text: res.message, rarity: res.rarity });
      setTimeout(() => setRecompensaAfisata(null), 12000); // 12 secunde
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', res.error);
    }
  };

  const pacheteInimi = [
    { id: 'heart_1', name: 'Bandage Pack', qty: 1, price: 50, icon: <Heart size={60} color="#ae1e1e" strokeWidth={1.75} />, desc: 'Refill rapid pentru o singură greșeală în quiz.' },
    { id: 'heart_2', name: 'First Aid Kit', qty: 2, price: 100, icon: <Heart size={60} color="#ae1e1e" strokeWidth={1.75} />, desc: 'Siguranță dublă. Perfect pentru lecțiile mai grele.' },
    { id: 'heart_3', name: 'Med Kit', qty: 3, price: 120, icon: <Heart size={60} color="#ae1e1e" strokeWidth={1.75} />, desc: 'Full Refill cu reducere! Te încarcă complet la maxim.' }
  ];

  const pacheteStreak = [
    { id: 'streak_1', name: 'Streak Guard', qty: 1, price: 150, icon: <Snowflake size={60} color="#3498db" strokeWidth={1.75} />, desc: 'Îți salvează streak-ul pentru o singură zi de pauză.' },
    { id: 'streak_3', name: 'Pachet 3 Streak Guard', qty: 3, price: 430, icon: <MountainSnow size={60} color="#3498db" strokeWidth={1.75} />, desc: 'Protecție pentru un weekend prelungit sau vacanță.' },
    { id: 'streak_5', name: 'Mega Streak Guard Pack', qty: 5, price: 610, icon: <ThermometerSnowflake size={60} color="#3498db" strokeWidth={1.75} />, desc: 'Protecție maximă pe termen lung. Cel mai bun raport preț.' }
  ];

  const pacheteTitluri = [
    { id: 'title_coders', name: 'Codul e Legea', price: 300, color: '#f1c40f', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)', desc: 'Pentru cei care dictează regulile în compilator.' },
    { id: 'title_toxic', name: 'Zero Erori', price: 500, color: '#2ecc71', bg: 'linear-gradient(135deg, #27ae60, #2ecc71)', desc: 'Titlu legendar pentru cine scrie cod curat din prima.' },
    { id: 'title_god', name: 'C++ Zeu', price: 800, color: '#e74c3c', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)', desc: 'Stăpânul suprem al algoritmilor și pointerilor.' },
    { id: 'title_noob', name: 'Syntax Error', price: 150, color: '#95a5a6', bg: 'linear-gradient(135deg, #7f8c8d, #95a5a6)', desc: 'Ironic și amuzant, perfect pentru momentele de bug-uri.' },
    { id: 'title_grind', name: 'No Sleep', price: 600, color: '#9b59b6', bg: 'linear-gradient(135deg, #8e44ad, #9b59b6)', desc: 'Dedicat programatorilor care codează până la răsărit.' },
    { id: 'title_jeanG', name: 'Legendary coder', price: 78500, color: '#34495e', bg: 'linear-gradient(135deg, #2c3e50, #34495e)', desc: 'Cel mai bun programator C++ din lume!' }
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
      triggerSuccessHaptic();
      playSound(moneymusic);
      afiseazaMesaj('succes', 'Tema a fost deblocată cu succes! ');
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la tranzacție.");
    }
  };

  const handleEchipeaza = async (id) => {
    setLoadingId(id);
    const rezultat = await echipeazaTema(id);
    setLoadingId(null);

    if (rezultat.success) {
      triggerSuccessHaptic();
      playSound(moneymusic);
      afiseazaMesaj('succes', 'Tema a fost echipată! ');
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', 'Nu s-a putut echipa tema.');
    }
  };

  const handleCumparaPachetInima = async (pachet) => {
    setLoadingId(pachet.id);
    const rezultat = await cumparaInima(pachet.qty, pachet.price);
    setLoadingId(null);

    if (rezultat.success) {
      triggerSuccessHaptic();
      playSound(moneymusic);
      afiseazaMesaj('succes', `Ai achiziționat ${pachet.name}! `);
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la cumpărare.");
    }
  };

  const handleCumparaPachetStreak = async (pachet) => {
    setLoadingId(pachet.id);
    const rezultat = await cumparaStreakFreeze(pachet.qty, pachet.price);
    setLoadingId(null);

    if (rezultat.success) {
      triggerSuccessHaptic();
      playSound(moneymusic);
      afiseazaMesaj('succes', `Ai achiziționat ${pachet.name}! `);
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la cumpărare.");
    }
  };

  const handleCumparaTitlu = async (id, pret) => {
    setLoadingId(id);
    const rezultat = await cumparaTitlu(id, pret);
    setLoadingId(null);
    if (rezultat.success) {
      triggerSuccessHaptic();
      playSound(id === 'title_jeanG' ? moneykabing : moneymusic);
      afiseazaMesaj('succes', 'Titlul de profil a fost cumpărat! ');
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', rezultat?.error || "Eroare la tranzacție.");
    }
  };

  const handleEchipeazaTitlu = async (id) => {
    setLoadingId(id);
    const rezultat = await echipeazaTitlu(id);
    setLoadingId(null);
    if (rezultat.success) {
      triggerSuccessHaptic();
      if (id !== "") playSound(id === 'title_jeanG' ? moneykabing : moneymusic);
      afiseazaMesaj('succes', id === "" ? 'Titlu dezechipat!' : 'Titlul a fost echipat pe profil! 🎭');
    } else {
      triggerErrorHaptic();
      afiseazaMesaj('eroare', 'Nu s-a putut schimba titlul.');
    }
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <div className="market-title-zone">
          <h1 className="market-main-title">InfoMotion<span id="dot">.</span> Marketplace</h1>
          <p className="market-subtitle">Personalizează-ți experiența de codare și asigură-ți progresul.</p>
        </div>

        <div className="wallet-card">
          <CoinIcon size={28} className="wallet-coin-icon" />
          <div className="wallet-info">
            <div className="wallet-label">Portofelul tău</div>
            <div className="wallet-balance">{punctePortofel} <span className="wallet-currency">puncte</span></div>
          </div>
        </div>
      </div>

      {mesaj.text && (
        <div className={`market-alert ${mesaj.tip === 'succes' ? 'alert-success' : 'alert-error'}`}>
          {mesaj.text}
        </div>
      )}

      <div className="daily-reward-card-section">
        {recompensaAfisata && (
          <div className={`daily-reward-banner ${recompensaAfisata.rarity === 'epic' ? 'banner-epic' : 'banner-normal'}`}>
            <Gift size={20} />
            <span>{recompensaAfisata.text}</span>
            <button onClick={() => setRecompensaAfisata(null)} className="banner-close-btn">✕</button>
          </div>
        )}
        <div className="daily-left-box">
          <div className="daily-gift-circle">
            <Gift size={32} className="daily-gift-icon" />
          </div>
          <div>
            <h2 className="daily-title">Daily Reward</h2>
            <p className="daily-desc">
              Revendică recompensa o dată la 24 de ore. Ai șanse la coins bonus sau la un **Epic 2x XP Booster**!
            </p>
          </div>
        </div>

        <div className="daily-right-box">
          {timeLeftBooster && (
            <div className="booster-active-badge">
              <Flame size={18} className="flame-icon-pulse" />
              <span>2x XP Activ: <strong style={{ fontFamily: 'monospace' }}>{timeLeftBooster}</strong></span>
            </div>
          )}

          <button
            onClick={handleClaimDaily}
            disabled={aDatClaimAzi || dailyLoading}
            className={`daily-claim-btn ${aDatClaimAzi ? 'daily-claimed' : 'daily-ready'}`}
          >
            {dailyLoading ? (
              "Se deschide..."
            ) : aDatClaimAzi ? (
              "Revendicat ✓"
            ) : (
              "Deschide Surpriza 🎁"
            )}
          </button>
        </div>
      </div>

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

      <div className="market-section-divider" style={{ marginTop: '50px' }}>
        <h2 className="market-section-title">Pachete Inimi Quiz (Actual: {inimiCurente}/3 )</h2>
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

      <div className="market-section-divider" style={{ marginTop: '50px' }}>
        <h2 className="market-section-title">Pachete Streak Freeze (Inventar: {freezeCurente}/6 )</h2>
        <div className="market-section-line"></div>
      </div>

      <div className="market-grid">
        {pacheteStreak.map((pachet) => {
          const areDestulePuncte = punctePortofel >= pachet.price;
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

      <div className="market-section-divider" style={{ marginTop: '50px' }}>
        <h2 className="market-section-title">Titluri de Profil Legendare</h2>
        <div className="market-section-line"></div>
      </div>

      <div className="market-grid">
        {pacheteTitluri.map((titlu) => {
          const esteDeblocat = titluriDeblocate.includes(titlu.id);
          const esteEchipat = titluEchipat === titlu.id;
          const areDestulePuncte = punctePortofel >= titlu.price;
          const seIncarca = loadingId === titlu.id;

          return (
            <div key={titlu.id} className={`shop-card ${esteEchipat ? 'card-equipped' : ''}`}>
              <div className="card-top-content">
                <div className="theme-preview-row">
                  <div className="title-brawl-badge" style={{ background: titlu.bg }}>
                    {titlu.name}
                  </div>
                </div>
                <p className="theme-description" style={{ marginTop: '12px' }}>{titlu.desc}</p>
              </div>

              <div className="card-actions">
                {esteEchipat ? (
                  <button onClick={() => handleEchipeazaTitlu("")} disabled={seIncarca} className="btn-shop btn-equipped">
                    {seIncarca ? 'Se procesează...' : 'Dezechipează'}
                  </button>
                ) : esteDeblocat ? (
                  <button onClick={() => handleEchipeazaTitlu(titlu.id)} disabled={seIncarca} className="btn-shop btn-unlock">
                    {seIncarca ? 'Se aplică...' : 'Echipează Titlu'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCumparaTitlu(titlu.id, titlu.price)}
                    disabled={!areDestulePuncte || seIncarca}
                    className={`btn-shop ${areDestulePuncte ? 'btn-buy-active' : 'btn-buy-disabled'}`}
                  >
                    {seIncarca ? 'Se procesează...' : areDestulePuncte ? (
                      <>Cumpără cu {titlu.price} <CoinIcon size={16} className="button-coin-icon" /></>
                    ) : (
                      <>Puncte insuficiente ({titlu.price} <CoinIcon size={16} className="button-coin-icon" />)</>
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